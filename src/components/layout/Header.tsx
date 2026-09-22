import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../ui/Modal';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  User,
  Key,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/financeiro': 'Financeiro',
  '/financial': 'Financeiro',
  '/manutencao': 'Manutenção & Obras',
  '/maintenance': 'Manutenção & Obras',
  '/assembleias': 'Assembleias & Votações',
  '/assemblies': 'Assembleias & Votações',
  '/comunicados': 'Comunicados',
  '/communications': 'Comunicados',
  '/portaria': 'Portaria & Controle de Acesso',
  '/access': 'Portaria & Controle de Acesso',
  '/reservas': 'Reservas de Áreas Comuns',
  '/reservations': 'Reservas de Áreas Comuns',
  '/ocorrencias': 'Livro de Ocorrências',
  '/occurrences': 'Livro de Ocorrências',
  '/cadastro': 'Cadastros & Unidades',
  '/registry': 'Cadastros & Unidades',
  '/relatorios': 'Relatórios & Prestação de Contas',
  '/reports': 'Relatórios & Prestação de Contas',
  '/configuracoes': 'Configurações do Condomínio',
  '/settings': 'Configurações do Condomínio',
  '/portal': 'Portal do Morador'
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { unreadCount, setIsOpen: setIsNotificationOpen } = useNotificationStore();
  const { success, warning } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('condohub_darkmode') === 'true';
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('condohub_darkmode', isDark ? 'true' : 'false');
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleNavigateProfile = () => {
    setIsUserMenuOpen(false);
    if (user?.role === 'MORADOR') {
      navigate('/portal');
    } else {
      navigate('/configuracoes');
    }
  };

  const handleSavePassword = () => {
    if (!currPassword || !newPassword) {
      warning('Preencha os campos de senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      warning('A confirmação de senha não coincide.');
      return;
    }
    if (newPassword.length < 8) {
      warning('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    success('Senha alterada com sucesso!');
    setIsPasswordModalOpen(false);
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const currentPath = location.pathname;
  const currentLabel = BREADCRUMB_MAP[currentPath] || 'Visão Geral';

  const getRoleLabel = (r?: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'SINDICO':
        return 'Síndico';
      case 'CONSELHEIRO':
        return 'Conselheiro';
      case 'PORTEIRO':
        return 'Porteiro';
      case 'MORADOR':
        return 'Morador';
      default:
        return r || 'Usuário';
    }
  };

  return (
    <>
      <header id="main-header" className="flex items-center justify-between px-4 lg:px-6 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* Lado Esquerdo: Mobile Menu + Breadcrumb + Busca */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            onClick={onToggleMobileSidebar}
            aria-label="Abrir menu lateral"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb por useLocation */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              CondoHub
            </span>
            <ChevronRight size={14} className="opacity-50" />
            <span className="font-semibold text-[var(--color-text)]">{currentLabel}</span>
          </div>

          <button
            onClick={onOpenSearch}
            className="header-search-btn hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer ml-2"
            title="Pressione Ctrl+K para buscar"
          >
            <Search size={14} />
            <span>Buscar no condomínio...</span>
            <kbd className="text-[10px] ml-4 px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Lado Direito: Ações rápidas + Dark mode + Notificações + Dropdown Usuário */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>

          {/* Toggle Dark Mode */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sininho com badge (unreadCount) -> abre NotificationPanel */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            title="Notificações"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-[var(--color-border)] mx-1" />

          {/* Dropdown Usuário */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="avatar w-8 h-8 text-xs font-bold shrink-0">
                {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'CH')}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <div className="text-xs font-semibold text-[var(--color-text)] leading-tight truncate max-w-[120px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] capitalize leading-tight">
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 py-1.5 text-xs animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-3.5 py-2.5 border-b border-[var(--color-border)]">
                  <p className="font-bold text-[var(--color-text)] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[var(--color-bg)] text-[10px] font-medium text-[var(--color-primary)]">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>

                <button
                  onClick={handleNavigateProfile}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  <User size={15} className="text-[var(--color-text-muted)]" />
                  <span>Perfil & Dados</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  <Key size={15} className="text-[var(--color-text-muted)]" />
                  <span>Alterar Senha</span>
                </button>

                <div className="my-1 border-t border-[var(--color-border)]" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                >
                  <LogOut size={15} />
                  <span>Sair da conta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Alterar Senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha de Acesso"
        size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSavePassword}>
              Salvar Senha
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="form-group">
            <label className="form-label text-xs">Senha Atual</label>
            <input
              type="password"
              className="form-control text-xs"
              placeholder="Digite a senha atual"
              value={currPassword}
              onChange={e => setCurrPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label text-xs">Nova Senha</label>
            <input
              type="password"
              className="form-control text-xs"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label text-xs">Confirmar Nova Senha</label>
            <input
              type="password"
              className="form-control text-xs"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
