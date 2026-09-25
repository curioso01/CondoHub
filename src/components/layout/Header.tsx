// CONDOHUB — HEADER SUPERIOR (TOP-HEADER)

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getRoleLabel } from '../../lib/permissions';
import { useDarkMode } from './AppLayout';
import { GlobalSearch } from '../shared/GlobalSearch';
import { NotificationPanel } from '../shared/NotificationPanel';

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/financeiro': 'Financeiro',
  '/manutencao': 'Manutenção & Obras',
  '/assembleias': 'Assembleias',
  '/comunicados': 'Comunicados',
  '/portaria': 'Portaria & Acesso',
  '/reservas': 'Reservas',
  '/ocorrencias': 'Ocorrências',
  '/cadastros': 'Cadastros',
  '/cadastro': 'Cadastros',
  '/relatorios': 'Relatórios & Balancete',
  '/configuracoes': 'Configurações',
  '/portal': 'Meu Portal',
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho global Ctrl+K / Cmd+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Título da página atual
  const currentTitle = BREADCRUMB_MAP[location.pathname] || 'CondoHub';

  // Iniciais do usuário
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const roleText = user?.role ? getRoleLabel(user.role, user.unitId) : '';

  return (
    <>
      <header id="top-header" style={{ height: '64px' }}>
        {/* ── LADO ESQUERDO: HAMBURGER MOBILE + BREADCRUMB ───────────────── */}
        <div className="header-left">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Abrir menu de navegação"
            style={{ padding: '8px', cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb" aria-label="Navegação estrutural">
            <span>CondoHub</span>
            <span style={{ color: 'var(--color-border)', opacity: 0.6 }}>/</span>
            <span className="breadcrumb-current">{currentTitle}</span>
          </div>
        </div>

        {/* ── LADO DIREITO: BUSCA, NOTIFICAÇÕES, TEMA, USUÁRIO ───────────── */}
        <div className="header-right" style={{ gap: '8px' }}>
          {/* 1. Botão de Busca */}
          <button
            type="button"
            className="header-btn"
            onClick={() => setSearchOpen(true)}
            title="Buscar no sistema (Ctrl+K)"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>

          {/* 2. Botão Notificações */}
          <button
            type="button"
            className="header-btn"
            onClick={() => setNotifOpen(true)}
            title="Notificações"
            aria-label="Notificações"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '999px',
                  background: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--color-surface)',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* 3. Toggle Dark Mode */}
          <button
            type="button"
            className="header-btn"
            onClick={toggleDarkMode}
            title={darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema de cores"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* 4. Dropdown do Usuário */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(prev => !prev)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="Menu do usuário"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                className="avatar"
                style={{
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 0 2px var(--color-border)',
                }}
              >
                {user?.avatar || initials}
              </div>
            </button>

            {/* Menu Suspenso */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: 'var(--color-surface)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                  padding: '12px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Dados do usuário */}
                <div style={{ padding: '4px 8px' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.name || 'Usuário'}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.email}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    {roleText}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />

                {/* Opção Meu Perfil / Informações */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    borderRadius: '6px',
                  }}
                >
                  <UserIcon size={16} />
                  <span>Unidade: {user?.unitId || 'Administração'}</span>
                </div>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />

                {/* Botão Sair */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.08)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'none';
                  }}
                >
                  <LogOut size={16} />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MODAIS COMPARTILHADOS ────────────────────────────────────────── */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

export default Header;
