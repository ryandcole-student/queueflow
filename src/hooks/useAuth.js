/**
 * hooks/useAuth.js
 * Manages authentication state + session persistence via localStorage.
 */
import { useState, useCallback } from 'react';
import { login as apiLogin } from '../api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('qf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const { user: u, token } = await apiLogin(username, password);
    localStorage.setItem('qf_user',  JSON.stringify(u));
    localStorage.setItem('qf_token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qf_user');
    localStorage.removeItem('qf_token');
    setUser(null);
  }, []);

  return { user, login, logout };
}
