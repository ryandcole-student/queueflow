/**
 * api/index.js
 *
 * Simulated in-memory API that mirrors a real Express + DB backend.
 * Replace each function body with an axios call to your server:
 *
 *   import axios from 'axios';
 *   const API = axios.create({ baseURL: 'http://localhost:4000/api' });
 *
 *   export async function login(username, password) {
 *     const { data } = await API.post('/auth/login', { username, password });
 *     return data;   // { token, user }
 *   }
 */

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    get Authorization() {
      return `Bearer ${localStorage.getItem('qf_token')}`;
    },
  },
});

// ── Seed data ──────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User',   role: 'admin' },
  { id: 2, username: 'staff', password: 'staff123', name: 'Staff Member', role: 'staff' },
];

let ticketsStore = [];
let ticketCounter = 1000;

function nextTicketNumber(prefix = 'Q') {
  ticketCounter += 1;
  return `${prefix}-${ticketCounter}`;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export async function login(username, password) {
  const { data } = await API.post('/auth/login', { username, password });
  return data;
}

// ── Tickets ────────────────────────────────────────────────────────────────
export async function getTickets() {
  const { data } = await API.get('/tickets');
  return data;
}

export async function createTicket({ name, service, prefix, issuedBy }) {
  const { data } = await API.post('/tickets', {name, service, prefix, issuedBy});
  return data;
}

export async function updateTicketStatus(id, status) {
  const { data } = await API.patch(`/tickets/${id}/status`, { status });
  return data;
}

export async function deleteTicket(id) {
 await API.delete(`/tickets/${id}`);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const SERVICES = [
  'General Inquiry',
  'Account Services',
  'Technical Support',
  'Billing',
  'Registration',
];

export const TICKET_PREFIXES = [
  { value: 'Q', label: 'Q — General' },
  { value: 'A', label: 'A — Priority' },
  { value: 'B', label: 'B — VIP' },
  { value: 'S', label: 'S — Support' },
];
