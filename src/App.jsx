/**
 * App.jsx — root component
 *
 * Wires together auth, routing (manual state-based), tickets,
 * and the shell layout (Navbar + Sidebar).
 */
import React, { useState } from 'react';

import { useAuth }    from './hooks/useAuth';
import { useTickets } from './hooks/useTickets';
import { useToast, Toast } from './components/Toast';
import { Navbar }  from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage }     from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratePage }  from './pages/GeneratePage';
import { QueuePage }     from './pages/QueuePage';

import './styles/global.css';

const shell = {
  app:     { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  main:    { display: 'flex', flex: 1 },
  content: { flex: 1, padding: '2rem', overflowY: 'auto' },
};

export default function App() {
  const { user, login, logout } = useAuth();
  const { tickets, stats, addTicket, changeStatus, removeTicket } = useTickets();
  const { toast, showToast } = useToast();
  const [page, setPage] = useState('dashboard');

  /* ── Not logged in ─────────────────────────────── */
  if (!user) {
    return (
      <>
        <LoginPage onLogin={login} />
        <Toast message={toast} />
      </>
    );
  }

  /* ── Generate ticket handler ───────────────────── */
  const handleGenerate = async (payload) => {
    const ticket = await addTicket(payload);
    showToast(`Ticket ${ticket.number} issued for ${ticket.name}`);
    return ticket;
  };

  /* ── Queue status handler ──────────────────────── */
  const handleStatusChange = async (id, status) => {
    await changeStatus(id, status);
    const labels = { serving: 'Now serving!', done: 'Ticket completed.' };
    showToast(labels[status] || 'Status updated.');
  };

  /* ── Cancel/remove handler ─────────────────────── */
  const handleRemove = async (id) => {
    await removeTicket(id);
    showToast('Ticket cancelled.');
  };

  /* ── Logged-in shell ───────────────────────────── */
  return (
    <div style={shell.app}>
      <Navbar user={user} onLogout={logout} />

      <div style={shell.main}>
        <Sidebar activePage={page} onNavigate={setPage} />

        <main style={shell.content}>
          {page === 'dashboard' && (
            <DashboardPage tickets={tickets} stats={stats} />
          )}
          {page === 'generate' && (
            <GeneratePage user={user} onGenerate={handleGenerate} />
          )}
          {page === 'queue' && (
            <QueuePage
              tickets={tickets}
              onStatusChange={handleStatusChange}
              onRemove={handleRemove}
            />
          )}
        </main>
      </div>

      <Toast message={toast} />
    </div>
  );
}
