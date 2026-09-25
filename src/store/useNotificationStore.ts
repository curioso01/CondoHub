// CONDOHUB — STORE DE NOTIFICAÇÕES IN-APP (ZUSTAND — SEM PERSIST)

import { create } from 'zustand';
import type { Notification, NotificationType } from '../types';
import { generateId } from '../lib/security';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  // unreadCount é derivado do estado (computed)
  get unreadCount(): number;

  // Ações
  addNotification: (payload: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  addMany: (payloads: Omit<Notification, 'id' | 'read' | 'createdAt'>[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  clearRead: () => void;
}

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],

  // ── computed ─────────────────────────────────────────────────────────────────
  get unreadCount() {
    return get().notifications.filter(n => !n.read).length;
  },

  // ── addNotification ───────────────────────────────────────────────────────────
  addNotification(payload) {
    const notification: Notification = {
      id: generateId('notif'),
      read: false,
      createdAt: new Date().toISOString(),
      ...payload,
    };
    set(state => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  // ── addMany ───────────────────────────────────────────────────────────────────
  addMany(payloads) {
    const newNotifications: Notification[] = payloads.map(payload => ({
      id: generateId('notif'),
      read: false,
      createdAt: new Date().toISOString(),
      ...payload,
    }));
    set(state => ({
      notifications: [...newNotifications, ...state.notifications],
    }));
  },

  // ── markRead ──────────────────────────────────────────────────────────────────
  markRead(id: string) {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  // ── markAllRead ───────────────────────────────────────────────────────────────
  markAllRead() {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  // ── clearAll ──────────────────────────────────────────────────────────────────
  clearAll() {
    set({ notifications: [] });
  },

  // ── clearRead ─────────────────────────────────────────────────────────────────
  clearRead() {
    set(state => ({
      notifications: state.notifications.filter(n => !n.read),
    }));
  },
}));

// ─── HELPERS DE CRIAÇÃO ────────────────────────────────────────────────────────
/**
 * Cria payloads de notificação padronizados por tipo.
 */
export const NotificationFactory = {
  overdueReceivable(unit: string, amount: number): Omit<Notification, 'id' | 'read' | 'createdAt'> {
    return {
      type: 'financial' as NotificationType,
      title: 'Cobrança Vencida',
      message: `Unidade ${unit} possui boleto vencido de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}.`,
      module: '/financeiro',
    };
  },

  openOccurrence(title: string, priority: string): Omit<Notification, 'id' | 'read' | 'createdAt'> {
    return {
      type: 'occurrence' as NotificationType,
      title: `Ocorrência ${priority === 'Urgente' ? '🚨 Urgente' : 'Aberta'}`,
      message: title,
      module: '/ocorrencias',
    };
  },

  pendingReservation(areaName: string, unit: string): Omit<Notification, 'id' | 'read' | 'createdAt'> {
    return {
      type: 'reservation' as NotificationType,
      title: 'Reserva Aguardando Aprovação',
      message: `${unit} solicitou reserva de ${areaName}.`,
      module: '/reservas',
    };
  },

  systemAlert(title: string, message: string): Omit<Notification, 'id' | 'read' | 'createdAt'> {
    return {
      type: 'system' as NotificationType,
      title,
      message,
      module: '/dashboard',
    };
  },

  newAnnouncement(title: string): Omit<Notification, 'id' | 'read' | 'createdAt'> {
    return {
      type: 'communication' as NotificationType,
      title: 'Novo Comunicado',
      message: title,
      module: '/comunicados',
    };
  },
};
