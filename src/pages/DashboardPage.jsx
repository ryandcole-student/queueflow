/**
 * pages/DashboardPage.jsx
 */
import React from 'react';

export function DashboardPage({ tickets, stats }) {
  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Live queue overview</div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value accent">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Waiting</div>
          <div className="stat-value warn">{stats.waiting}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Now Serving</div>
          <div className="stat-value success">{stats.serving}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value muted">{stats.done}</div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">Recent Tickets</span>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <p>No tickets yet. Generate one from the Tickets tab.</p>
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
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 10).map(t => (
                <tr key={t.id}>
                  <td><span className="ticket-num">{t.number}</span></td>
                  <td>{t.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{t.service}</td>
                  <td>
                    <span className={`badge badge-${t.status}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {t.time}
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
