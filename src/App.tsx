import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { useNotificationStore } from './store/useNotificationStore';
import { AppLayout } from './components/layout/AppLayout';
import { Toast } from './components/ui/Toast';

// Lazy imports de todas as páginas
const Login           = lazy(() => import('./pages/Login'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Financial       = lazy(() => import('./pages/Financial'));
const Maintenance     = lazy(() => import('./pages/Maintenance'));
const Assemblies      = lazy(() => import('./pages/Assemblies'));
const Communications  = lazy(() => import('./pages/Communications'));
const Access          = lazy(() => import('./pages/Access'));
const Reservations    = lazy(() => import('./pages/Reservations'));
const Occurrences     = lazy(() => import('./pages/Occurrences'));
const Registry        = lazy(() => import('./pages/Registry'));
const Reports         = lazy(() => import('./pages/Reports'));
const Settings        = lazy(() => import('./pages/Settings'));
const ResidentPortal  = lazy(() => import('./pages/portal/ResidentPortal'));

// Componente de loading entre páginas
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: '400px', color: 'var(--color-text-muted)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '14px' }}>Carregando...</p>
      </div>
    </div>
  );
}

// ProtectedRoute: verifica autenticação e redireciona
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// RootRedirect: redireciona / para a rota correta por role
function RootRedirect() {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'MORADOR') return <Navigate to="/portal" replace />;
  if (user?.role === 'PORTEIRO') return <Navigate to="/portaria" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const seed = useAppStore(s => s.seed);
  const receivables = useAppStore(s => s.receivables);
  const occurrences = useAppStore(s => s.occurrences);
  const reservations = useAppStore(s => s.reservations);
  const addNotification = useNotificationStore(s => s.addNotification);

  // Inicializar dados e notificações
  useEffect(() => {
    seed();
  }, [seed]);

  // Gerar notificações iniciais após seed
  useEffect(() => {
    if (receivables.length === 0) return;

    // Cobranças vencidas → notificação financeira
    const vencidas = receivables.filter(r => r.status === 'Vencido');
    if (vencidas.length > 0) {
      addNotification({
        type: 'financial',
        title: 'Inadimplência detectada',
        message: `${vencidas.length} cobrança(s) vencida(s) aguardando ação`,
        module: '/financeiro',
        read: false,
      });
    }

    // Ocorrências abertas → notificação
    const abertas = occurrences.filter(o => o.status === 'Aberta');
    if (abertas.length > 0) {
      addNotification({
        type: 'occurrence',
        title: 'Ocorrências em aberto',
        message: `${abertas.length} ocorrência(s) aguardando análise`,
        module: '/ocorrencias',
        read: false,
      });
    }

    // Reservas aguardando aprovação
    const pendentes = reservations.filter(r => r.status === 'Aguardando aprovação');
    if (pendentes.length > 0) {
      addNotification({
        type: 'reservation',
        title: 'Reservas pendentes',
        message: `${pendentes.length} reserva(s) aguardando sua aprovação`,
        module: '/reservas',
        read: false,
      });
    }
  }, [receivables, occurrences, reservations, addNotification]);

  return (
    <BrowserRouter>
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Redirect raiz por role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rotas protegidas dentro do AppLayout */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/financeiro"    element={<Financial />} />
            <Route path="/manutencao"    element={<Maintenance />} />
            <Route path="/assembleias"   element={<Assemblies />} />
            <Route path="/comunicados"   element={<Communications />} />
            <Route path="/portaria"      element={<Access />} />
            <Route path="/reservas"      element={<Reservations />} />
            <Route path="/ocorrencias"   element={<Occurrences />} />
            <Route path="/cadastros"     element={<Registry />} />
            <Route path="/cadastro"      element={<Navigate to="/cadastros" replace />} />
            <Route path="/relatorios"    element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/portal"        element={<ResidentPortal />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
