import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './toast.css';

const ToastContext = createContext(null);
let nextToastId = 1;

export function notifyToast(message, type = 'error', duration = 4500) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('exampulse:toast', {
    detail: { message: String(message || 'Something went wrong.'), type, duration },
  }));
}

function inferType(message) {
  const value = String(message || '').toLowerCase();
  if (/success|created successfully|updated successfully|deleted successfully|registration successful/.test(value)) return 'success';
  if (/warning|please |already attempted|expired|unattempted/.test(value)) return 'warning';
  if (/info|please note/.test(value)) return 'info';
  return 'error';
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ message, type = 'error', duration = 4500 }) => {
    const id = nextToastId++;
    const toast = { id, message: String(message || 'Something went wrong.'), type };
    setToasts((current) => [...current.slice(-3), toast]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => {
    const onToast = (event) => show(event.detail || {});
    const onError = (event) => {
      const message = event.error?.message || event.message || 'An unexpected error occurred.';
      show({ message: `Unexpected error: ${message}`, type: 'error' });
    };
    const onRejection = (event) => {
      const reason = event.reason;
      const message = reason?.message || (typeof reason === 'string' ? reason : 'An unexpected request error occurred.');
      show({ message, type: 'error' });
    };

    // Keep existing page-level alert calls, but display them as styled toasts instead.
    const originalAlert = window.alert;
    window.alert = (message) => notifyToast(message, inferType(message));
    window.addEventListener('exampulse:toast', onToast);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('exampulse:toast', onToast);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [show]);

  return (
    <ToastContext.Provider value={{ show: (message, type = 'error', duration) => show({ message, type, duration }) }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`app-toast app-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} key={toast.id}>
            <span className="app-toast__icon" aria-hidden="true">
              {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : toast.type === 'info' ? 'i' : '×'}
            </span>
            <span className="app-toast__message">{toast.message}</span>
            <button className="app-toast__close" type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
