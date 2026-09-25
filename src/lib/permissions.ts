// CONDOHUB — SISTEMA DE PERMISSÕES RBAC

import type { UserRole } from '../types';

/**
 * Mapa de permissões por módulo.
 * Conforme definido no GEMINI.md.
 * SUPER_ADMIN tem acesso total via lógica especial em hasPermission().
 */
export const PERMISSIONS: Record<string, UserRole[]> = {
  dashboard:      ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  financial:      ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  maintenance:    ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  assemblies:     ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR'],
  communications: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  access:         ['SUPER_ADMIN', 'SINDICO', 'PORTEIRO'],
  reservations:   ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  occurrences:    ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  registry:       ['SUPER_ADMIN', 'SINDICO'],
  reports:        ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  settings:       ['SUPER_ADMIN', 'SINDICO'],
  portal:         ['MORADOR'],
};

/**
 * Verifica se um role tem permissão para acessar um módulo.
 * SUPER_ADMIN sempre retorna true.
 */
export function hasPermission(role: UserRole | null | undefined, module: string): boolean {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;
  const allowed = PERMISSIONS[module];
  if (!allowed) return false;
  return allowed.includes(role);
}

/**
 * Retorna a rota padrão de redirecionamento com base no role do usuário.
 */
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'MORADOR':   return '/portal';
    case 'PORTEIRO':  return '/portaria';
    default:          return '/dashboard';
  }
}

/**
 * Retorna o label amigável do role para exibição na interface.
 */
export function getRoleLabel(role: UserRole, unitId?: string): string {
  switch (role) {
    case 'SINDICO':     return '👑 SÍNDICO GERAL';
    case 'SUPER_ADMIN': return '⚡ SUPER ADMIN';
    case 'MORADOR':     return `🏠 MORADOR${unitId ? ` (${unitId})` : ''}`;
    case 'PORTEIRO':    return '🛡️ PORTARIA / RONDA';
    case 'CONSELHEIRO': return '📋 CONSELHO FISCAL';
    default:            return role;
  }
}

/**
 * Retorna o label amigável do role (versão curta para o header).
 */
export function getRoleLabelShort(role: UserRole, unitId?: string): string {
  switch (role) {
    case 'SINDICO':     return 'Síndico Geral';
    case 'SUPER_ADMIN': return 'Super Admin';
    case 'MORADOR':     return `Morador${unitId ? ` (${unitId})` : ''}`;
    case 'PORTEIRO':    return 'Portaria / Ronda';
    case 'CONSELHEIRO': return 'Conselho Fiscal';
    default:            return role;
  }
}
