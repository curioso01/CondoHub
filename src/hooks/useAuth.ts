// CONDOHUB — HOOK DE AUTENTICAÇÃO
import { useAuthStore } from '../store/useAuthStore';
import { getDefaultRoute, hasPermission } from '../lib/permissions';
import type { UserRole } from '../types';

export function useAuth() {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const login = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);
  const quickLogin = useAuthStore(s => s.quickLogin);
  const getRateLimit = useAuthStore(s => s.getRateLimit);

  const defaultRoute = user ? getDefaultRoute(user.role) : '/login';
  const can = (module: string) => hasPermission(user?.role ?? null, module);
  const initials = user
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '';

  return {
    user,
    isAuthenticated,
    login,
    logout,
    quickLogin,
    getRateLimit,
    defaultRoute,
    can,
    initials,
    role: user?.role as UserRole | undefined,
    loginError: null as string | null,
  };
}
