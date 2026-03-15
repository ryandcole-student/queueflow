/**
 * components/Sidebar.jsx
 */
import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',       icon: '▦' },
  { id: 'generate',  label: 'Generate Ticket', icon: '✦' },
  { id: 'queue',     label: 'Queue Manager',   icon: '≡' },
];

const styles = {
  sidebar: {
    width: 220,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minHeight: 'calc(100vh - 65px)',
  },
  item: {
    padding: '0.6rem 0.9rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  footer: {
    marginTop: 'auto',
    padding: '0.6rem 0.9rem',
    fontSize: '0.75rem',
    color: 'var(--muted)',
    lineHeight: 1.6,
  },
};

export function Sidebar({ activePage, onNavigate }) {
  return (
    <aside style={styles.sidebar}>
      {NAV_ITEMS.map(item => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            style={{
              ...styles.item,
              color: isActive ? 'var(--accent2)' : 'var(--muted)',
              background: isActive ? 'rgba(124,106,247,0.15)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--surface2)';
                e.currentTarget.style.color = 'var(--text)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--muted)';
              }
            }}
            onClick={() => onNavigate(item.id)}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
      <div style={styles.footer}>
        <div>QueueFlow v1.0</div>
        <div>Prototype · Express + React</div>
      </div>
    </aside>
  );
}
