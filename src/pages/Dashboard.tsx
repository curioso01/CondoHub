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
  Clock,
  Send,
  CheckCircle2,
  Activity,
  AlertOctagon,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const condo = useAppStore(state => state.condo);
  const receivables = useAppStore(state => state.receivables);
  const financialMonths = useAppStore(state => state.financialMonths);
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

  const currentMonthFinancial =
    financialMonths.find(f => f.month === '2026-09' || f.month === 'Set/26') ||
    financialMonths[financialMonths.length - 1];
  const currentCash = currentMonthFinancial ? currentMonthFinancial.balance : 38520.0;

  const openOccurrencesCount = occurrences.filter(
    o => o.status === 'Aberta' || o.status === 'Em análise'
  ).length;

  const upcomingReceivable = receivables
    .filter(r => r.status === 'Pendente')
    .sort((a, b) => a.due.localeCompare(b.due))[0];

  const nextDueDate = upcomingReceivable ? upcomingReceivable.due : '10/10/2026';

  // 2. Alertas Administrativos
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
      {/* CABEÇALHO EXECUTIVO ESTILO QCLAY */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Executivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {condo?.name || 'Condomínio Solar das Palmeiras'} • {condo?.totalUnits || 48} Unidades • Gestão Financeira Ativa
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/financial')}
            className="btn btn-sm btn-outline flex items-center gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 font-semibold"
          >
            <DollarSign size={14} /> Fluxo de Caixa
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="btn btn-sm btn-primary flex items-center gap-1.5 rounded-xl shadow-xs font-semibold"
          >
            <Wrench size={14} /> Nova O.S.
          </button>
        </div>
      </div>

      {/* BANNER DE ALERTAS ADMINISTRATIVOS (SE HOUVER) */}
      {(criticalOverdue.length > 0 || criticalMaintenance.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertOctagon size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300/40 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
            >
              Ver Inadimplentes
            </button>
            <button
              onClick={() => navigate('/maintenance')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300/40 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
            >
              Ver Preventivas
            </button>
          </div>
        </div>
      )}

      {/* 4 KPIS DINÂMICOS — ALINHAMENTO E BORDAS SUAVES (QCLAY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Caixa Atual */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Caixa Atual
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
            {security.maskMoney(currentCash)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Fundo de reserva preservado</span>
          </div>
        </div>

        {/* KPI 2: Inadimplência Mês */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inadimplência Mês
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-3 tracking-tight">
            {defaultRate}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span>{security.maskMoney(pendingMonth)} a liquidar</span>
            <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md">
              Atraso
            </span>
          </div>
        </div>

        {/* KPI 3: Ocorrências Ativas */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ocorrências Ativas
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
            {openOccurrencesCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            SLA médio de resposta: até 48h
          </div>
        </div>

        {/* KPI 4: Próximo Vencimento */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Próximo Vencimento
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
            {nextDueDate}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            Taxa condominial ordinária
          </div>
        </div>
      </div>

      {/* ÁREA DE ANALYTICS VISUAL INSPIRADA NO DRIBBLE DA QCLAY */}
      <ModernInfographicCharts onNavigateFinancial={() => navigate('/financial')} />

      {/* 3 CARDS OPERACIONAIS — ALINHAMENTO PERFEITO E BORDAS LIMPAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card Operacional 1: Inadimplentes com Cobrança WhatsApp */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Inadimplentes em Destaque
                </h3>
                <p className="text-[11px] text-slate-400">Cobrança e regularização</p>
              </div>
              <button
                onClick={() => navigate('/financial')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Ver todos <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {receivables
                .filter(r => r.status === 'Vencido')
                .slice(0, 4)
                .map(r => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {r.unit}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.resident}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Vencido • <span className="font-semibold text-rose-600">{security.maskMoney(r.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenWhatsApp(r)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Cobrar via WhatsApp"
                    >
                      <Send size={12} /> WhatsApp
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Card Operacional 2: Próximas Manutenções Preventivas (BORDAS SUAVES / LIMPAS) */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Próximas Manutenções
                </h3>
                <p className="text-[11px] text-slate-400">Preventivas e vistorias</p>
              </div>
              <button
                onClick={() => navigate('/maintenance')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Cronograma <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {prevMaintenance
                .slice()
                .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
                .slice(0, 3)
                .map(pm => (
                  <div
                    key={pm.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {pm.equipment}
                      </span>
                      <Badge variant={pm.status === 'Vencido' ? 'danger' : pm.status === 'Proximo' ? 'warning' : 'success'}>
                        {pm.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span className="truncate">{pm.supplier}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {pm.nextDate}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Card Operacional 3: Reservas de Hoje */}
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Reservas de Hoje
                </h3>
                <p className="text-[11px] text-slate-400">Ocupação das áreas comuns</p>
              </div>
              <button
                onClick={() => navigate('/reservations')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Agenda <ChevronRight size={13} />
              </button>
            </div>

            {todayReservations.length === 0 ? (
              <div className="py-7 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
                  <CalendarDays size={20} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nenhuma reserva para hoje
                </p>
                <p className="text-[11px] text-slate-400 max-w-[220px]">
                  As áreas comuns estão disponíveis para novos agendamentos dos moradores.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayReservations.map(res => (
                  <div
                    key={res.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-blue-500" />
                        {res.areaName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
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

      {/* FEED DE AUDITORIA & ATIVIDADES RECENTES */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Feed de Atividades do Sistema
              </h3>
              <p className="text-[11px] text-slate-400">Trilha de auditoria em tempo real</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Últimos registros automáticos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 text-left">Horário</th>
                <th className="py-2.5 px-3 text-left">Usuário</th>
                <th className="py-2.5 px-3 text-left">Ação Realizada</th>
                <th className="py-2.5 px-3 text-left">Módulo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs.slice(0, 8).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                    {getRelativeTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-xs text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                        {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">
                    {log.action}
                  </td>
                  <td className="py-3 px-3">
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
            <p className="text-slate-600 dark:text-slate-400">
              Mensagem pré-formatada para envio ao morador da <b>Unidade {selectedDebtor.unit}</b> ({selectedDebtor.resident}):
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono space-y-2 leading-relaxed text-slate-800 dark:text-slate-200">
              <p>Olá, {selectedDebtor.resident}!</p>
              <p>
                Identificamos uma pendência relativa à taxa condominial da <b>Unidade {selectedDebtor.unit}</b> com vencimento em <b>{selectedDebtor.due}</b> no valor de <b>{security.maskMoney(selectedDebtor.amount)}</b>.
              </p>
              <p>
                Para regularizar, acesse o Portal do Morador do CondoHub ou responda a esta mensagem para obter a segunda via atualizada do boleto/PIX.
              </p>
              <p>Atenciosamente,<br />Administração do {condo?.name || 'Condomínio'}</p>
            </div>
            <p className="text-[11px] text-slate-400">
              * Esta é uma simulação de régua de cobrança automatizada via WhatsApp.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
