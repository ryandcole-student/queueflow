/**
 * pages/QueuePage.jsx
 */
import React, { useState } from 'react';

const FILTERS = ['all', 'waiting', 'serving', 'done'];

export function QueuePage({ tickets, onStatusChange, onRemove }) {
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div>
      <div className="page-title">Queue Manager</div>
      <div className="page-sub">View and update ticket statuses</div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className="btn btn-ghost"
            onClick={() => setFilter(f)}
            style={
              filter === f
                ? { borderColor: 'var(--accent)', color: 'var(--accent2)' }
                : {}
            }
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No tickets match this filter.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Name</th>
                <th>Service</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><span className="ticket-num">{t.number}</span></td>
                  <td>{t.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{t.service}</td>
                  <td>
                    <span className={`badge badge-${t.status}`}>{t.status}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {t.time}
                  </td>
                  <td>
                    <div className="row-actions">
                      {t.status === 'waiting' && (
                        <button
                          className="btn btn-success"
                          onClick={() => onStatusChange(t.id, 'serving')}
                        >
                          Serve
                        </button>
                      )}
                      {t.status === 'serving' && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => onStatusChange(t.id, 'done')}
                        >
                          Done
                        </button>
                      )}
                      {t.status === 'done' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          Completed
                        </span>
                      )}
                      {t.status !== 'done' && (
                        <button
                          className="btn btn-danger"
                          onClick={() => onRemove(t.id)}
                          title="Cancel ticket"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
