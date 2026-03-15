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
│   │   └── index.js          # API layer (swap mock → real axios calls)
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
└── package.json
```

---

## Frontend Setup

```bash
npm install
npm start
```

Demo credentials:
- `admin / admin123`
- `staff / staff123`

---

## Backend Setup (Express)

```bash
cd server
npm install express cors bcryptjs jsonwebtoken better-sqlite3
node index.js
```

The server runs on `http://localhost:4000`.

### Connecting Frontend → Backend

Open `src/api/index.js` and replace the mock functions with real axios calls:

```js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    get Authorization() {
      return `Bearer ${localStorage.getItem('qf_token')}`;
    },
  },
});

export async function login(username, password) {
  const { data } = await API.post('/auth/login', { username, password });
  return data;
}

export async function getTickets() {
  const { data } = await API.get('/tickets');
  return data;
}

export async function createTicket(payload) {
  const { data } = await API.post('/tickets', payload);
  return data;
}

export async function updateTicketStatus(id, status) {
  const { data } = await API.patch(`/tickets/${id}/status`, { status });
  return data;
}

export async function deleteTicket(id) {
  await API.delete(`/tickets/${id}`);
}
```

---

## API Endpoints

| Method | Path                        | Auth | Description            |
|--------|-----------------------------|------|------------------------|
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
