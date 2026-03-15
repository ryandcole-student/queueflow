/**
 * components/TicketCard.jsx
 *
 * Renders a printable ticket with embedded QR code.
 * Uses qrcode.react for QR generation.
 */
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const styles = {
  wrapper: {
    background: '#fff',
    borderRadius: 12,
    padding: '1.5rem',
    width: '100%',
    maxWidth: 280,
    textAlign: 'center',
    color: '#1a1a2e',
    fontFamily: "'Syne', sans-serif",
  },
  header: {
    fontWeight: 800,
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6b63cc',
    marginBottom: '0.4rem',
  },
  number: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '2.6rem',
    fontWeight: 500,
    color: '#1a1a2e',
    lineHeight: 1,
    marginBottom: '0.2rem',
  },
  service: {
    fontSize: '0.85rem',
    color: '#555',
    marginBottom: '1rem',
  },
  divider: {
    border: 'none',
    borderTop: '1.5px dashed #ddd',
    margin: '0.75rem 0',
  },
  qrWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  meta: {
    fontSize: '0.75rem',
    color: '#888',
    lineHeight: 1.6,
  },
  metaName: {
    fontWeight: 700,
    color: '#333',
  },
};

export function TicketCard({ ticket }) {
  if (!ticket) return null;

  // QR payload — replace with your real ticket URL in production:
  // e.g. `https://yourapp.com/queue/check/${ticket.number}`
/*  const qrValue = JSON.stringify({
    ticket:  ticket.number,
    name:    ticket.name,
    service: ticket.service,
    time:    ticket.time,
    date:    ticket.date,
  });
*/

const qrValue = `https://queueflow-1.onrender.com/tickets/${ticket.number}`;
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>QueueFlow</div>
      <div style={styles.number}>{ticket.number}</div>
      <div style={styles.service}>{ticket.service}</div>
      <hr style={styles.divider} />
      <div style={styles.qrWrap}>
        <QRCodeSVG
          value={qrValue}
          size={130}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
          level="M"
          style={{ borderRadius: 6 }}
        />
      </div>
      <hr style={styles.divider} />
      <div style={styles.meta}>
        <div style={styles.metaName}>{ticket.name}</div>
        <div>{ticket.date} · {ticket.time}</div>
        {ticket.issuedBy && (
          <div style={{ marginTop: 2, color: '#aaa' }}>Issued by {ticket.issuedBy}</div>
        )}
      </div>
    </div>
  );
}
