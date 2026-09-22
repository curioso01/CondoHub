import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../lib/permissions';
import {
  LayoutDashboard,
  DollarSign,
  Wrench,
  Users,
  Megaphone,
  ShieldCheck,
  CalendarDays,
  AlertTriangle,
  FolderOpen,
  FileBarChart,
  Settings,
  Building2,
  LogOut,
  X,
  FileText,
  Package,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  module: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definição dos itens de acordo com a Role
  const getNavItems = (): NavItem[] => {
    const role = user?.role;

    if (role === 'MORADOR') {
      return [
        {
          id: 'portal',
          label: 'Portal do Morador',
          path: '/portal',
          icon: <LayoutDashboard size={18} />,
          module: 'portal'
        },
        {
          id: 'taxas',
          label: 'Minhas Taxas',
          path: '/financeiro',
          icon: <DollarSign size={18} />,
          module: 'financial'
        },
        {
          id: 'comunicados',
          label: 'Comunicados',
          path: '/comunicados',
          icon: <Megaphone size={18} />,
          module: 'communications'
        },
        {
          id: 'reservas',
          label: 'Reservas',
          path: '/reservas',
          icon: <CalendarDays size={18} />,
          module: 'reservations'
        },
        {
          id: 'ocorrencias',
          label: 'Ocorrências',
          path: '/ocorrencias',
          icon: <AlertTriangle size={18} />,
          module: 'occurrences'
        },
        {
          id: 'assembleias',
          label: 'Assembleias',
          path: '/assembleias',
          icon: <Users size={18} />,
          module: 'assemblies'
        },
        {
          id: 'documentos',
          label: 'Documentos',
          path: '/cadastro',
          icon: <FileText size={18} />,
          module: 'registry'
        }
      ];
    }

    if (role === 'PORTEIRO') {
      return [
        {
          id: 'portaria',
          label: 'Portaria',
          path: '/portaria',
          icon: <ShieldCheck size={18} />,
          module: 'access'
        },
        {
          id: 'visitantes',
          label: 'Visitantes',
          path: '/portaria',
          icon: <UserCheck size={18} />,
          module: 'access'
        },
        {
          id: 'encomendas',
          label: 'Encomendas',
          path: '/portaria',
          icon: <Package size={18} />,
          module: 'access'
        },
        {
          id: 'ocorrencias',
          label: 'Ocorrências',
          path: '/ocorrencias',
          icon: <AlertTriangle size={18} />,
          module: 'occurrences'
        },
        {
          id: 'reservas',
          label: 'Reservas',
          path: '/reservas',
          icon: <CalendarDays size={18} />,
          module: 'reservations'
        },
        {
          id: 'comunicados',
          label: 'Comunicados',
          path: '/comunicados',
          icon: <Megaphone size={18} />,
          module: 'communications'
        }
      ];
    }

    if (role === 'CONSELHEIRO') {
      return [
        {
          id: 'financeiro',
          label: 'Gestão Financeira',
          path: '/financeiro',
          icon: <DollarSign size={18} />,
          module: 'financial'
        },
        {
          id: 'prestacao',
          label: 'Prestação de Contas',
          path: '/relatorios',
          icon: <FileBarChart size={18} />,
          module: 'reports'
        },
        {
          id: 'assembleias',
          label: 'Assembleias & Atas',
          path: '/assembleias',
          icon: <Users size={18} />,
          module: 'assemblies'
        },
        {
          id: 'ocorrencias',
          label: 'Ocorrências',
          path: '/ocorrencias',
          icon: <AlertTriangle size={18} />,
          module: 'occurrences'
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          path: '/configuracoes',
          icon: <Settings size={18} />,
          module: 'settings'
        }
      ];
    }

    // SINDICO / SUPER_ADMIN: todos filtrados por hasPermission
    const allAdminItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard size={18} />,
        module: 'dashboard'
      },
      {
        id: 'financial',
        label: 'Financeiro',
        path: '/financeiro',
        icon: <DollarSign size={18} />,
        module: 'financial'
      },
      {
        id: 'maintenance',
        label: 'Manutenção & Obras',
        path: '/manutencao',
        icon: <Wrench size={18} />,
        module: 'maintenance'
      },
      {
        id: 'assemblies',
        label: 'Assembleias',
        path: '/assembleias',
        icon: <Users size={18} />,
        module: 'assemblies'
      },
      {
        id: 'communications',
        label: 'Comunicados',
        path: '/comunicados',
        icon: <Megaphone size={18} />,
        module: 'communications'
      },
      {
        id: 'access',
        label: 'Portaria & Acesso',
        path: '/portaria',
        icon: <ShieldCheck size={18} />,
        module: 'access'
      },
      {
        id: 'reservations',
        label: 'Reservas',
        path: '/reservas',
        icon: <CalendarDays size={18} />,
        module: 'reservations'
      },
      {
        id: 'occurrences',
        label: 'Ocorrências',
        path: '/ocorrencias',
        icon: <AlertTriangle size={18} />,
        module: 'occurrences'
      },
      {
        id: 'registry',
        label: 'Cadastros',
        path: '/cadastro',
        icon: <FolderOpen size={18} />,
        module: 'registry'
      },
      {
        id: 'reports',
        label: 'Relatórios & Balancete',
        path: '/relatorios',
        icon: <FileBarChart size={18} />,
        module: 'reports'
      },
      {
        id: 'settings',
        label: 'Configurações',
        path: '/configuracoes',
        icon: <Settings size={18} />,
        module: 'settings'
      }
    ];

    if (!role) return [];
    return allAdminItems.filter(item => hasPermission(role, item.module));
  };

  const navItems = getNavItems();

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
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`${isMobileOpen ? 'open' : ''}`}
        style={{
          transition: 'transform 200ms ease'
        }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Building2 size={20} />
          </div>
          <div className="sidebar-logo-text flex-1">
            <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>
              CondoHub
            </h1>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Gestão Condominial</span>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white p-1"
            onClick={onCloseMobile}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `sidebar-item flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Rodapé: avatar (iniciais), nome, role label, botão Sair */}
        <div
          className="sidebar-footer"
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="avatar text-xs font-bold shrink-0">
                {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'CH')}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-white/60 truncate">
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors"
              title="Sair da conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
