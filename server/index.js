/**
 * server/index.js — Express Backend
 *
 * Install deps:
 *   npm install express cors bcryptjs jsonwebtoken better-sqlite3
 *
 * Run:
 *   node server/index.js
 *
 * Then point src/api/index.js at http://localhost:4000/api
 */

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const db  = new Database('./queueflow.db');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

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
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  
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
  res.json(ticket);
});

// DELETE /api/tickets/:id
app.delete('/api/tickets/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`QueueFlow API running on :${PORT}`));
