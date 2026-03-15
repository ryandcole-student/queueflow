/**
 * server/index.js — Express Backend
 *
 * Run (development):
 *   node server/index.js
 *
 * Run (production):
 *   NODE_ENV=production node server/index.js
 *   The server will also serve the React build from ../build
 *
 * Environment variables:
 *   PORT        - HTTP port (default: 4000)
 *   JWT_SECRET  - Secret for signing JWTs (required in production)
 *   CORS_ORIGIN - Allowed CORS origin (default: http://localhost:3000)
 *   DB_PATH     - Path to SQLite database file (default: ./queueflow.db)
 */

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path     = require('path');

const app = express();
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, 'queueflow.db');
const db         = new Database(DB_PATH);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const PORT       = process.env.PORT || 4000;
const IS_PROD    = process.env.NODE_ENV === 'production';

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

if (IS_PROD && JWT_SECRET === 'change-me-in-production') {
  console.warn(
    'WARNING: JWT_SECRET is set to the insecure default value. ' +
    'Set a strong, random JWT_SECRET environment variable before deploying.'
  );
}

// ── DB Schema ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'staff',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    number      TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    service     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'waiting',
    issued_by   INTEGER REFERENCES users(id),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    served_at   DATETIME NULL
  
  );
`);

// Seed default admin if not exists
const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!existing) {
  db.prepare(
    'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)'
  ).run('admin', bcrypt.hashSync('admin123', 10), 'Admin User', 'admin');
  db.prepare(
    'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)'
  ).run('staff', bcrypt.hashSync('staff123', 10), 'Staff Member', 'staff');
}

// ── Counter helper ─────────────────────────────────────────────────────────
function nextTicketNumber(prefix = 'Q') {
  const row = db.prepare(
    "SELECT number FROM tickets WHERE number LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${prefix}-%`);

  if (!row) return `${prefix}-1001`;
  const last = parseInt(row.number.split('-')[1], 10);
  return `${prefix}-${last + 1}`;
}

// ── Auth middleware ────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const { password_hash, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: safeUser });
});

// GET /api/tickets
app.get('/api/tickets', requireAuth, (req, res) => {
  const tickets = db.prepare(
    'SELECT * FROM tickets ORDER BY created_at DESC'
  ).all();
  res.json(tickets);
});

// GET /api/ticket/:number
app.get('/api/tickets/:number', (req, res) => {
  const { number } = req.params;

  try {

    // 1. Get ticket
    const ticket = db.prepare(`
      SELECT *
      FROM tickets
      WHERE number = ?
    `).get(number);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 2. Count tickets ahead in queue
    const ahead = db.prepare(`
      SELECT COUNT(*) AS count
      FROM tickets
      WHERE status = 'waiting'
      AND created_at < ?
    `).get(ticket.created_at).count+1;

    // 3. Average service time in seconds
    const avg = db.prepare(`
      SELECT AVG(strftime('%s', served_at) - strftime('%s', created_at)) AS avg_seconds
      FROM tickets
      WHERE served_at IS NOT NULL
    `).get();

    const avgSeconds = avg.avg_seconds || 1;

    // 4. Estimated wait
    const estimatedWaitSeconds = ahead * avgSeconds;

    res.json({
      ticket,
      queue_position: ahead + 1,
      tickets_ahead: ahead,
      avg_service_time_seconds: avgSeconds,
      estimated_wait_seconds: estimatedWaitSeconds,
      estimated_wait_minutes: estimatedWaitSeconds / 60
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tickets
app.post('/api/tickets', requireAuth, (req, res) => {
  const { name, service, prefix } = req.body;
  if (!name || !service) return res.status(400).json({ error: 'name and service required' });

  const number = nextTicketNumber(prefix || 'Q');
  const stmt   = db.prepare(
    'INSERT INTO tickets (number, name, service, issued_by) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(number, name, service, req.user.id);
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id/status
app.patch('/api/tickets/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['waiting', 'serving', 'done', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, req.params.id);
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if(status === 'done') {
    db.prepare('UPDATE tickets SET served_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  }
  res.json(ticket);
});

// DELETE /api/tickets/:id
app.delete('/api/tickets/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Serve React build in production ───────────────────────────────────────
if (IS_PROD) {
  const buildDir = path.join(__dirname, '..', 'build');
  app.use(express.static(buildDir));
  // Catch-all: send React's index.html for any non-API route
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`QueueFlow API running on :${PORT}`));
