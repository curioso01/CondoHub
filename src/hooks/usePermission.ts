import { useAuthStore } from '../store/useAuthStore';
import { hasPermission } from '../lib/permissions';

export const usePermission = (moduleName: string): boolean => {
  const user = useAuthStore(state => state.user);
  if (!user) return false;
  return hasPermission(user.role, moduleName);
};
