import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { security } from '../lib/security';
import { Badge } from '../components/ui/Badge';
import {
  Settings as SettingsIcon,
  Building,
  DollarSign,
  Users,
  Database,
  Save,
  RotateCcw,
  Shield,
  KeyRound
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'users' | 'system'>('general');

  // Form states - Geral
  const [condoName, setCondoName] = useState('Residencial das Palmeiras');
  const [condoCnpj, setCondoCnpj] = useState('12.345.678/0001-90');
  const [condoAddress, setCondoAddress] = useState('Av. das Nações Unidas, 1200 - São Paulo/SP');
  const [condoManager, setCondoManager] = useState('Carlos Eduardo Sindico');
  const [condoMandate, setCondoMandate] = useState('2025 - 2027');

  // Form states - Financeiro
  const [dueDay, setDueDay] = useState('10');
  const [penaltyPercent, setPenaltyPercent] = useState('2.0');
  const [interestPercent, setInterestPercent] = useState('1.0');
  const [pixKey, setPixKey] = useState('financeiro@condohub.com.br');

  const { success, info } = useToast();

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    success('Configurações institucionais do condomínio atualizadas com sucesso!');
  };

  const handleSaveFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    success('Parâmetros de régua de cobrança salvos com sucesso!');
  };

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(localStorage, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `condohub_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Backup completo do banco de dados exportado em JSON!');
  };

  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja restaurar os dados de fábrica do condomínio? Todas as alterações salvas serão resetadas.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const demoAccounts = [
    { role: 'SUPER_ADMIN', email: 'admin@condohub.com', name: 'Administrador do Sistema', scope: 'Acesso Irrestrito' },
    { role: 'SINDICO', email: 'sindico@condohub.com', name: 'Carlos Eduardo (Síndico)', scope: 'Gestão Completa' },
    { role: 'CONSELHEIRO', email: 'conselheiro@condohub.com', name: 'Dra. Helena (Conselho Fiscal)', scope: 'Auditoria & Financeiro' },
    { role: 'PORTEIRO', email: 'porteiro@condohub.com', name: 'Roberto (Portaria Principal)', scope: 'Acessos & Encomendas' },
    { role: 'MORADOR', email: 'morador@condohub.com', name: 'Mariana Silva (Unidade A101)', scope: 'Portal do Morador' }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Configurações & Parâmetros do Condomínio
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Dados cadastrais, taxas e réguas de cobrança, contas de usuários e cópias de segurança
          </p>
        </div>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Building size={16} /> Dados Institucionais
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'financial'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <DollarSign size={16} /> Parâmetros Financeiros
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Users size={16} /> Usuários & Perfis RBAC
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'system'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Database size={16} /> Banco de Dados & Backup
        </button>
      </div>

      {/* TAB 1: DADOS INSTITUCIONAIS */}
      {activeTab === 'general' && (
        <div className="card p-6">
          <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl">
            <div className="form-group">
              <label className="form-label">Nome do Condomínio</label>
              <input
                type="text"
                className="form-control"
                value={condoName}
                onChange={e => setCondoName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">CNPJ do Condomínio</label>
                <input
                  type="text"
                  className="form-control"
                  value={condoCnpj}
                  onChange={e => setCondoCnpj(security.maskCNPJ(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total de Unidades</label>
                <input
                  type="text"
                  className="form-control"
                  value="48 apartamentos (4 Blocos)"
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endereço Completo</label>
              <input
                type="text"
                className="form-control"
                value={condoAddress}
                onChange={e => setCondoAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Síndico(a) Eleito(a)</label>
                <input
                  type="text"
                  className="form-control"
                  value={condoManager}
                  onChange={e => setCondoManager(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandato Vigente</label>
                <input
                  type="text"
                  className="form-control"
                  value={condoMandate}
                  onChange={e => setCondoMandate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary flex items-center gap-1.5 text-xs font-bold">
              <Save size={14} /> Salvar Alterações Institucionais
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PARÂMETROS FINANCEIROS */}
      {activeTab === 'financial' && (
        <div className="card p-6">
          <form onSubmit={handleSaveFinancial} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-3 gap-3">
              <div className="form-group">
                <label className="form-label">Dia de Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-control"
                  value={dueDay}
                  onChange={e => setDueDay(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Multa por Atraso (%)</label>
                <input
                  type="text"
                  className="form-control"
                  value={penaltyPercent}
                  onChange={e => setPenaltyPercent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Juros de Mora ao Mês (%)</label>
                <input
                  type="text"
                  className="form-control"
                  value={interestPercent}
                  onChange={e => setInterestPercent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chave PIX Oficial do Condomínio (Recebimentos)</label>
              <input
                type="text"
                className="form-control"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                required
              />
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-lg text-xs text-[var(--color-text-muted)] space-y-1">
              <span className="font-bold text-[var(--color-text)] block">Regra do Código Civil Art. 1.336:</span>
              <p>O condômino que não pagar a sua contribuição ficará sujeito aos juros moratórios convencionados ou, não sendo previstos, os de um por cento ao mês e multa de até dois por cento sobre o débito.</p>
            </div>

            <button type="submit" className="btn btn-primary flex items-center gap-1.5 text-xs font-bold">
              <Save size={14} /> Salvar Parâmetros de Cobrança
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: USUÁRIOS & ROLES */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              Contas de Acesso Demo Homologadas
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Perfis com matriz RBAC estrita de controle de permissões
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome do Usuário</th>
                  <th>E-mail de Login</th>
                  <th>Papel / Perfil</th>
                  <th>Escopo de Permissão</th>
                </tr>
              </thead>
              <tbody>
                {demoAccounts.map((acc, i) => (
                  <tr key={i}>
                    <td className="font-bold text-sm text-[var(--color-text)]">{acc.name}</td>
                    <td className="text-xs font-mono text-[var(--color-text-muted)]">{acc.email}</td>
                    <td>
                      <Badge
                        variant={
                          acc.role === 'SUPER_ADMIN'
                            ? 'danger'
                            : acc.role === 'SINDICO'
                            ? 'primary'
                            : acc.role === 'CONSELHEIRO'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {acc.role}
                      </Badge>
                    </td>
                    <td className="text-xs font-semibold text-[var(--color-text)]">{acc.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BANCO DE DADOS & BACKUP */}
      {activeTab === 'system' && (
        <div className="card p-6 space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Database size={18} className="text-[var(--color-primary)]" />
              Armazenamento Local & Segurança de Dados
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              O CondoHub armazena todos os estados no LocalStorage do navegador com sincronização reativa via Zustand. Você pode exportar um arquivo snapshot completo para arquivamento ou restaurar os dados padrão a qualquer momento.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-3">
            <button
              onClick={handleBackupExport}
              className="btn btn-outline flex items-center gap-1.5 text-xs font-bold"
            >
              <Database size={14} /> Exportar Backup JSON
            </button>

            <button
              onClick={handleResetData}
              className="btn btn-danger flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw size={14} /> Restaurar Padrão de Fábrica
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
