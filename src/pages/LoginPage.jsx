/**
 * pages/LoginPage.jsx
 */
import React, { useState } from 'react';

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '1rem',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 400,
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-1px',
  },
  logoAccent: { color: 'var(--accent2)' },
  sub: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    marginTop: 4,
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginTop: '1.25rem',
  },
  code: {
    color: 'var(--accent2)',
    fontFamily: 'var(--font-mono)',
  },
};

export function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onLogin(form.username, form.password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>
            Queue<span style={styles.logoAccent}>Flow</span>
          </div>
          <p style={styles.sub}>Virtual Queue Management System</p>
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            name="username"
            value={form.username}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="admin"
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error && <div className="error-msg">{error}</div>}

        <p style={styles.hint}>
          Demo:&nbsp;
          <code style={styles.code}>admin / admin123</code>
          &nbsp;·&nbsp;
          <code style={styles.code}>staff / staff123</code>
        </p>
      </div>
    </div>
  );
}
