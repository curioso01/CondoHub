import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const login = useAuthStore(state => state.login);
  const quickLogin = useAuthStore(state => state.quickLogin);
  const logout = useAuthStore(state => state.logout);
  const loginError = useAuthStore(state => state.loginError);

  return {
    user,
    role: user?.role,
    isAuthenticated,
    login,
    quickLogin,
    logout,
    loginError
  };
};
