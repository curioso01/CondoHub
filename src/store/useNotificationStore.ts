import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  // Aliases for compatibility
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    type: 'financial',
    title: 'Taxa Condominial de Setembro Emitida',
    message: 'Boletos da cota condominial ordinária disponíveis com desconto para pagamento até o dia 10.',
    read: false,
    module: 'financeiro',
    createdAt: '2026-09-20 14:00'
  },
  {
    id: 'notif_2',
    type: 'announcement',
    title: 'Manutenção Preventiva de Bombas',
    message: 'Limpeza periódica do reservatório e inspeção do barrilete programadas para quinta-feira.',
    read: false,
    module: 'comunicados',
    createdAt: '2026-09-19 10:30'
  },
  {
    id: 'notif_3',
    type: 'reservation',
    title: 'Reserva Confirmada: Espaço Gourmet',
    message: 'Sua solicitação de reserva do Espaço Gourmet foi deferida com sucesso.',
    read: true,
    module: 'reservas',
    createdAt: '2026-09-18 16:15'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: DEFAULT_NOTIFICATIONS,
  unreadCount: DEFAULT_NOTIFICATIONS.filter(n => !n.read).length,
  isOpen: false,

  setIsOpen: (open: boolean) => set({ isOpen: open }),

  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newNotification: Notification = {
      ...n,
      id,
      createdAt,
      read: n.read ?? false
    };

    const updated = [newNotification, ...get().notifications];
    set({
      notifications: updated,
      unreadCount: updated.filter(item => !item.read).length
    });
  },

  markRead: (id: string) => {
    const updated = get().notifications.map(item =>
      item.id === id ? { ...item, read: true } : item
    );
    set({
      notifications: updated,
      unreadCount: updated.filter(item => !item.read).length
    });
  },

  markAllRead: () => {
    const updated = get().notifications.map(item => ({ ...item, read: true }));
    set({
      notifications: updated,
      unreadCount: 0
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0
    });
  },

  // Aliases for compatibility
  markAsRead: (id: string) => get().markRead(id),
  markAllAsRead: () => get().markAllRead()
}));
