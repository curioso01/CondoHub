import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { audit } from '../lib/audit';

export interface DemoUser extends User {
  password: string;
  passwordHash: string;
}

const createHash = (pwd: string) => btoa('salt_condo_' + pwd);

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u1',
    name: 'Carlos Mendonça',
    email: 'sindico@condohub.com',
    password: 'Sindico@2024',
    passwordHash: createHash('Sindico@2024'),
    role: 'SINDICO',
    avatar: 'CM',
    condoId: 'c1'
  },
  {
    id: 'u2',
    name: 'Ana Paula Ramos',
    email: 'morador@condohub.com',
    password: 'Morador@2024',
    passwordHash: createHash('Morador@2024'),
    role: 'MORADOR',
    avatar: 'AP',
    condoId: 'c1',
    unitId: 'A101'
  },
  {
    id: 'u3',
    name: 'Roberto Silva',
    email: 'porteiro@condohub.com',
    password: 'Porteiro@2024',
    passwordHash: createHash('Porteiro@2024'),
    role: 'PORTEIRO',
    avatar: 'RS',
    condoId: 'c1'
  },
  {
    id: 'u4',
    name: 'Admin Sistema',
    email: 'admin@condohub.com',
    password: 'Admin@2024',
    passwordHash: createHash('Admin@2024'),
    role: 'SUPER_ADMIN',
    avatar: 'AD',
    condoId: 'c1'
  },
  {
    id: 'u5',
    name: 'Eduardo Silveira Santos',
    email: 'conselheiro@condohub.com',
    password: 'Conselho@2024',
    passwordHash: createHash('Conselho@2024'),
    role: 'CONSELHEIRO',
    avatar: 'ES',
    condoId: 'c1',
    unitId: 'C101'
  }
];

export interface LoginResult {
  success: boolean;
  error?: string;
  waitSeconds?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginAttempts: Record<string, { count: number; lastAttempt: number }>;
  loginError: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => LoginResult;
  logout: () => void;
  quickLogin: (role: UserRole | string) => LoginResult;
  resetAttempts: (email?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginAttempts: {},
      loginError: null,
      isLoading: false,

      login: (email: string, pass: string): LoginResult => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (pass || '').trim();
        const now = Date.now();

        // 1. Rate limiting check (5 tentativas -> 30s bloqueio)
        const attempts = get().loginAttempts[cleanEmail] || { count: 0, lastAttempt: 0 };
        if (attempts.count >= 5) {
          const elapsedSec = (now - attempts.lastAttempt) / 1000;
          if (elapsedSec < 30) {
            const waitSeconds = Math.ceil(30 - elapsedSec);
            const errorMsg = `Muitas tentativas de login. Aguarde ${waitSeconds}s antes de tentar novamente.`;
            set({ loginError: errorMsg });
            return { success: false, error: errorMsg, waitSeconds };
          } else {
            // Tempo expirado: reseta tentativas
            attempts.count = 0;
          }
        }

        const inputHash = createHash(cleanPass);
        const matched = DEMO_USERS.find(
          u => u.email.toLowerCase() === cleanEmail && u.passwordHash === inputHash
        );

        if (matched) {
          const user: User = {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            avatar: matched.avatar,
            condoId: matched.condoId,
            unitId: matched.unitId
          };

          // Reseta tentativas para este e-mail
          const updatedAttempts = { ...get().loginAttempts };
          delete updatedAttempts[cleanEmail];

          audit.log(user.id, user.name, 'Login efetuado com sucesso', 'Autenticação');

          set({
            user,
            isAuthenticated: true,
            loginError: null,
            loginAttempts: updatedAttempts
          });

          return { success: true };
        } else {
          // Incrementa contagem de tentativas inválidas
          const newCount = attempts.count + 1;
          const updatedAttempts = {
            ...get().loginAttempts,
            [cleanEmail]: { count: newCount, lastAttempt: now }
          };

          let errorMsg = 'E-mail ou senha incorretos.';
          let waitSeconds: number | undefined;

          if (newCount >= 5) {
            waitSeconds = 30;
            errorMsg = `Tentativas excedidas (5). Bloqueio temporário por 30 segundos.`;
          }

          set({
            loginError: errorMsg,
            loginAttempts: updatedAttempts
          });

          return { success: false, error: errorMsg, waitSeconds };
        }
      },

      logout: () => {
        const current = get().user;
        if (current) {
          audit.log(current.id, current.name, 'Logout efetuado', 'Autenticação');
        }
        set({
          user: null,
          isAuthenticated: false,
          loginError: null
        });
      },

      quickLogin: (role: UserRole | string): LoginResult => {
        const roleKey = role.toString().toUpperCase();
        const matched = DEMO_USERS.find(u => u.role === roleKey);
        if (matched) {
          const user: User = {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            avatar: matched.avatar,
            condoId: matched.condoId,
            unitId: matched.unitId
          };

          audit.log(user.id, user.name, `Login rápido via Demo (${user.role})`, 'Autenticação');

          set({
            user,
            isAuthenticated: true,
            loginError: null
          });

          return { success: true };
        }
        return { success: false, error: 'Perfil demo não encontrado.' };
      },

      resetAttempts: (email?: string) => {
        if (email) {
          const updated = { ...get().loginAttempts };
          delete updated[email.toLowerCase().trim()];
          set({ loginAttempts: updated });
        } else {
          set({ loginAttempts: {} });
        }
      }
    }),
    {
      name: 'condohub_auth',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts
      })
    }
  )
);
