// CONDOHUB — DASHBOARD EXECUTIVO
// Design inspirado em Dipa Inhouse / Shopeers (Dribbble)
// Layout de duas colunas, gauge SVG, area chart Chart.js, sem bordas visíveis.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { security } from '../lib/security';
import { useToast } from '../hooks/useToast';
import {
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Calendar,
  TrendingUp,
  Plus,
  Send,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
} from 'lucide-react';

// ─── Variáveis de cor inline (dark mode via CSS vars) ─────────────────────────
// Usaremos var(--color-*) do styles.css + algumas inline para os graficos

const C = {
  positive: '#10B981',
  negative: '#EF4444',
  primary:  '#1A56DB',
  accent:   '#F59E0B',
  purple:   '#6366F1',
  muted:    'var(--color-text-muted)',
  text:     'var(--color-text)',
  surface:  'var(--color-surface)',
  bg:       'var(--color-bg)',
  border:   'var(--color-border)',
} as const;

// ─── Card wrapper ──────────────────────────────────────────────────────────────
const DCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: C.surface,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
      padding: 24,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Section label ─────────────────────────────────────────────────────────────
const SLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: C.muted,
    }}
  >
    {children}
  </span>
);

// ─── Badge inline ──────────────────────────────────────────────────────────────
interface InlineBadgeProps {
  color: string;
  bg: string;
  children: React.ReactNode;
}
const InlineBadge: React.FC<InlineBadgeProps> = ({ color, bg, children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 999,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 600,
      color,
      background: bg,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

// ─── Gauge SVG (semicírculo) ───────────────────────────────────────────────────
const GaugeSVG: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = Math.PI * r; // semicírculo = metade

  const clampedPct = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clampedPct / 100) * circumference;

  const gaugeColor =
    clampedPct >= 95 ? C.positive : clampedPct >= 80 ? C.accent : C.negative;

  return (
    <svg width={160} height={90} viewBox="0 0 160 90">
      {/* trilha */}
      <path
        d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* preenchimento */}
      <path
        d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
        fill="none"
        stroke={gaugeColor}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* percentual */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={26}
        fontWeight={700}
        fill={gaugeColor}
        fontFamily="Inter, sans-serif"
      >
        {clampedPct.toFixed(1)}%
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize={10}
        fill="#94A3B8"
        fontFamily="Inter, sans-serif"
      >
        On track for 100% target
      </text>
    </svg>
  );
};

// ─── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div
    style={{
      height: 4,
      borderRadius: 999,
      background: '#E2E8F0',
      overflow: 'hidden',
      marginTop: 6,
    }}
  >
    <div
      style={{
        height: '100%',
        width: `${Math.min(100, value)}%`,
        background: color,
        borderRadius: 999,
        transition: 'width 0.5s ease',
      }}
    />
  </div>
);

