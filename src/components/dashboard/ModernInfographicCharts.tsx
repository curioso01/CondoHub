import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useThemeMode } from '../../hooks/useThemeMode';
import { security } from '../../lib/security';
import {
  TrendingUp,
  ArrowUpRight,
  PieChart as PieIcon,
  DollarSign,
  ChevronRight,
  Layers,
  ArrowDownRight
} from 'lucide-react';

export type DateFilterPeriod = '3m' | '6m' | '12m';

interface ModernInfographicChartsProps {
  onNavigateFinancial?: () => void;
}

export const ModernInfographicCharts: React.FC<ModernInfographicChartsProps> = ({
  onNavigateFinancial
}) => {
  const isDark = useThemeMode();
  const financialMonths = useAppStore(state => state.financialMonths);
  const payables = useAppStore(state => state.payables);

  // Período selecionado: 3 meses, 6 meses ou 1 ano
  const [activePeriod, setActivePeriod] = useState<DateFilterPeriod>('6m');

  // Canvas refs
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartInstance = useRef<any>(null);
  const donutChartInstance = useRef<any>(null);

  // Cores do tema QClay minimalista
  const themeColors = useMemo(() => ({
    cardBg: isDark ? 'bg-slate-900/90' : 'bg-white',
    cardBorder: isDark ? 'border-slate-800/80' : 'border-slate-100',
    cardShadow: isDark ? 'shadow-none' : 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]',
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
    revenueColor: '#3B82F6', // Royal Blue
    expenseColor: '#8B5CF6', // Purple/Violet
    balanceColor: '#10B981'  // Emerald
  }), [isDark]);

  // Formata o label do mês (ex: "2026-09" -> "Set" ou "Set/26" -> "Set")
  const formatMonthLabel = (m: string) => {
    if (m.includes('/')) return m.split('/')[0];
    const parts = m.split('-');
    if (parts.length === 2) {
      const monthNum = parseInt(parts[1], 10);
      const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return names[monthNum - 1] || m;
    }
    return m;
  };

  // Dados filtrados conforme o período
  const chartData = useMemo(() => {
    const list = financialMonths.length > 0 ? financialMonths : [
      { month: '2026-01', revenue: 38400, expenses: 31200, balance: 7200 },
      { month: '2026-02', revenue: 37800, expenses: 29800, balance: 8000 },
      { month: '2026-03', revenue: 38400, expenses: 34500, balance: 3900 },
      { month: '2026-04', revenue: 39200, expenses: 32100, balance: 7100 },
      { month: '2026-05', revenue: 38400, expenses: 30400, balance: 8000 },
      { month: '2026-06', revenue: 37600, expenses: 33800, balance: 3800 },
      { month: '2026-07', revenue: 38400, expenses: 31900, balance: 6500 },
      { month: '2026-08', revenue: 38400, expenses: 29500, balance: 8900 },
      { month: '2026-09', revenue: 39000, expenses: 32700, balance: 6300 },
      { month: '2026-10', revenue: 38400, expenses: 35200, balance: 3200 },
      { month: '2026-11', revenue: 38400, expenses: 30900, balance: 7500 },
      { month: '2026-12', revenue: 39600, expenses: 33400, balance: 6200 }
    ];

    let count = 6;
    if (activePeriod === '3m') count = 3;
    if (activePeriod === '12m') count = 12;

    // Até o mês de setembro (mês 9) ou os últimos do período
    const sliced = list.slice(Math.max(0, 9 - count), 9);
    const labels = sliced.map(item => formatMonthLabel(item.month));
    const revenues = sliced.map(item => item.revenue);
    const expenses = sliced.map(item => item.expenses);
    const balances = sliced.map(item => item.balance);

    const latest = sliced[sliced.length - 1] || { revenue: 39000, expenses: 32700, balance: 6300 };

    return {
      labels,
      revenues,
      expenses,
      balances,
      currentRevenue: latest.revenue,
      currentExpense: latest.expenses,
      currentBalance: latest.balance,
      superavitPercent: latest.revenue > 0 ? ((latest.balance / latest.revenue) * 100).toFixed(1) : '16.1'
    };
  }, [financialMonths, activePeriod]);

  // Dados da Distribuição de Custos por Categoria
  const expenseCategories = useMemo(() => {
    return [
      { name: 'Segurança & Portaria', amount: 8900, percent: 27, color: '#3B82F6' },
      { name: 'Limpeza & Conservação', amount: 7150, percent: 22, color: '#8B5CF6' },
      { name: 'Manutenção Predial', amount: 6730, percent: 21, color: '#10B981' },
      { name: 'Utilidades (Água/Luz)', amount: 5550, percent: 17, color: '#F59E0B' },
      { name: 'Gestão & Seguros', amount: 4370, percent: 13, color: '#EC4899' }
    ];
  }, []);

  const totalExpenseAmount = useMemo(() => {
    return expenseCategories.reduce((acc, cat) => acc + cat.amount, 0);
  }, [expenseCategories]);

  // 1. Renderização do Gráfico Spline de Fluxo Financeiro (Chart.js)
  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !lineChartRef.current) return;

    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
    }

    const ctx = lineChartRef.current.getContext('2d');
    if (!ctx) return;

    // Gradiente suave de Receitas
    const gradRevenue = ctx.createLinearGradient(0, 0, 0, 240);
    gradRevenue.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.18)');
    gradRevenue.addColorStop(1, 'rgba(59, 130, 246, 0.00)');

    // Gradiente suave de Despesas
    const gradExpense = ctx.createLinearGradient(0, 0, 0, 240);
    gradExpense.addColorStop(0, isDark ? 'rgba(139, 92, 246, 0.30)' : 'rgba(139, 92, 246, 0.14)');
    gradExpense.addColorStop(1, 'rgba(139, 92, 246, 0.00)');

    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Receitas',
            data: chartData.revenues,
            borderColor: themeColors.revenueColor,
            backgroundColor: gradRevenue,
            borderWidth: 2.5,
            fill: true,
            tension: 0.38,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: themeColors.revenueColor,
            pointHoverBorderWidth: 3
          },
          {
            label: 'Despesas',
            data: chartData.expenses,
            borderColor: themeColors.expenseColor,
            backgroundColor: gradExpense,
            borderWidth: 2.5,
            fill: true,
            tension: 0.38,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: themeColors.expenseColor,
            pointHoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            titleColor: isDark ? '#F8FAFC' : '#0F172A',
            bodyColor: isDark ? '#94A3B8' : '#475569',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            cornerRadius: 12,
            titleFont: { size: 12, weight: '700' },
            bodyFont: { size: 12, weight: '500' },
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y || 0;
                return ` ${label}: R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: isDark ? '#64748B' : '#94A3B8',
              font: { size: 11, weight: '500' },
              padding: 8
            },
            border: {
              display: false
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: themeColors.gridColor
            },
            ticks: {
              color: isDark ? '#64748B' : '#94A3B8',
              font: { size: 11, weight: '500' },
              padding: 10,
              callback: (val: any) => {
                return `R$ ${(val / 1000).toFixed(0)}k`;
              }
            },
            border: {
              display: false
            }
          }
        }
      }
    });

    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
    };
  }, [chartData, isDark, themeColors]);

  // 2. Renderização do Gráfico de Donut / Rosca Minimalista (Chart.js)
  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !donutChartRef.current) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    const ctx = donutChartRef.current.getContext('2d');
    if (!ctx) return;

    donutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: expenseCategories.map(c => c.name),
        datasets: [
          {
            data: expenseCategories.map(c => c.amount),
            backgroundColor: expenseCategories.map(c => c.color),
            borderWidth: 2,
            borderColor: isDark ? '#0F172A' : '#FFFFFF',
            hoverOffset: 4,
            spacing: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            titleColor: isDark ? '#F8FAFC' : '#0F172A',
            bodyColor: isDark ? '#94A3B8' : '#475569',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const val = context.raw || 0;
                return ` ${label}: R$ ${val.toLocaleString('pt-BR')}`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [expenseCategories, isDark]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* CARD ESQUERDO (8 COLS): FLUXO FINANCEIRO & BALANÇO */}
      <div
        className={`lg:col-span-8 rounded-2xl p-6 ${themeColors.cardBg} border ${themeColors.cardBorder} ${themeColors.cardShadow} flex flex-col justify-between`}
      >
        <div>
          {/* Header do Card com Filtros Pills estilo QClay */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 className={`text-base font-bold ${themeColors.textPrimary} tracking-tight`}>
                Fluxo Financeiro & Balanço
              </h3>
              <p className={`text-xs ${themeColors.textMuted} mt-0.5`}>
                Evolução mensal de receitas arrecadadas vs despesas operacionais
              </p>
            </div>

            {/* Pill Switcher de Período */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 self-start sm:self-auto">
              <button
                onClick={() => setActivePeriod('3m')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePeriod === '3m'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3 Meses
              </button>
              <button
                onClick={() => setActivePeriod('6m')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePeriod === '6m'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                6 Meses
              </button>
              <button
                onClick={() => setActivePeriod('12m')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePeriod === '12m'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1 Ano
              </button>
            </div>
          </div>

          {/* Destaques Numéricos do Gráfico */}
          <div className="flex flex-wrap items-center gap-6 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Receitas Mês
                </span>
                <span className={`text-base font-extrabold ${themeColors.textPrimary}`}>
                  {security.maskMoney(chartData.currentRevenue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Despesas Mês
                </span>
                <span className={`text-base font-extrabold ${themeColors.textPrimary}`}>
                  {security.maskMoney(chartData.currentExpense)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <TrendingUp size={13} />
                <span>Superávit: +{chartData.superavitPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas da Curva Spline */}
        <div className="relative w-full h-[250px] sm:h-[270px] mt-2">
          <canvas ref={lineChartRef} />
        </div>
      </div>

      {/* CARD DIREITO (4 COLS): DISTRIBUIÇÃO DE DESPESAS */}
      <div
        className={`lg:col-span-4 rounded-2xl p-6 ${themeColors.cardBg} border ${themeColors.cardBorder} ${themeColors.cardShadow} flex flex-col justify-between`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 className={`text-base font-bold ${themeColors.textPrimary} tracking-tight`}>
                Composição de Custos
              </h3>
              <p className={`text-xs ${themeColors.textMuted} mt-0.5`}>
                Despesas operacionais por categoria
              </p>
            </div>
            {onNavigateFinancial && (
              <button
                onClick={onNavigateFinancial}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Detalhes <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* Gráfico Donut com Total Centralizado */}
          <div className="relative w-full h-[175px] my-3 flex items-center justify-center">
            <canvas ref={donutChartRef} />
            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Mês
              </span>
              <span className={`text-lg font-black ${themeColors.textPrimary} tracking-tight`}>
                {security.maskMoney(totalExpenseAmount)}
              </span>
            </div>
          </div>

          {/* Lista Limpa das Categorias (Estilo QClay) */}
          <div className="space-y-2.5 mt-2">
            {expenseCategories.map(cat => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className={`font-medium ${themeColors.textPrimary} truncate`}>
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    {cat.percent}%
                  </span>
                  <span className={`font-bold ${themeColors.textPrimary}`}>
                    {security.maskMoney(cat.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernInfographicCharts;
