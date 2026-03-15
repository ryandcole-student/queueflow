/**
 * components/Navbar.jsx
 */
import React from 'react';

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  logoAccent: { color: 'var(--accent2)' },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem',
    color: 'var(--muted)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
  },
  rolePill: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '20px',
    background: 'rgba(124,106,247,0.15)',
    color: 'var(--accent2)',
  },
  signOut: {
    padding: '4px 12px',
    fontSize: '0.8rem',
  },
};

export function Navbar({ user, onLogout }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        Queue<span style={styles.logoAccent}>Flow</span>
      </div>
      <div style={styles.userInfo}>
        <span>{user.name}</span>
        <span style={styles.rolePill}>{user.role}</span>
        <div style={styles.avatar}>{user.name[0]}</div>
        <button
          className="btn btn-ghost"
          style={styles.signOut}
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
