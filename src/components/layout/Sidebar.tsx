// CONDOHUB — SIDEBAR DE NAVEGAÇÃO

import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  DollarSign,
  Wrench,
  Users,
  Bell,
  Shield,
  Calendar,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../lib/permissions';
import type { UserRole } from '../../types';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavMenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  module?: string;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const handleLinkClick = () => {
    // Fecha a sidebar em telas menores ao navegar
    onClose?.();
  };

  // ── ITENS DO MENU CONFORME O ROLE ──────────────────────────────────────────
  const getMenuItems = (role?: UserRole): NavMenuItem[] => {
    if (!role) return [];

    if (role === 'MORADOR') {
      return [
        { path: '/portal', label: 'Meu Portal', icon: LayoutDashboard },
        { path: '/financeiro', label: 'Minhas Taxas', icon: DollarSign },
        { path: '/comunicados', label: 'Comunicados', icon: Bell },
        { path: '/reservas', label: 'Reservas', icon: Calendar },
        { path: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
        { path: '/assembleias', label: 'Assembleias', icon: Users },
      ];
    }

    if (role === 'PORTEIRO') {
      return [
        { path: '/portaria', label: 'Portaria', icon: Shield },
        { path: '/reservas', label: 'Reservas', icon: Calendar },
        { path: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
        { path: '/comunicados', label: 'Comunicados', icon: Bell },
      ];
    }

    if (role === 'CONSELHEIRO') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/financeiro', label: 'Gestão Financeira', icon: DollarSign },
        { path: '/relatorios', label: 'Prestação de Contas', icon: FileText },
        { path: '/assembleias', label: 'Assembleias & Atas', icon: Users },
        { path: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
        { path: '/configuracoes', label: 'Configurações', icon: Settings },
      ];
    }

    // SINDICO e SUPER_ADMIN (com validação RBAC hasPermission)
    const adminCandidates: NavMenuItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { path: '/financeiro', label: 'Financeiro', icon: DollarSign, module: 'financial' },
      { path: '/manutencao', label: 'Manutenção & Obras', icon: Wrench, module: 'maintenance' },
      { path: '/assembleias', label: 'Assembleias', icon: Users, module: 'assemblies' },
      { path: '/comunicados', label: 'Comunicados', icon: Bell, module: 'communications' },
      { path: '/portaria', label: 'Portaria & Acesso', icon: Shield, module: 'access' },
      { path: '/reservas', label: 'Reservas', icon: Calendar, module: 'reservations' },
      { path: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle, module: 'occurrences' },
      { path: '/cadastros', label: 'Cadastros', icon: Building2, module: 'registry' },
      { path: '/relatorios', label: 'Relatórios & Balancete', icon: FileText, module: 'reports' },
      { path: '/configuracoes', label: 'Configurações', icon: Settings, module: 'settings' },
    ];

    return adminCandidates.filter(item => !item.module || hasPermission(role, item.module));
  };

  const menuItems = getMenuItems(user?.role);

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

  const roleLabels: Record<UserRole, string> = {
    SINDICO: 'Síndico Geral',
    MORADOR: user?.unitId ? `Morador (${user.unitId})` : 'Morador',
    PORTEIRO: 'Portaria / Ronda',
    CONSELHEIRO: 'Conselho Fiscal',
    SUPER_ADMIN: 'Super Admin',
  };

  const roleText = user?.role ? roleLabels[user.role] : '';

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''} aria-label="Menu Principal">
      {/* ── LOGO / CABEÇALHO ────────────────────────────────────────────────── */}
      <div className="sidebar-header" style={{ position: 'relative' }}>
        <div className="sidebar-logo-icon">
          <Building2 size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-title">CondoHub</div>
          <div className="sidebar-subtitle">Gestão Condominial</div>
        </div>

        {/* Botão fechar (apenas mobile) */}
        {isOpen && (
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-sidebar-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── NAVEGAÇÃO CENTRAL ──────────────────────────────────────────────── */}
      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="nav-section-title">Menu Principal</div>
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── RODAPÉ FIXO COM PERFIL E LOGOUT ───────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="user-snippet" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div className="avatar" style={{ background: 'var(--color-primary)' }}>
              {user?.avatar || initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={user?.name}
              >
                {user?.name || 'Usuário'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {roleText}
              </div>
            </div>
          </div>

          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            title="Encerrar Sessão"
            aria-label="Encerrar Sessão"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-sidebar-text)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-sidebar-text)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