// ─── Tipo de período do gráfico ────────────────────────────────────────────────
type Period = '3m' | '6m' | '12m';

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // ─── Stores ────────────────────────────────────────────────────────────────
  const user         = useAuthStore(s => s.user);
  const condo        = useAppStore(s => s.condo);
  const receivables  = useAppStore(s => s.receivables);
  const financialMonths = useAppStore(s => s.financialMonths);
  const prevMaint    = useAppStore(s => s.preventiveMaintenance);
  const occurrences  = useAppStore(s => s.occurrences);
  const reservations = useAppStore(s => s.reservations);
  const auditLogs    = useAppStore(s => s.auditLogs);
  const commonAreas  = useAppStore(s => s.commonAreas);

  // ─── Estado local ──────────────────────────────────────────────────────────
  const [period, setPeriod] = useState<Period>('6m');
  const chartRef  = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);

  // ─── Greeting ──────────────────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? 'Gestor';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // ─── Cálculos financeiros ──────────────────────────────────────────────────
  const currentMonth = '2026-09';
  const prevMonth    = '2026-08';

  const rcvCurrent  = receivables.filter(r => r.ref === currentMonth);
  const rcvPrev     = receivables.filter(r => r.ref === prevMonth);

  const paidCurrent = rcvCurrent.filter(r => r.status === 'Pago').length;
  const totalCurrent = rcvCurrent.length || 1;
  const overdueCurrent = rcvCurrent.filter(r => r.status === 'Vencido');
  const overdueAmount = overdueCurrent.reduce((s, r) => s + r.amount, 0);
  const defaultRate = ((overdueCurrent.length / totalCurrent) * 100);

  // adimplencia global
  const allPaid  = receivables.filter(r => r.status === 'Pago').length;
  const allTotal = receivables.length || 1;
  const adimPct  = (allPaid / allTotal) * 100;

  // caixa
  const fmList = financialMonths.length > 0 ? financialMonths : [
    { month: '2026-01', revenue: 38400, expenses: 31200, balance: 7200 },
    { month: '2026-02', revenue: 37800, expenses: 29800, balance: 8000 },
    { month: '2026-03', revenue: 38400, expenses: 34500, balance: 3900 },
    { month: '2026-04', revenue: 39200, expenses: 32100, balance: 7100 },
    { month: '2026-05', revenue: 38400, expenses: 30400, balance: 8000 },
    { month: '2026-06', revenue: 37600, expenses: 33800, balance: 3800 },
    { month: '2026-07', revenue: 38400, expenses: 31900, balance: 6500 },
    { month: '2026-08', revenue: 38400, expenses: 29500, balance: 8900 },
    { month: '2026-09', revenue: 39000, expenses: 32700, balance: 6300 },
  ];
  const latestFm = fmList[fmList.length - 1] ?? { balance: 0, revenue: 0, expenses: 0 };
  const prevFm   = fmList[fmList.length - 2] ?? latestFm;
  const cashChange = prevFm.balance !== 0
    ? (((latestFm.balance - prevFm.balance) / Math.abs(prevFm.balance)) * 100)
    : 0;

  // ocorrências
  const activeOccurrences = occurrences.filter(
    o => o.status !== 'Resolvida' && o.status !== 'Arquivada'
  );
  const hasUrgent = activeOccurrences.some(o => o.status === 'Aberta' && o.priority === 'Urgente');

  // próximo vencimento
  const pendingRcv = receivables
    .filter(r => r.status === 'Pendente')
    .sort((a, b) => a.due.localeCompare(b.due));
  const nextDue = pendingRcv[0] ?? null;
  const nextDueUnits = pendingRcv.length;

  // alertas críticos
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueOld = receivables.filter(r => {
    if (r.status !== 'Vencido') return false;
    const diff = Math.floor((Date.now() - new Date(r.due).getTime()) / 86400000);
    return diff >= 30;
  });
  const expiredMaint = prevMaint.filter(p => p.status === 'Vencido');
  const hasCritical = overdueOld.length > 0 || expiredMaint.length > 0;

  // conformidade
  const maintOk = prevMaint.filter(p => p.status === 'Em dia').length;
  const maintTotal = prevMaint.length || 1;
  const maintPct = (maintOk / maintTotal) * 100;

  const resolvedOcc = occurrences.filter(o => o.status === 'Resolvida').length;
  const occTotal = occurrences.length || 1;
  const resolvedPct = (resolvedOcc / occTotal) * 100;

  // reservas de hoje
  const todayReservations = reservations.filter(r => r.date === todayStr);
  const availableAreasCount = commonAreas.filter(a => a.active).length;

  // helper de tempo relativo
  const relTime = (ts?: string) => {
    if (!ts) return 'Recente';
    try {
      const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
      if (diff < 60) return 'Agora';
      if (diff < 3600) return `Há ${Math.floor(diff / 60)}min`;
      if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
      return ts.slice(0, 10);
    } catch {
      return ts.slice(0, 10);
    }
  };

  // ─── Construir dados do gráfico ────────────────────────────────────────────
  const formatLabel = (m: string) => {
    const parts = m.split('-');
    if (parts.length === 2) {
      const idx = parseInt(parts[1], 10) - 1;
      return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][idx] ?? m;
    }
    return m;
  };

  const sliceCount = period === '3m' ? 3 : period === '6m' ? 6 : 12;
  const sliced     = fmList.slice(Math.max(0, fmList.length - sliceCount));
  const chartLabels   = sliced.map(f => formatLabel(f.month));
  const chartRevenues = sliced.map(f => f.revenue);
  const chartExpenses = sliced.map(f => f.expenses);

  // superávit do último período selecionado
  const latestSlice = sliced[sliced.length - 1] ?? latestFm;
  const superavit = latestSlice.revenue - latestSlice.expenses;

  // ─── Criar / destruir o gráfico ────────────────────────────────────────────
  const buildChart = useCallback(() => {
    const ChartJS = (window as any).Chart;
    if (!ChartJS || !chartRef.current) return;

    if (chartInst.current) {
      chartInst.current.destroy();
      chartInst.current = null;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-mode');
    const gridColor  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
    const tickColor  = isDark ? '#64748B' : '#94A3B8';
    const tooltipBg  = isDark ? '#1E293B' : '#FFFFFF';
    const tooltipTxt = isDark ? '#F1F5F9' : '#1E293B';

    // gradiente receitas
    const gRev = ctx.createLinearGradient(0, 0, 0, 260);
    gRev.addColorStop(0, 'rgba(26,86,219,0.12)');
    gRev.addColorStop(1, 'rgba(26,86,219,0.00)');

    // gradiente despesas
    const gExp = ctx.createLinearGradient(0, 0, 0, 260);
    gExp.addColorStop(0, 'rgba(99,102,241,0.12)');
    gExp.addColorStop(1, 'rgba(99,102,241,0.00)');

    chartInst.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Receitas',
            data: chartRevenues,
            borderColor: C.primary,
            backgroundColor: gRev,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: C.primary,
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
          },
          {
            label: 'Despesas',
            data: chartExpenses,
            borderColor: C.purple,
            backgroundColor: gExp,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: C.purple,
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipTxt,
            bodyColor: tooltipTxt,
            borderColor: 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            callbacks: {
              label: (ctx: any) =>
                ` ${ctx.dataset.label}: ${security.maskMoney(ctx.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 11 },
              callback: (v: any) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`,
            },
            border: { display: false },
          },
        },
      },
    });
  }, [chartLabels, chartRevenues, chartExpenses]);

  // Recriar ao mudar período ou tema
  useEffect(() => {
    buildChart();
    return () => {
      if (chartInst.current) {
        chartInst.current.destroy();
        chartInst.current = null;
      }
    };
  }, [buildChart]);

  // Observer para dark mode
  useEffect(() => {
    const obs = new MutationObserver(() => buildChart());
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [buildChart]);

  // ─── Inadimplência — cor do valor ──────────────────────────────────────────
  const defaultRateColor =
    defaultRate > 5 ? C.negative : defaultRate > 2 ? C.accent : C.positive;

  // ─── Manutenção — badge CSS por status ─────────────────────────────────────
  const maintBadgeClass = (s: string) =>
    s === 'Vencido'
      ? 'badge badge-danger'
      : s === 'Proximo'
      ? 'badge badge-warning'
      : 'badge badge-success';

  // ─── WhatsApp simulado ─────────────────────────────────────────────────────
  const handleWhatsApp = (name: string) => {
    toast.success(`Cobrança enviada para ${name} (simulado)`);
  };

  // ─── Comparação inadimplência (mês anterior) ───────────────────────────────
  const overduePrev = rcvPrev.filter(r => r.status === 'Vencido').length;
  const overduePrevTotal = rcvPrev.length || 1;
  const defaultRatePrev = (overduePrev / overduePrevTotal) * 100;
  const defaultWorse = defaultRate > defaultRatePrev;

  // ─── Período — label dos botões ────────────────────────────────────────────
  const periodLabels: Record<Period, string> = {
    '3m': '3 Meses',
    '6m': '6 Meses',
    '12m': '1 Ano',
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEÇÃO 1 — HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Saudação */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>
            {greeting}, {firstName} 👋
          </h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {condo?.name ?? 'Condomínio Solar das Palmeiras'} •{' '}
            {condo?.totalUnits ?? 48} Unidades • Gestão Ativa
          </p>
        </div>

        {/* Ações rápidas */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ fontSize: 13, borderRadius: 8 }}
            onClick={() => navigate('/financial')}
          >
            <TrendingUp size={14} /> Fluxo de Caixa
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ fontSize: 13, borderRadius: 8 }}
            onClick={() => navigate('/maintenance')}
          >
            <Plus size={14} /> Nova O.S.
          </button>
        </div>
      </div>

      {/* Banner de alerta crítico */}
      {hasCritical && (
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            borderLeft: '3px solid #F59E0B',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, color: C.text }}>
            ⚠{' '}
            <strong>Atenção:</strong>{' '}
            {overdueOld.length} cobrança(s) vencida(s) há mais de 30 dias e{' '}
            {expiredMaint.length} preventiva(s) vencida(s).
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, color: C.primary }}
              onClick={() => navigate('/financial')}
            >
              Ver Inadimplentes
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, color: C.primary }}
              onClick={() => navigate('/maintenance')}
            >
              Ver Preventivas
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          LAYOUT DE DUAS COLUNAS
          ════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* ─── COLUNA ESQUERDA ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ═══════════════════════════════════════════════════════════════════
              SEÇÃO 2 — 4 KPI CARDS
              ═══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {/* KPI 1 — CAIXA ATUAL */}
            <DCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SLabel>Caixa Atual</SLabel>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.positive,
                  }}
                >
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 4 }}>
                {security.maskMoney(latestFm.balance)}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                Fundo de reserva preservado
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                {cashChange >= 0 ? (
                  <ArrowUpRight size={14} color={C.positive} />
                ) : (
                  <ArrowDownRight size={14} color={C.negative} />
                )}
                <span style={{ color: cashChange >= 0 ? C.positive : C.negative, fontWeight: 600 }}>
                  {cashChange >= 0 ? '+' : ''}{cashChange.toFixed(1)}%
                </span>
                <span style={{ color: C.muted }}>vs mês anterior</span>
              </div>
            </DCard>

            {/* KPI 2 — INADIMPLÊNCIA */}
            <DCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SLabel>Inadimplência</SLabel>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.negative,
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: defaultRateColor,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {defaultRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                {security.maskMoney(overdueAmount)} a liquidar
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                {defaultWorse ? (
                  <ArrowUpRight size={14} color={C.negative} />
                ) : (
                  <ArrowDownRight size={14} color={C.positive} />
                )}
                <span
                  style={{
                    color: defaultWorse ? C.negative : C.positive,
                    fontWeight: 600,
                  }}
                >
                  {defaultWorse ? 'Atraso' : 'Melhora'}
                </span>
                <span style={{ color: C.muted }}>vs mês anterior</span>
              </div>
            </DCard>

            {/* KPI 3 — OCORRÊNCIAS ATIVAS */}
            <DCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SLabel>Ocorrências Ativas</SLabel>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.purple,
                  }}
                >
                  <MessageSquare size={18} />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 700, color: C.text, lineHeight: 1 }}>
                  {activeOccurrences.length}
                </span>
                {hasUrgent && (
                  <InlineBadge color="#9B1C1C" bg="#FDE8E8">Urgente</InlineBadge>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                SLA médio de resposta: até 48h
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {activeOccurrences.filter(o => o.status === 'Em análise').length} em análise
              </div>
            </DCard>

            {/* KPI 4 — PRÓXIMO VENCIMENTO */}
            <DCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SLabel>Próximo Vencimento</SLabel>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(245,158,11,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.accent,
                  }}
                >
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 4 }}>
                {nextDue ? nextDue.due : '—'}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                {nextDue?.type ?? 'Taxa condominial'}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {nextDueUnits} unidade(s) a vencer
              </div>
            </DCard>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SEÇÃO 3 — GRÁFICO PRINCIPAL (area chart)
              ═══════════════════════════════════════════════════════════════════ */}
          <DCard>
            {/* Header do card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                  Fluxo Financeiro &amp; Balanço
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Evolução mensal de receitas arrecadadas vs despesas operacionais
                </div>
              </div>

              {/* Seletor de período */}
              <div
                style={{
                  display: 'flex',
                  background: C.bg,
                  borderRadius: 8,
                  padding: 3,
                  gap: 2,
                }}
              >
                {(['3m', '6m', '12m'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: period === p ? C.primary : 'transparent',
                      color: period === p ? '#FFFFFF' : C.muted,
                      transition: 'all 150ms ease',
                    }}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Métricas rápidas */}
            <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: C.primary,
                    display: 'inline-block',
                  }}
                />
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Receitas Mês
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.positive }}>
                    {security.maskMoney(latestSlice.revenue)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: C.purple,
                    display: 'inline-block',
                  }}
                />
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Despesas Mês
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.negative }}>
                    {security.maskMoney(latestSlice.expenses)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowUpRight size={16} color={superavit >= 0 ? C.positive : C.negative} />
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Superávit
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: superavit >= 0 ? C.positive : C.negative,
                    }}
                  >
                    {security.maskMoney(superavit)}
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div style={{ position: 'relative', height: 260 }}>
              <canvas ref={chartRef} />
            </div>
          </DCard>

          {/* ═══════════════════════════════════════════════════════════════════
              SEÇÃO 4 — INDICADORES DE CONFORMIDADE
              ═══════════════════════════════════════════════════════════════════ */}
          <DCard style={{ padding: '20px 24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20,
              }}
            >
              {[
                {
                  n: '01',
                  label: 'Adimplência das Cotas',
                  value: adimPct,
                  color: C.positive,
                },
                {
                  n: '02',
                  label: 'Manutenções em Dia',
                  value: maintPct,
                  color: C.primary,
                },
                {
                  n: '03',
                  label: 'Resolução no Prazo',
                  value: resolvedPct,
                  color: C.purple,
                },
              ].map(ind => (
                <div key={ind.n}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: C.primary,
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {ind.n}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                        {ind.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: ind.color }}>
                      {ind.value.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar value={ind.value} color={ind.color} />
                </div>
              ))}
            </div>
          </DCard>

          {/* ═══════════════════════════════════════════════════════════════════
              SEÇÃO 5 — 3 CARDS OPERACIONAIS
              ═══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* CARD A — Inadimplentes em Destaque */}
            <DCard style={{ padding: 0 }}>
              <div style={{ padding: '20px 20px 12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 2,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Inadimplentes em Destaque
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: C.primary, padding: '2px 6px' }}
                    onClick={() => navigate('/financial')}
                  >
                    Ver todos <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Cobrança e regularização</div>
              </div>

              <div>
                {overdueCurrent.slice(0, 3).map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '10px 20px',
                      borderTop: i === 0 ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span
                          style={{
                            background: '#F1F5F9',
                            color: '#475569',
                            borderRadius: 4,
                            padding: '1px 6px',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {r.unit}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
                          {r.resident}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        Vencido em {r.due} •{' '}
                        <strong style={{ color: C.negative }}>
                          {security.maskMoney(r.amount)}
                        </strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, gap: 4, flexShrink: 0 }}
                      onClick={() => handleWhatsApp(r.resident)}
                    >
                      <Send size={12} /> WhatsApp
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: C.muted }}>Régua automatizada</span>
                <span style={{ color: C.positive, fontWeight: 600 }}>Cobrança ativa</span>
              </div>
            </DCard>

            {/* CARD B — Próximas Manutenções */}
            <DCard style={{ padding: 0 }}>
              <div style={{ padding: '20px 20px 12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 2,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Próximas Manutenções
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: C.primary, padding: '2px 6px' }}
                    onClick={() => navigate('/maintenance')}
                  >
                    Cronograma <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Preventivas e vistorias</div>
              </div>

              <div>
                {prevMaint
                  .slice()
                  .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
                  .slice(0, 3)
                  .map((pm, i) => (
                    <div
                      key={pm.id}
                      style={{
                        padding: '10px 20px',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 170,
                          }}
                        >
                          {pm.equipment}
                        </span>
                        <span className={maintBadgeClass(pm.status)}>
                          {pm.status}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: C.muted,
                        }}
                      >
                        <span>{pm.supplier}</span>
                        <span>Venc.: {pm.nextDate}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: C.muted }}>Plano Preventivo</span>
                <span style={{ color: C.primary, fontWeight: 600 }}>
                  {prevMaint.length} agendadas
                </span>
              </div>
            </DCard>

            {/* CARD C — Reservas de Hoje */}
            <DCard style={{ padding: 0 }}>
              <div style={{ padding: '20px 20px 12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 2,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Reservas de Hoje
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: C.primary, padding: '2px 6px' }}
                    onClick={() => navigate('/reservations')}
                  >
                    Agenda <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Áreas comuns</div>
              </div>

              {todayReservations.length === 0 ? (
                <div
                  style={{
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <CalendarDays size={40} color="#CBD5E1" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    Nenhuma reserva agendada para hoje
                  </span>
                  <span style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
                    {availableAreasCount} área(s) disponíveis para agendamento
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: 4, fontSize: 12 }}
                    onClick={() => navigate('/reservations')}
                  >
                    Agendar Área Comum
                  </button>
                </div>
              ) : (
                <div>
                  {todayReservations.slice(0, 3).map(res => (
                    <div
                      key={res.id}
                      style={{
                        padding: '10px 20px',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {res.areaName}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {res.timeSlot} • Un. {res.unit} • {res.resident}
                        </div>
                      </div>
                      <span
                        className={
                          res.status === 'Confirmada'
                            ? 'badge badge-success'
                            : 'badge badge-warning'
                        }
                      >
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: C.muted }}>Áreas Comuns</span>
                <span style={{ color: C.positive, fontWeight: 600 }}>Uso monitorado</span>
              </div>
            </DCard>
          </div>
        </div>

        {/* ─── COLUNA DIREITA ───────────────────────────────────────────────── */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* ═══════════════════════════════════════════════════════════════════
              CARD DIREITA 1 — Gauge de Adimplência
              ═══════════════════════════════════════════════════════════════════ */}
          <DCard>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                Taxa de Adimplência
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                Último período de competência
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <GaugeSVG percent={adimPct} />
            </div>

            {/* Resumo dos recebíveis */}
            <div
              style={{
                background: C.bg,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {[
                { label: 'Pagos', count: receivables.filter(r => r.status === 'Pago').length, color: C.positive },
                { label: 'Pendentes', count: receivables.filter(r => r.status === 'Pendente').length, color: C.accent },
                { label: 'Vencidos', count: receivables.filter(r => r.status === 'Vencido').length, color: C.negative },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: item.color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ color: C.muted }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </DCard>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD DIREITA 2 — Feed de Atividades (Auditoria)
              ═══════════════════════════════════════════════════════════════════ */}
          <DCard>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  <Activity size={15} color={C.primary} />
                  Feed de Atividades
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Últimos registros automáticos
                </div>
              </div>
            </div>

            {/* Cabeçalhos da mini-tabela */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr',
                gap: 8,
                padding: '0 0 8px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                marginBottom: 4,
              }}
            >
              {['HORÁRIO', 'AÇÃO / MÓDULO'].map(h => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.muted,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {auditLogs.slice(0, 5).map((log, i) => (
                <div
                  key={log.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr',
                    gap: 8,
                    padding: '9px 0',
                    borderBottom:
                      i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    alignItems: 'start',
                  }}
                >
                  <span style={{ fontSize: 11, color: C.muted, paddingTop: 1 }}>
                    {relTime(log.timestamp)}
                  </span>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 130,
                        }}
                      >
                        {log.userName}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {log.module}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      } as React.CSSProperties}
                    >
                      {log.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-ghost btn-sm"
              style={{
                width: '100%',
                marginTop: 12,
                fontSize: 12,
                color: C.primary,
                justifyContent: 'center',
              }}
              onClick={() => navigate('/settings')}
            >
              Ver todos os logs →
            </button>
          </DCard>
        </div>
        {/* /coluna direita */}
      </div>
      {/* /layout de duas colunas */}
    </div>
  );
};

export default Dashboard;
