# QueueFlow — Virtual Queue Management System

A React + Express prototype for issuing queue tickets with QR codes.

---

## Project Structure

```
queueflow/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── index.js          # API layer (axios calls to backend)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TicketCard.jsx    # Printable ticket + QR code
│   │   └── Toast.jsx
│   ├── hooks/
│   │   ├── useAuth.js        # Login / logout / session
│   │   └── useTickets.js     # Ticket CRUD + derived stats
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GeneratePage.jsx
│   │   └── QueuePage.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── index.js
├── server/
│   └── index.js              # Express + SQLite backend
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # One-command deployment
└── package.json
```

---

## Local Development

### Frontend + Backend (split terminals)

```bash
# Terminal 1 — React dev server (port 3000)
npm install
npm start

# Terminal 2 — Express API server (port 4000)
node server/index.js
```

Demo credentials:
- `admin / admin123`
- `staff / staff123`

---

## Deployment

### Option 1 — Docker Compose (recommended)

Requires [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/).

```bash
# 1. Copy the environment template and set a strong JWT secret
cp .env.example .env
# Edit .env and change JWT_SECRET to a long, random string

# 2. Build the image and start the container
docker compose up -d

# 3. Open the app
open http://localhost:4000
```

The SQLite database is stored in a Docker-managed volume (`queueflow_data`) so it persists across container restarts and upgrades.

To update to a new version:

```bash
docker compose pull   # or: docker compose build
docker compose up -d
```

### Option 2 — Manual (Node.js + PM2)

Requires Node.js 18+ and [PM2](https://pm2.keymetrics.io/).

```bash
# Install dependencies and build the React frontend
npm install
npm run build

# Start the production server (serves both API and React build)
NODE_ENV=production JWT_SECRET=<your-secret> npm run start:prod
```

With PM2 for process management and auto-restart:

```bash
npm install -g pm2

NODE_ENV=production JWT_SECRET=<your-secret> \
  pm2 start server/index.js --name queueflow

pm2 save
pm2 startup   # generates a systemd/init script to start on boot
```

### Environment Variables

| Variable      | Default                    | Description                                       |
|---------------|----------------------------|---------------------------------------------------|
| `PORT`        | `4000`                     | HTTP port the server listens on                   |
| `JWT_SECRET`  | `change-me-in-production`  | Secret for signing JWTs — **change in production** |
| `CORS_ORIGIN` | `http://localhost:3000`    | Allowed CORS origin (only used in production mode) |
| `DB_PATH`     | `./server/queueflow.db`    | Path to the SQLite database file                  |
| `NODE_ENV`    | *(unset)*                  | Set to `production` to serve the React build      |

### CI/CD (GitHub Actions)

The repository includes two workflows:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| **CI** (`.github/workflows/ci.yml`) | Every push / PR to `main` | Installs deps, builds React, verifies the server starts |
| **Docker** (`.github/workflows/docker.yml`) | Push to `main` or version tags | Builds and pushes the Docker image to GitHub Container Registry |

The Docker image is published to `ghcr.io/<owner>/queueflow` and tagged with the branch name, semver tags, and the commit SHA.

---

## API Endpoints

| Method | Path                        | Auth | Description            |
|--------|-----------------------------|------|------------------------|
| GET    | /api/health                 | —    | Health check           |
| POST   | /api/auth/login             | —    | Login, returns JWT     |
| GET    | /api/tickets                | JWT  | List all tickets       |
| POST   | /api/tickets                | JWT  | Create ticket + QR     |
| PATCH  | /api/tickets/:id/status     | JWT  | Update ticket status   |
| DELETE | /api/tickets/:id            | JWT  | Remove a ticket        |

---

## Features

- **Login** with JWT-backed auth (bcrypt passwords)
- **Dashboard** — live stats (waiting / serving / done)
- **Generate Ticket** — customer name, service type, prefix → ticket + QR code
- **Queue Manager** — filter by status, advance through Waiting → Serving → Done
- **QR Code** — encodes ticket number, name, service, and timestamp (via `qrcode.react`)
