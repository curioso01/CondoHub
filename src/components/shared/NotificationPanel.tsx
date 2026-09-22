import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  X,
  CheckCheck,
  Trash2,
  DollarSign,
  Calendar,
  Wrench,
  AlertCircle,
  Megaphone,
  BellOff
} from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markRead,
    markAllRead,
    clearAll
  } = useNotificationStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <DollarSign size={16} className="text-emerald-500" />;
      case 'reservation':
        return <Calendar size={16} className="text-blue-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-amber-500" />;
      case 'occurrence':
        return <AlertCircle size={16} className="text-rose-500" />;
      default:
        return <Megaphone size={16} className="text-indigo-500" />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const now = new Date();
      const past = new Date(dateString.replace(' ', 'T'));
      const diffMs = now.getTime() - past.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      if (diffHours < 24) return `Há ${diffHours}h`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return dateString.substring(0, 10);
    } catch {
      return dateString;
    }
  };

  const handleNavigate = (module: string, id: string) => {
    markRead(id);
    setIsOpen(false);
    // Mapeamento para rota amigável
    const routeMap: Record<string, string> = {
      financial: '/financeiro',
      financeiro: '/financeiro',
      occurrence: '/ocorrencias',
      ocorrencias: '/ocorrencias',
      reservation: '/reservas',
      reservas: '/reservas',
      maintenance: '/manutencao',
      manutencao: '/manutencao',
      announcement: '/comunicados',
      comunicados: '/comunicados',
      access: '/portaria',
      portaria: '/portaria'
    };
    const targetRoute = routeMap[module] || `/${module}`;
    navigate(targetRoute);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={e => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="w-full max-w-sm h-full bg-[var(--color-surface)] shadow-2xl flex flex-col border-l border-[var(--color-border)] animate-in slide-in-from-right duration-200">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
            aria-label="Fechar painel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Ações: Marcar todas como lidas + Limpar tudo */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-center justify-between text-xs">
            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} />
                <span>Marcar todas como lidas</span>
              </button>
            ) : (
              <span className="text-[var(--color-text-muted)] text-[11px]">Tudo em dia</span>
            )}

            <button
              onClick={clearAll}
              className="text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 font-medium cursor-pointer ml-auto"
              title="Limpar tudo"
            >
              <Trash2 size={13} />
              <span>Limpar tudo</span>
            </button>
          </div>
        )}

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)] space-y-3">
              <div className="p-3.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                <BellOff size={28} className="opacity-60" />
              </div>
              <p className="text-xs font-medium">Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNavigate(n.module, n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  n.read
                    ? 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-70 hover:opacity-100 hover:bg-[var(--color-bg)]'
                    : 'bg-[var(--color-bg)] border-[var(--color-primary)]/40 shadow-xs hover:border-[var(--color-primary)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[var(--color-text)] truncate">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--color-border)]/50 text-[10px] text-[var(--color-text-muted)]">
                      <span>{getRelativeTime(n.createdAt)}</span>
                      <span className="text-[var(--color-primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
