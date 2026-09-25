import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { security } from '../lib/security';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { ModernInfographicCharts } from '../components/dashboard/ModernInfographicCharts';
import {
  DollarSign,
  AlertTriangle,
  Wrench,
  CalendarDays,
  ArrowRight,
  Clock,
  Send,
  CheckCircle2,
  Activity,
  AlertOctagon,
  Calendar
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const condo = useAppStore(state => state.condo);
  const receivables = useAppStore(state => state.receivables);
  const financialMonths = useAppStore(state => state.financialMonths);
  const orders = useAppStore(state => state.maintenanceOrders);
  const occurrences = useAppStore(state => state.occurrences);
  const reservations = useAppStore(state => state.reservations);
  const prevMaintenance = useAppStore(state => state.preventiveMaintenance);
  const auditLogs = useAppStore(state => state.auditLogs);

  // Estado para Modal de Cobrança WhatsApp
  const [selectedDebtor, setSelectedDebtor] = useState<any>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // 1. Cálculos de KPIs
  const currentMonth = '2026-09';
  const totalReceivablesMonth = receivables
    .filter(r => r.ref === currentMonth)
    .reduce((acc, r) => acc + r.amount, 0);

  const pendingMonth = receivables
    .filter(r => r.ref === currentMonth && (r.status === 'Pendente' || r.status === 'Vencido'))
    .reduce((acc, r) => acc + r.amount, 0);

  const defaultRate =
    totalReceivablesMonth > 0
      ? ((pendingMonth / totalReceivablesMonth) * 100).toFixed(1)
      : '0.0';

  const currentMonthFinancial = financialMonths.find(f => f.month === 'Set/26') || financialMonths[financialMonths.length - 1];
  const currentCash = currentMonthFinancial ? currentMonthFinancial.balance : 38520.0;

  const openOccurrencesCount = occurrences.filter(
    o => o.status === 'Aberta' || o.status === 'Em análise'
  ).length;

  const upcomingReceivable = receivables
    .filter(r => r.status === 'Pendente')
    .sort((a, b) => a.due.localeCompare(b.due))[0];

  const nextDueDate = upcomingReceivable ? upcomingReceivable.due : '10/10/2026';

  // 2. Alertas Críticos
  const todayStr = new Date().toISOString().substring(0, 10);
  const criticalOverdue = receivables.filter(r => {
    if (r.status !== 'Vencido') return false;
    const diffDays = Math.floor(
      (new Date(todayStr).getTime() - new Date(r.due).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 30;
  });

  const criticalMaintenance = prevMaintenance.filter(
    pm => pm.status === 'Vencido' || pm.status === 'Proximo'
  );

  const handleOpenWhatsApp = (debtor: any) => {
    setSelectedDebtor(debtor);
    setIsWhatsAppModalOpen(true);
  };

  const handleSendWhatsAppSimulation = () => {
    success(`Mensagem de cobrança enviada via WhatsApp para Unidade ${selectedDebtor?.unit}!`);
    setIsWhatsAppModalOpen(false);
  };

  const getRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recente';
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);
      if (diffSec < 60) return 'Agora mesmo';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours}h`;
      return timestamp.substring(0, 10);
    } catch {
      return timestamp;
    }
  };

  const todayReservations = reservations.filter(r => r.date === todayStr);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Dashboard Executivo
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            {condo?.name || 'Condomínio'} • {condo?.totalUnits || 0} Unidades • Gestão Ativa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/financial')}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <DollarSign size={14} /> Fluxo de Caixa
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <Wrench size={14} /> Nova O.S.
          </button>
        </div>
      </div>

      {/* ALERTAS CRÍTICOS (SE HOUVER) */}
      {(criticalOverdue.length > 0 || criticalMaintenance.length > 0) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertOctagon size={20} className="text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Atenção Administrativa: </span>
              <span>
                {criticalOverdue.length} cobrança(s) com atraso superior a 30 dias e{' '}
                {criticalMaintenance.length} preventiva(s) requerendo vistoria imediata.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/financial')}
              className="btn btn-sm btn-outline text-xs border-amber-500/50 hover:bg-amber-500/10"
            >
              Ver Inadimplentes
            </button>
            <button
              onClick={() => navigate('/maintenance')}
              className="btn btn-sm btn-outline text-xs border-amber-500/50 hover:bg-amber-500/10"
            >
              Ver Preventivas
            </button>
          </div>
        </div>
      )}

      {/* 4 KPIS DINÂMICOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Caixa Atual */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Caixa Atual
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] mt-2">
            {security.maskMoney(currentCash)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Fundo de reserva preservado</span>
          </div>
        </div>

        {/* KPI 2: Inadimplência */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Inadimplência Mês
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {defaultRate}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1.5">
            {security.maskMoney(pendingMonth)} a liquidar
          </div>
        </div>

        {/* KPI 3: Ocorrências Abertas */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Ocorrências Ativas
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] mt-2">
            {openOccurrencesCount}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1.5">
            SLA de resposta: até 48h
          </div>
        </div>

        {/* KPI 4: Próximo Vencimento */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Próximo Vencimento
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text)] mt-2">
            {nextDueDate}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Taxa condominial ordinária
          </div>
        </div>
      </div>

      {/* PAINEL DE GRÁFICOS INFOGRÁFICOS MODERNOS INSPIRADOS NO DESIGN CYBER/NEON COM SUPORTE A TEMA CLARO E ESCURO */}
      <ModernInfographicCharts onNavigateFinancial={() => navigate('/financial')} />

      {/* 3 CARDS OPERACIONAIS + FEED DE ATIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Operacional 1: Inadimplentes do Mês com Cobrança WhatsApp */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title text-sm font-bold text-[var(--color-text)]">
              Inadimplentes em Destaque
            </h3>
            <button
              onClick={() => navigate('/financial')}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="card-body p-0 divide-y divide-[var(--color-border)]">
            {receivables
              .filter(r => r.status === 'Vencido')
              .slice(0, 4)
              .map(r => (
                <div key={r.id} className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--color-text)] truncate">
                      Unidade {r.unit} • {r.resident}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      Vencido em {r.due} • <b className="text-rose-600">{security.maskMoney(r.amount)}</b>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenWhatsApp(r)}
                    className="btn btn-sm btn-outline text-xs flex items-center gap-1 shrink-0 text-emerald-600 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    title="Cobrar via WhatsApp"
                  >
                    <Send size={12} /> WhatsApp
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Card Operacional 2: Próximas Manutenções */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title text-sm font-bold text-[var(--color-text)]">
              Próximas Manutenções
            </h3>
            <button
              onClick={() => navigate('/maintenance')}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Cronograma
            </button>
          </div>
          <div className="card-body p-0 divide-y divide-[var(--color-border)]">
            {prevMaintenance
              .slice()
              .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
              .slice(0, 3)
              .map(pm => (
                <div key={pm.id} className="p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-text)] truncate">{pm.equipment}</span>
                    <Badge variant={pm.status === 'Vencido' ? 'danger' : pm.status === 'Proximo' ? 'warning' : 'success'}>
                      {pm.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-1 flex items-center justify-between">
                    <span>{pm.supplier}</span>
                    <span className="font-semibold text-[var(--color-text)]">Data: {pm.nextDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Card Operacional 3: Reservas de Hoje */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title text-sm font-bold text-[var(--color-text)]">
              Reservas de Hoje
            </h3>
            <button
              onClick={() => navigate('/reservations')}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Agenda
            </button>
          </div>
          <div className="card-body p-3">
            {todayReservations.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                Nenhuma área comum reservada para a data de hoje.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {todayReservations.map(res => (
                  <div key={res.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-blue-500" />
                        {res.areaName}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        Unidade {res.unit} • {res.resident || 'Morador'}
                      </div>
                    </div>
                    <Badge variant={res.status === 'Confirmada' ? 'success' : 'warning'}>
                      {res.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FEED DE ATIVIDADES: ÚLTIMOS 10 AUDIT LOGS */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-primary)]" />
            <h3 className="card-title text-sm font-bold text-[var(--color-text)]">
              Feed de Atividades do Sistema (Auditoria)
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Últimos registros automáticos
          </span>
        </div>
        <div className="card-body p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Usuário</th>
                <th>Ação Realizada</th>
                <th>Módulo</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 10).map(log => (
                <tr key={log.id}>
                  <td className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                    {getRelativeTime(log.timestamp)}
                  </td>
                  <td className="font-semibold text-xs text-[var(--color-text)]">
                    {log.userName}
                  </td>
                  <td className="text-xs text-[var(--color-text)]">{log.action}</td>
                  <td>
                    <Badge variant="neutral">{log.module}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SIMULAÇÃO DE COBRANÇA WHATSAPP */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Simular Cobrança via WhatsApp"
        size="md"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsWhatsAppModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary flex items-center gap-1.5" onClick={handleSendWhatsAppSimulation}>
              <Send size={14} /> Enviar Mensagem
            </button>
          </>
        }
      >
        {selectedDebtor && (
          <div className="space-y-3.5 text-xs">
            <p className="text-[var(--color-text-muted)]">
              Mensagem pré-formatada para envio ao morador da <b>Unidade {selectedDebtor.unit}</b> ({selectedDebtor.resident}):
            </p>
            <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-mono space-y-2 leading-relaxed">
              <p>Olá, {selectedDebtor.resident}!</p>
              <p>
                Identificamos uma pendência relativa à taxa condominial da <b>Unidade {selectedDebtor.unit}</b> com vencimento em <b>{selectedDebtor.due}</b> no valor de <b>{security.maskMoney(selectedDebtor.amount)}</b>.
              </p>
              <p>
                Para regularizar, acesse o Portal do Morador do CondoHub ou responda a esta mensagem para obter a segunda via atualizada do boleto/PIX.
              </p>
              <p>Atenciosamente,<br />Administração do {condo?.name || 'Condomínio'}</p>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              * Esta é uma simulação de régua de cobrança automatizada via WhatsApp.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
