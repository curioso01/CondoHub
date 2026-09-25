import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/ui/Modal';
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('condohub_remember_email') || 'sindico@condohub.com');
  const [password, setPassword] = useState('Sindico@2024');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('condohub_remember_email') !== null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { login, quickLogin, user, isAuthenticated, loginError } = useAuth();
  const { success, warning } = useToast();
  const navigate = useNavigate();

  // Gerenciamento de redirecionamento se autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'MORADOR') {
        navigate('/portal', { replace: true });
      } else if (user.role === 'PORTEIRO') {
        navigate('/portaria', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Temporizador regressivo em tempo real para rate limit
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown && countdown > 0) {
      warning(`Aguarde ${countdown} segundos para nova tentativa.`);
      return;
    }
    if (!email || !password) {
      warning('Preencha seu e-mail e senha.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('condohub_remember_email', email.trim());
    } else {
      localStorage.removeItem('condohub_remember_email');
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        success('Bem-vindo ao CondoHub!');
      } else {
        if (res.waitSeconds) {
          setCountdown(res.waitSeconds);
        }
      }
    }, 250);
  };

  const handleQuickLogin = (role: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const res = quickLogin(role as any);
      setIsLoading(false);
      if (res.success) {
        success('Acesso rápido ativado!');
      } else {
        warning(res.error || 'Perfil demo não encontrado.');
      }
    }, 150);
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      warning('Informe o e-mail cadastrado.');
      return;
    }
    success(`Instruções de redefinição enviadas para ${forgotEmail}!`);
    setIsForgotModalOpen(false);
    setForgotEmail('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* LOGO E CABEÇALHO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--color-primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--color-text)',
                margin: 0
              }}
            >
              CondoHub
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Gestão Condominial Integrada
            </span>
          </div>
        </div>

        {/* ALERTA DE RATE LIMIT VISUAL */}
        {countdown && countdown > 0 ? (
          <div
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 text-xs font-medium"
          >
            <Clock size={16} className="shrink-0" />
            <span>Bloqueio temporário: tente novamente em <b>{countdown}s</b>.</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label text-xs font-semibold">E-mail de Acesso</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control text-sm"
                style={{ paddingLeft: '38px' }}
                placeholder="seu.email@condominio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label text-xs font-semibold">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control text-sm"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-primary)]"
              />
              <span>Lembrar acesso</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setIsForgotModalOpen(true);
              }}
              style={{
                fontSize: '12px',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={isLoading || Boolean(countdown && countdown > 0)}
          >
            {isLoading ? 'Acessando...' : 'Entrar na Plataforma'}
            <ArrowRight size={16} />
          </button>

          {/* MENSAGEM DE ERRO GENÉRICA ABAIXO DO BOTÃO */}
          {loginError && (
            <div
              className="mt-3 p-2.5 rounded-lg text-center text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
            >
              {loginError}
            </div>
          )}
        </form>

        {/* ACESSO RÁPIDO PARA TESTES */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-muted)',
              marginBottom: '10px',
              textAlign: 'center'
            }}
          >
            Acesso Rápido de Demonstração:
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px'
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleQuickLogin('sindico')}
            >
              Síndico
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleQuickLogin('morador')}
            >
              Morador
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleQuickLogin('porteiro')}
            >
              Portaria
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => handleQuickLogin('conselheiro')}
            >
              Conselheiro
            </button>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ width: '100%', marginTop: '6px' }}
            onClick={() => handleQuickLogin('admin')}
          >
            Super Admin
          </button>
        </div>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Ambiente Seguro • Criptografia TLS 1.3</span>
        </div>
      </div>

      {/* MODAL ESQUECEU A SENHA */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Recuperação de Senha"
        size="sm"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleForgotPassword}>
              Enviar Link
            </button>
          </>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Informe o e-mail cadastrado para receber as instruções de redefinição de acesso.
        </p>
        <div className="form-group">
          <label className="form-label">E-mail Cadastrado</label>
          <input
            type="email"
            className="form-control"
            placeholder="seu.email@condominio.com"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};


export default Login;
