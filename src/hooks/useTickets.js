/**
 * hooks/useTickets.js
 * Manages ticket CRUD state + API calls.
 */
import { useState, useCallback, useEffect } from 'react';
import {
  getTickets,
  createTicket as apiCreate,
  updateTicketStatus as apiUpdate,
  deleteTicket as apiDelete,
} from '../api';

export function useTickets() {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Load on mount
  useEffect(() => {
    getTickets()
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  const addTicket = useCallback(async (payload) => {
    const ticket = await apiCreate(payload);
    setTickets(prev => [ticket, ...prev]);
    return ticket;
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    const updated = await apiUpdate(id, status);
    setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
  }, []);

  const removeTicket = useCallback(async (id) => {
    await apiDelete(id);
    setTickets(prev => prev.filter(t => t.id !== id));
  }, []);

  // Derived stats
  const stats = {
    total:   tickets.length,
    waiting: tickets.filter(t => t.status === 'waiting').length,
    serving: tickets.filter(t => t.status === 'serving').length,
    done:    tickets.filter(t => t.status === 'done').length,
  };

  return { tickets, loading, stats, addTicket, changeStatus, removeTicket };
}
