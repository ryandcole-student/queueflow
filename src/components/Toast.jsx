/**
 * components/Toast.jsx
 */
import React, { useState, useCallback, useRef } from 'react';

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

/**
 * useToast — small hook to manage transient toast messages.
 * Usage:
 *   const { toast, showToast } = useToast();
 *   <Toast message={toast} />
 */
export function useToast(duration = 2500) {
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(''), duration);
  }, [duration]);

  return { toast, showToast };
}
