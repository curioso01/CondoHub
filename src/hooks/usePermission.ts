// CONDOHUB — HOOK DE PERMISSÕES
import { useAuthStore } from '../store/useAuthStore';
import { hasPermission } from '../lib/permissions';

/**
 * Retorna uma função que verifica se o usuário atual tem permissão para um módulo.
 * Ex: const can = usePermission(); if (can('financial')) ...
 */
export function usePermission() {
  const role = useAuthStore(s => s.user?.role ?? null);
  return (module: string): boolean => hasPermission(role, module);
}

/**
 * Retorna true/false diretamente para um módulo específico.
 * Ex: const canAccess = useHasPermission('financial');
 */
export function useHasPermission(module: string): boolean {
  const role = useAuthStore(s => s.user?.role ?? null);
  return hasPermission(role, module);
}
