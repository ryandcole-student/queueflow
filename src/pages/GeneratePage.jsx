/**
 * pages/GeneratePage.jsx
 */
import React, { useState } from 'react';
import { TicketCard } from '../components/TicketCard';
import { SERVICES, TICKET_PREFIXES } from '../api';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  formPanel: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
  },
  previewPanel: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  previewLabel: {
    fontSize: '0.78rem',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  empty: {
    textAlign: 'center',
    color: 'var(--muted)',
    padding: '2rem 0',
  },
  emptyIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  qrNote: {
    fontSize: '0.75rem',
    color: 'var(--muted)',
    textAlign: 'center',
  },
};

export function GeneratePage({ user, onGenerate }) {
  const [form, setForm] = useState({
    name:    '',
    service: SERVICES[0],
    prefix:  'Q',
  });
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const newTicket = await onGenerate({
        name:     form.name.trim(),
        service:  form.service,
        prefix:   form.prefix,
        issuedBy: user.name,
      });
      setTicket(newTicket);
      setForm(f => ({ ...f, name: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Generate Ticket</div>
      <div className="page-sub">Issue a new queue ticket with QR code</div>

      <div style={styles.grid}>
        {/* Form */}
        <div style={styles.formPanel}>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Service Type</label>
            <select
              className="form-select"
              name="service"
              value={form.service}
              onChange={handleChange}
            >
              {SERVICES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ticket Prefix</label>
            <select
              className="form-select"
              name="prefix"
              value={form.prefix}
              onChange={handleChange}
            >
              {TICKET_PREFIXES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !form.name.trim()}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Generating…' : '✦ Generate Ticket'}
          </button>
        </div>

        {/* Preview */}
        <div style={styles.previewPanel}>
          <span style={styles.previewLabel}>Ticket Preview</span>

          {ticket ? (
            <>
              <TicketCard ticket={ticket} />
              <p style={styles.qrNote}>
                QR encodes ticket ID, name, service &amp; timestamp
              </p>
            </>
          ) : (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🎫</div>
              <p style={{ fontSize: '0.9rem' }}>
                Fill in the form and generate a ticket
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 700px) {
          .gen-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
