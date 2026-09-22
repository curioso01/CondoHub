import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAppStore } from './store/useAppStore';
import { useNotificationStore } from './store/useNotificationStore';
import { hasPermission } from './lib/permissions';
import { ToastContainer } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Financial } from './pages/Financial';
import { Maintenance } from './pages/Maintenance';
import { Assemblies } from './pages/Assemblies';
import { Communications } from './pages/Communications';
import { Access } from './pages/Access';
import { Reservations } from './pages/Reservations';
import { Occurrences } from './pages/Occurrences';
import { Registry } from './pages/Registry';
import { Reports } from './pages/Reports';
import { Portal } from './pages/Portal';
import { Settings } from './pages/Settings';

// Protected Route Wrapper: checa isAuthenticated + hasPermission(user.role, module).
// Se sem auth → /login. Se sem permissão → /dashboard.
interface ProtectedRouteProps {
  module?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ module, children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (module && user && !hasPermission(user.role, module)) {
    // Se o usuário for Morador e tentar rota de dashboard, manda pro portal
    if (user.role === 'MORADOR') {
      return <Navigate to="/portal" replace />;
    }
    // Se for Porteiro e tentar dashboard, manda pra portaria
    if (user.role === 'PORTEIRO') {
      return <Navigate to="/portaria" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root Redirect based on user role:
// MORADOR → /portal, PORTEIRO → /portaria, outros → /dashboard
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'MORADOR') {
    return <Navigate to="/portal" replace />;
  }
  if (user?.role === 'PORTEIRO') {
    return <Navigate to="/portaria" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const { seed, receivables, occurrences } = useAppStore();
  const { addNotification, notifications } = useNotificationStore();

  // useEffect no App: chama seed()
  useEffect(() => {
    seed();
  }, [seed]);

  // Gera notificações iniciais se não existirem
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    const overdue = receivables.filter(r => r.status === 'Pendente' && r.due < today);
    if (overdue.length > 0 && !notifications.some(n => n.id.startsWith('auto_overdue'))) {
      addNotification({
        type: 'financial',
        title: `${overdue.length} Cobranças Vencidas`,
        message: 'Constam taxas condominiais em atraso que requerem acompanhamento financeiro.',
        module: 'financeiro',
        read: false
      });
    }

    const openOcc = occurrences.filter(o => o.status === 'Aberta');
    if (openOcc.length > 0 && !notifications.some(n => n.id.startsWith('auto_occ'))) {
      addNotification({
        type: 'occurrence',
        title: `${openOcc.length} Ocorrências Pendentes`,
        message: 'Ocorrências registradas por moradores aguardando análise da administração.',
        module: 'ocorrencias',
        read: false
      });
    }
  }, [receivables, occurrences, notifications, addNotification]);

  return (
    <Routes>
      {/* ROTA PÚBLICA DE LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* ROTAS PROTEGIDAS DENTRO DE <AppLayout> */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute module="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <ProtectedRoute module="financial">
              <Financial />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/financial" element={<Navigate to="/financeiro" replace />} />

        <Route
          path="/manutencao"
          element={
            <ProtectedRoute module="maintenance">
              <Maintenance />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/maintenance" element={<Navigate to="/manutencao" replace />} />

        <Route
          path="/assembleias"
          element={
            <ProtectedRoute module="assemblies">
              <Assemblies />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/assemblies" element={<Navigate to="/assembleias" replace />} />

        <Route
          path="/comunicados"
          element={
            <ProtectedRoute module="communications">
              <Communications />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/communications" element={<Navigate to="/comunicados" replace />} />

        <Route
          path="/portaria"
          element={
            <ProtectedRoute module="access">
              <Access />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/access" element={<Navigate to="/portaria" replace />} />

        <Route
          path="/reservas"
          element={
            <ProtectedRoute module="reservations">
              <Reservations />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/reservations" element={<Navigate to="/reservas" replace />} />

        <Route
          path="/ocorrencias"
          element={
            <ProtectedRoute module="occurrences">
              <Occurrences />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/occurrences" element={<Navigate to="/ocorrencias" replace />} />

        <Route
          path="/cadastro"
          element={
            <ProtectedRoute module="registry">
              <Registry />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/registry" element={<Navigate to="/cadastro" replace />} />

        <Route
          path="/relatorios"
          element={
            <ProtectedRoute module="reports">
              <Reports />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/reports" element={<Navigate to="/relatorios" replace />} />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute module="settings">
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Alias em inglês */}
        <Route path="/settings" element={<Navigate to="/configuracoes" replace />} />

        <Route
          path="/portal"
          element={
            <ProtectedRoute module="portal">
              <Portal />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <ToastContainer />
    </BrowserRouter>
  );
}
