import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ============================================================
// Toast — per FRONTEND_ARCHITECTURE.md §1 component tree
// Lightweight toast provider with a hook API (useToast).
// ============================================================

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLE: Record<ToastVariant, { border: string; accent: string; icon: string }> = {
  info:    { border: 'rgba(56,189,248,0.35)',  accent: '#38bdf8', icon: 'ℹ️' },
  success: { border: 'rgba(34,197,94,0.35)',   accent: '#22c55e', icon: '✅' },
  warning: { border: 'rgba(250,204,21,0.35)',  accent: '#facc15', icon: '⚠️' },
  error:   { border: 'rgba(239,68,68,0.35)',   accent: '#ef4444', icon: '🚨' },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, opts?: { variant?: ToastVariant; duration?: number }) => {
      const id = nextId++;
      const variant = opts?.variant ?? 'info';
      const duration = opts?.duration ?? 3500;
      setToasts((t) => [...t, { id, message, variant, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 10000,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const style = VARIANT_STYLE[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onDismiss(toast.id)}
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        background: 'rgba(15,25,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${style.border}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
        minWidth: '240px',
        maxWidth: '420px',
      }}
    >
      <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{style.icon}</span>
      <span
        style={{
          fontSize: '0.88rem',
          color: 'white',
          lineHeight: 1.45,
          fontFamily: 'Inter, sans-serif',
          flex: 1,
        }}
      >
        {toast.message}
      </span>
      <span
        aria-hidden
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: style.accent,
          flexShrink: 0,
          boxShadow: `0 0 10px ${style.accent}80`,
        }}
      />
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
