'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

/* ---------- Types ---------- */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

/* ---------- Context ---------- */
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* ---------- Hook ---------- */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

/* ---------- Icons ---------- */
const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

/* ---------- Single Toast ---------- */
function ToastNotification({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, 5000);

    return () => clearTimeout(timerRef.current);
  }, [item.id, onDismiss]);

  return (
    <div
      className={[
        styles.toast,
        styles[item.type],
        item.exiting ? styles.exit : styles.enter,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.icon}>{iconMap[item.type]}</span>
      <p className={styles.message}>{item.message}</p>
      <button
        className={styles.dismiss}
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        type="button"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ---------- Provider ---------- */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    // Mark as exiting for animation, then remove
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={styles.container} aria-label="Notifications">
        {toasts.map((item) => (
          <ToastNotification key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Default Standalone Toast Component ---------- */
interface StandaloneToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export default function Toast({
  message,
  type = "info",
  onClose,
}: StandaloneToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={[styles.toast, styles[type], styles.enter].join(" ")}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        pointerEvents: "auto",
        boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
      }}
      role="alert"
    >
      <span className={styles.icon}>{iconMap[type]}</span>
      <p className={styles.message}>{message}</p>
      {onClose && (
        <button
          className={styles.dismiss}
          onClick={onClose}
          aria-label="Dismiss notification"
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
