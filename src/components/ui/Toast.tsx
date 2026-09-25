// CONDOHUB — COMPONENTE TOAST + STORE PRÓPRIO

import { useEffect } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast, ToastType } from '../../types';
import { generateId } from '../../lib/security';

// ─── STORE INTERNO ────────────────────────────────────────────────────────────
interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast(message, type = 'info', duration = 4000) {
    const id = generateId('toast');
    const newToast: Toast = { id, type, message, duration };
    set(state => ({ toasts: [...state.toasts, newToast] }));
  },

  removeToast(id) {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  clearAll() {
    set({ toasts: [] });
  },
}));

// ─── HOOK PÚBLICO ─────────────────────────────────────────────────────────────
/**
 * Hook para disparar toasts de qualquer componente.
 * Uso: const toast = useToast(); toast('Salvo!', 'success');
 */
export const useToast = () => useToastStore(s => s.addToast);

// ─── CONFIGURAÇÃO VISUAL POR TIPO ─────────────────────────────────────────────
const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; borderColor: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    borderColor: 'var(--color-secondary)',
    iconColor: 'var(--color-secondary)',
  },
  error: {
    icon: <XCircle size={18} />,
    borderColor: 'var(--color-danger)',
    iconColor: 'var(--color-danger)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    borderColor: 'var(--color-accent)',
    iconColor: 'var(--color-accent)',
  },
  info: {
    icon: <Info size={18} />,
    borderColor: 'var(--color-primary)',
    iconColor: 'var(--color-primary)',
  },
};

// ─── ITEM INDIVIDUAL ──────────────────────────────────────────────────────────
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = TOAST_CONFIG[toast.type ?? 'info'];
  const duration = toast.duration ?? 4000;

  // Auto-dismiss via useEffect
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        borderRadius: '10px',
        borderLeft: `4px solid ${config.borderColor}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        minWidth: '280px',
        maxWidth: '380px',
        pointerEvents: 'all',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Ícone */}
      <span
        style={{
          color: config.iconColor,
          display: 'flex',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {config.icon}
      </span>

      {/* Mensagem */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'var(--color-text)',
          wordBreak: 'break-word',
        }}
      >
        {toast.message}
      </span>

      {/* Botão fechar */}
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
/**
 * Container de toasts. Colocar uma única vez no root da aplicação (fora das Routes).
 */
export function Toast() {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);

  return (
    <div
      aria-label="Notificações do sistema"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
