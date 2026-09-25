// CONDOHUB — COMPONENTE MODAL REUTILIZÁVEL

import { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}

// ─── LARGURAS POR TAMANHO ─────────────────────────────────────────────────────
const SIZE_MAP: Record<ModalSize, string> = {
  sm: '480px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const titleId = useId();

  // Fechar por ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const maxWidth = SIZE_MAP[size];

  return (
    <AnimatePresence>
      {isOpen && (
        // ── OVERLAY ───────────────────────────────────────────────────────────
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          aria-hidden="true"
        >
          {/* ── DIALOG ──────────────────────────────────────────────────────── */}
          <motion.div
            key="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface)',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            >
              <h3
                id={titleId}
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Fechar modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── BODY ──────────────────────────────────────────────────────── */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {children}
            </div>

            {/* ── FOOTER (opcional) ──────────────────────────────────────────── */}
            {footer && (
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  flexShrink: 0,
                  background: 'var(--color-bg)',
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
