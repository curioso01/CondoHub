// CONDOHUB — STORE DE AUTENTICAÇÃO (ZUSTAND + PERSIST)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, LoginResult } from '../types';
import { log } from '../lib/audit';
import { getDefaultRoute } from '../lib/permissions';

// ─── USUÁRIOS DEMO ────────────────────────────────────────────────────────────
// PRODUÇÃO: substituir por autenticação via HTTPS com Argon2/Bcrypt no servidor.
const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Mendonça',
    email: 'sindico@condohub.com',
    passwordHash: btoa('salt_condo_Sindico@2024'),
    role: 'SINDICO',
    avatar: 'CM',
    condoId: 'c1',
  },
  {
    id: 'u2',
    name: 'Ana Paula Ramos',
    email: 'morador@condohub.com',
    passwordHash: btoa('salt_condo_Morador@2024'),
    role: 'MORADOR',
    avatar: 'AP',
    condoId: 'c1',
    unitId: 'A101',
  },
  {
    id: 'u3',
    name: 'Roberto Silva',
    email: 'porteiro@condohub.com',
    passwordHash: btoa('salt_condo_Porteiro@2024'),
    role: 'PORTEIRO',
    avatar: 'RS',
    condoId: 'c1',
  },
  {
    id: 'u4',
    name: 'Admin Sistema',
    email: 'admin@condohub.com',
    passwordHash: btoa('salt_condo_Admin@2024'),
    role: 'SUPER_ADMIN',
    avatar: 'AD',
    condoId: 'c1',
  },
  {
    id: 'u5',
    name: 'Eduardo Silveira Santos',
    email: 'conselheiro@condohub.com',
    passwordHash: btoa('salt_condo_Conselho@2024'),
    role: 'CONSELHEIRO',
    avatar: 'ES',
    condoId: 'c1',
    unitId: 'C101',
  },
];

// ─── TIPOS DO STORE ───────────────────────────────────────────────────────────
interface LoginAttemptEntry {
  count: number;
  lastAttempt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // loginAttempts é mantido em memória (não persistido) por segurança
  _loginAttempts: Record<string, LoginAttemptEntry>;

  // Ações
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  quickLogin: (role: UserRole) => LoginResult;
  clearAttempts: (email: string) => void;
  getRateLimit: (email: string) => { blocked: boolean; waitSeconds: number };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function generateToken(user: User): string {
  // JWT simulado — PRODUÇÃO: usar JWT real assinado com segredo no servidor
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      uid: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 8 * 60 * 60 * 1000, // 8 horas
    })
  );
  const signature = btoa('mock_signature_' + user.id);
  return `${header}.${payload}.${signature}`;
}

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _loginAttempts: {},

      // ── getRateLimit ────────────────────────────────────────────────────────
      getRateLimit(email: string) {
        const key = email.toLowerCase().trim();
        const entry = get()._loginAttempts[key];
        if (!entry) return { blocked: false, waitSeconds: 0 };

        const now = Date.now();
        if (entry.count >= 5) {
          const elapsed = Math.floor((now - entry.lastAttempt) / 1000);
          if (elapsed < 30) {
            return { blocked: true, waitSeconds: 30 - elapsed };
          }
          // Expirou o bloqueio — limpa automaticamente
          set(state => {
            const attempts = { ...state._loginAttempts };
            delete attempts[key];
            return { _loginAttempts: attempts };
          });
        }
        return { blocked: false, waitSeconds: 0 };
      },

      // ── login ────────────────────────────────────────────────────────────────
      login(email: string, password: string): LoginResult {
        const normalizedEmail = email.toLowerCase().trim();
        const rate = get().getRateLimit(normalizedEmail);

        if (rate.blocked) {
          return {
            success: false,
            error: `Muitas tentativas sem sucesso. Por segurança, aguarde ${rate.waitSeconds}s para tentar novamente.`,
            waitSeconds: rate.waitSeconds,
          };
        }

        const hashed = btoa('salt_condo_' + password);
        const found = DEMO_USERS.find(
          u => u.email.toLowerCase() === normalizedEmail && u.passwordHash === hashed
        );

        if (!found) {
          // Registrar tentativa falha
          set(state => {
            const attempts = { ...state._loginAttempts };
            const existing = attempts[normalizedEmail];
            attempts[normalizedEmail] = {
              count: existing ? existing.count + 1 : 1,
              lastAttempt: Date.now(),
            };
            return { _loginAttempts: attempts };
          });

          log('anon', 'Sistema/Anônimo', 'Falha de Login', 'Autenticação', {
            email: normalizedEmail,
          });

          return {
            success: false,
            error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
          };
        }

        // Limpar tentativas ao logar com sucesso
        set(state => {
          const attempts = { ...state._loginAttempts };
          delete attempts[normalizedEmail];
          return {
            _loginAttempts: attempts,
            user: found,
            isAuthenticated: true,
          };
        });

        log(found.id, found.name, 'Login Bem-Sucedido', 'Autenticação', {
          email: found.email,
          role: found.role,
        });

        const token = generateToken(found);
        return { success: true, user: found, token };
      },

      // ── logout ───────────────────────────────────────────────────────────────
      logout() {
        const { user } = get();
        if (user) {
          log(user.id, user.name, 'Logout Realizado', 'Autenticação', {
            userId: user.id,
          });
        }
        set({ user: null, isAuthenticated: false });
      },

      // ── quickLogin ───────────────────────────────────────────────────────────
      quickLogin(role: UserRole): LoginResult {
        const credMap: Record<UserRole, { email: string; password: string }> = {
          SINDICO:     { email: 'sindico@condohub.com',     password: 'Sindico@2024' },
          MORADOR:     { email: 'morador@condohub.com',     password: 'Morador@2024' },
          PORTEIRO:    { email: 'porteiro@condohub.com',    password: 'Porteiro@2024' },
          SUPER_ADMIN: { email: 'admin@condohub.com',       password: 'Admin@2024' },
          CONSELHEIRO: { email: 'conselheiro@condohub.com', password: 'Conselho@2024' },
        };
        const cred = credMap[role];
        return get().login(cred.email, cred.password);
      },

      // ── clearAttempts ─────────────────────────────────────────────────────────
      clearAttempts(email: string) {
        set(state => {
          const attempts = { ...state._loginAttempts };
          delete attempts[email.toLowerCase().trim()];
          return { _loginAttempts: attempts };
        });
      },
    }),
    {
      name: 'condohub_auth',
      storage: createJSONStorage(() => localStorage),
      // Persistir apenas o usuário e autenticação, não as tentativas de login
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── EXPORTS AUXILIARES ───────────────────────────────────────────────────────
export { DEMO_USERS, getDefaultRoute };
