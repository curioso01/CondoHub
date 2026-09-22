import { UserRole } from '../types';

export const PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  financial: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  maintenance: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  assemblies: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR'],
  communications: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  access: ['SUPER_ADMIN', 'SINDICO', 'PORTEIRO'],
  reservations: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  occurrences: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  registry: ['SUPER_ADMIN', 'SINDICO'],
  reports: ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  settings: ['SUPER_ADMIN', 'SINDICO'],
  portal: ['MORADOR'],
};

export const hasPermission = (role: UserRole, module: string): boolean => {
  return PERMISSIONS[module]?.includes(role) ?? false;
};
