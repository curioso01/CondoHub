// CONDOHUB — PAINEL DE NOTIFICAÇÕES (SLIDE-IN LATERAL)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  X,
  DollarSign,
  AlertTriangle,
  Calendar,
  Wrench,
  Settings,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { timeAgo } from '../../lib/security';

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }
> = {
  financial: { icon: DollarSign, color: 'var(--color-secondary)' },
  occurrence: { icon: AlertTriangle, color: 'var(--color-danger)' },
  reservation: { icon: Calendar, color: 'var(--color-primary)' },
  maintenance: { icon: Wrench, color: '#7C3AED' },
  communication: { icon: Bell, color: 'var(--color-accent)' },
  announcement: { icon: Bell, color: 'var(--color-accent)' },
  system: { icon: Settings, color: 'var(--color-text-muted)' },
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();

  const notifications = useNotificationStore(s => s.notifications);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const markRead = useNotificationStore(s => s.markRead);
  const markAllRead = useNotificationStore(s => s.markAllRead);
  const clearAll = useNotificationStore(s => s.clearAll);

  // Fechar via tecla ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Ação ao clicar em uma notificação individual
  const handleClickNotification = (id: string, moduleRoute?: string) => {
    markRead(id);
    if (moduleRoute) {
      navigate(moduleRoute);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          {/* ── OVERLAY SEMI-TRANSPARENTE ──────────────────────────────────── */}
          <motion.div
            key="notif-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
            aria-hidden="true"
          />

          {/* ── PAINEL SLIDE-IN À DIREITA ──────────────────────────────────── */}
          <motion.div
            key="notif-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '380px',
              height: '100vh',
              background: 'var(--color-surface)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10000,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Painel de Notificações"
          >
            {/* ── CABEÇALHO ────────────────────────────────────────────────── */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: 0,
                  }}
                >
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: 'var(--color-danger)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar notificações"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── BARRA DE AÇÕES RÁPIDAS ───────────────────────────────────── */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: '10px 20px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: unreadCount > 0 ? 'pointer' : 'default',
                    fontSize: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    opacity: unreadCount > 0 ? 1 : 0.5,
                  }}
                >
                  <CheckCheck size={14} />
                  <span>Marcar todas como lidas</span>
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <Trash2 size={13} />
                  <span>Limpar tudo</span>
                </button>
              </div>
            )}

            {/* ── LISTA DE NOTIFICAÇÕES ─────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {notifications.length === 0 ? (
                /* Estado Vazio */
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <Bell size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                      Nenhuma notificação
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Você está em dia com todas as atualizações.
                    </div>
                  </div>
                </div>
              ) : (
                /* Lista de Itens */
                notifications.map(item => {
                  const config = TYPE_CONFIG[item.type] || {
                    icon: Bell,
                    color: 'var(--color-primary)',
                  };
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleClickNotification(item.id, item.module)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        background: !item.read ? 'rgba(26, 86, 219, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = !item.read
                          ? 'rgba(26, 86, 219, 0.08)'
                          : 'var(--color-bg)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = !item.read
                          ? 'rgba(26, 86, 219, 0.05)'
                          : 'transparent';
                      }}
                    >
                      {/* Ícone */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--color-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={16} style={{ color: config.color }} />
                      </div>

                      {/* Informações */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: !item.read ? 700 : 600,
                              color: 'var(--color-text)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </div>
                          {!item.read && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>

                        {/* Mensagem truncada em 2 linhas */}
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            marginTop: '3px',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.message}
                        </div>

                        {/* Tempo relativo */}
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                            marginTop: '6px',
                          }}
                        >
                          {timeAgo(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default NotificationPanel;
