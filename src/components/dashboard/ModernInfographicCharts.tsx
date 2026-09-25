import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useThemeMode } from '../../hooks/useThemeMode';
import { security } from '../../lib/security';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Sparkles,
  PieChart as PieIcon,
  Calendar,
  ArrowUpRight,
  Maximize2,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export type DateFilterPeriod = 'day' | 'biweek' | 'month' | 'quarter' | 'semester' | 'year';

interface ModernInfographicChartsProps {
  onNavigateFinancial?: () => void;
}

interface PeriodData {
  labels: string[];
  revenues: number[];
  expenses: number[];
  balances: number[];
  growth: number;
  periodLabel: string;
  donutData: {
    labels: string[];
    values: number[];
  };
}

export const ModernInfographicCharts: React.FC<ModernInfographicChartsProps> = ({
  onNavigateFinancial
}) => {
  const isDark = useThemeMode();
  const financialMonths = useAppStore(state => state.financialMonths);

  // 1. Estados dos Filtros
  const [activePeriod, setActivePeriod] = useState<DateFilterPeriod>('month');
  const [activeChartTab, setActiveChartTab] = useState<'wave' | 'bars'>('wave');

  // Canvas refs para Chart.js
  const mainChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const mainChartInstance = useRef<any>(null);
  const donutChartInstance = useRef<any>(null);

  // Configurações de cores e estilo visual inspiradas no infográfico cyber/neon
  const colors = useMemo(() => ({
    cyanNeon: '#00F2FE',
    cyanBright: '#38BDF8',
    cyanMuted: '#0EA5E9',
    blueElectric: '#2563EB',
    blueDeep: '#1D4ED8',
    tealNeon: '#06B6D4',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.14)',
    textColor: isDark ? '#94A3B8' : '#64748B',
    textHighlight: isDark ? '#F8FAFC' : '#0F172A',
    cardBg: isDark
      ? 'linear-gradient(155deg, #0B132B 0%, #0F172A 60%, #172554 100%)'
      : 'linear-gradient(155deg, #FFFFFF 0%, #F8FAFC 60%, #F0F9FF 100%)',
    innerCardBg: isDark ? 'rgba(15, 23, 42, 0.55)' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(148, 163, 184, 0.22)',
    cardShadow: isDark
      ? '0 20px 45px -15px rgba(0, 0, 0, 0.7), 0 0 25px -8px rgba(0, 242, 254, 0.10)'
      : '0 8px 24px -8px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)'
  }), [isDark]);

  // 2. Gerador Dinâmico de Dados para cada Granularidade de Período
  const currentPeriodData = useMemo<PeriodData>(() => {
    switch (activePeriod) {
      case 'day': {
        // VISUALIZAÇÃO DIÁRIA (Últimos 8 Dias Úteis/Correntes)
        const labels = ['15/Set', '16/Set', '17/Set', '18/Set', '19/Set', '20/Set', '21/Set', '22/Set'];
        const revenues = [2150, 3840, 1920, 5100, 2800, 1400, 3950, 4200];
        const expenses = [1600, 2100, 1850, 3200, 2400, 950, 2800, 3100];
        const balances = [58200, 59940, 60010, 61910, 62310, 62760, 63910, 65010];
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: 14.8,
          periodLabel: 'Últimos 8 Dias',
          donutData: {
            labels: ['Folha Portaria (44%)', 'Manutenção Diária (26%)', 'Limpeza & Insumos (18%)', 'Outros (12%)'],
            values: [7400, 4370, 3020, 2020]
          }
        };
      }

      case 'biweek': {
        // VISUALIZAÇÃO QUINZENAL (6 Quinzenas Recentes)
        const labels = ['1ªQ Jul', '2ªQ Jul', '1ªQ Ago', '2ªQ Ago', '1ªQ Set', '2ªQ Set'];
        const revenues = [22400, 21700, 22100, 21800, 23200, 22000];
        const expenses = [18200, 18600, 19100, 19400, 18500, 18900];
        const balances = [48100, 51200, 54200, 56600, 61300, 64400];
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: 12.3,
          periodLabel: 'Últimas 6 Quinzenas',
          donutData: {
            labels: ['Pessoal & Encargos (47%)', 'Consumos Água/Luz (23%)', 'Manutenção Preventiva (16%)', 'Contratos (14%)'],
            values: [17500, 8560, 5950, 5210]
          }
        };
      }

      case 'month': {
        // VISUALIZAÇÃO MENSAL (6 Meses Reais do Store ou Fallback Consistente)
        const fallback = [
          { month: 'Abr/26', revenue: 42500, expenses: 38200, balance: 35600 },
          { month: 'Mai/26', revenue: 43200, expenses: 37900, balance: 40900 },
          { month: 'Jun/26', revenue: 42800, expenses: 39100, balance: 44600 },
          { month: 'Jul/26', revenue: 44100, expenses: 36800, balance: 51900 },
          { month: 'Ago/26', revenue: 43900, expenses: 38500, balance: 57300 },
          { month: 'Set/26', revenue: 45200, expenses: 37400, balance: 65100 }
        ];
        const base = financialMonths.length >= 6 ? financialMonths.slice(-6) : fallback;
        const labels = base.map(m => m.month.toUpperCase());
        const revenues = base.map(m => m.revenue);
        const expenses = base.map(m => m.expenses);
        const balances = base.map(m => m.balance);
        const growth = ((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 100;
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: Number(growth.toFixed(1)),
          periodLabel: 'Últimos 6 Meses',
          donutData: {
            labels: ['Pessoal & RH (48%)', 'Água & Energia (22%)', 'Manutenção Predial (15%)', 'Segurança (10%)', 'Outros (5%)'],
            values: [14200, 5800, 3950, 2800, 1450]
          }
        };
      }

      case 'quarter': {
        // VISUALIZAÇÃO TRIMESTRAL (4 Trimestres Anteriores + Atual)
        const labels = ['3º Tri/25', '4º Tri/25', '1º Tri/26', '2º Tri/26', '3º Tri/26'];
        const revenues = [126800, 129400, 131200, 130100, 133200];
        const expenses = [112400, 116200, 115800, 114300, 112700];
        const balances = [38400, 48200, 53600, 59400, 65100];
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: 16.5,
          periodLabel: 'Últimos 5 Trimestres',
          donutData: {
            labels: ['Folha & Encargos (49%)', 'Utilidades Públicas (21%)', 'Manutenção & Obras (17%)', 'Assessoria & Seguro (13%)'],
            values: [55200, 23650, 19150, 14700]
          }
        };
      }

      case 'semester': {
        // VISUALIZAÇÃO SEMESTRAL (4 Semestres Históricos)
        const labels = ['1º Sem/24', '2º Sem/24', '1º Sem/25', '2º Sem/25', '1º Sem/26', '2º Sem/26'];
        const revenues = [242000, 249000, 256000, 261000, 268500, 274200];
        const expenses = [221000, 226000, 231500, 234000, 232100, 228900];
        const balances = [21000, 27500, 35000, 44000, 55000, 65100];
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: 18.4,
          periodLabel: 'Últimos 6 Semestres',
          donutData: {
            labels: ['Recursos Humanos (48%)', 'Água, Luz & Gás (22%)', 'Conservação & Reformas (16%)', 'Contratos de Portaria (14%)'],
            values: [109800, 50350, 36600, 32150]
          }
        };
      }

      case 'year': {
        // VISUALIZAÇÃO ANUAL (Histórico Consolidado 2022 a 2026 + Projeção)
        const labels = ['2022', '2023', '2024', '2025', '2026 (Atual)', '2027 (Proj)'];
        const revenues = [460000, 485000, 510000, 532000, 548000, 575000];
        const expenses = [428000, 446000, 465000, 478000, 482900, 502000];
        const balances = [32000, 39000, 45000, 54000, 65100, 73000];
        return {
          labels,
          revenues,
          expenses,
          balances,
          growth: 21.2,
          periodLabel: 'Histórico Anual',
          donutData: {
            labels: ['Pessoal & Encargos (48%)', 'Concessionárias (21%)', 'Obras & Melhorias (17%)', 'Administração & Legal (14%)'],
            values: [231800, 101400, 82100, 67600]
          }
        };
      }

      default:
        return {
          labels: [],
          revenues: [],
          expenses: [],
          balances: [],
          growth: 0,
          periodLabel: '',
          donutData: { labels: [], values: [] }
        };
    }
  }, [activePeriod, financialMonths]);

  // Cálculos consolidados para exibição nos badges
  const totalRevenues = useMemo(() => {
    return currentPeriodData.revenues.reduce((acc, cur) => acc + cur, 0);
  }, [currentPeriodData]);

  const totalExpenses = useMemo(() => {
    return currentPeriodData.expenses.reduce((acc, cur) => acc + cur, 0);
  }, [currentPeriodData]);

  const latestBalance = useMemo(() => {
    return currentPeriodData.balances[currentPeriodData.balances.length - 1] || 65100;
  }, [currentPeriodData]);

  // 3. Renderização Dinâmica do Gráfico Principal (Chart.js Line ou Bar)
  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !mainChartRef.current) return;

    if (mainChartInstance.current) {
      mainChartInstance.current.destroy();
    }

    const ctx = mainChartRef.current.getContext('2d');
    if (!ctx) return;

    // Gradiente Vertical para a Área Suave (Spline Wave) com altura confortável
    const waveFillGradient = ctx.createLinearGradient(0, 0, 0, 340);
    if (isDark) {
      waveFillGradient.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
      waveFillGradient.addColorStop(0.35, 'rgba(14, 165, 233, 0.20)');
      waveFillGradient.addColorStop(1, 'rgba(30, 58, 138, 0.0)');
    } else {
      waveFillGradient.addColorStop(0, 'rgba(2, 132, 199, 0.32)');
      waveFillGradient.addColorStop(0.45, 'rgba(56, 189, 248, 0.12)');
      waveFillGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    }

    // Gradiente Vertical para as Barras em Cápsula (Pill Bars)
    const barGradient = ctx.createLinearGradient(0, 0, 0, 340);
    if (isDark) {
      barGradient.addColorStop(0, '#00F2FE');
      barGradient.addColorStop(0.55, '#0284C7');
      barGradient.addColorStop(1, '#1E3A8A');
    } else {
      barGradient.addColorStop(0, '#0284C7');
      barGradient.addColorStop(0.55, '#0EA5E9');
      barGradient.addColorStop(1, '#3B82F6');
    }

    const barExpensesGradient = ctx.createLinearGradient(0, 0, 0, 340);
    if (isDark) {
      barExpensesGradient.addColorStop(0, '#38BDF8');
      barExpensesGradient.addColorStop(1, '#1E293B');
    } else {
      barExpensesGradient.addColorStop(0, '#60A5FA');
      barExpensesGradient.addColorStop(1, '#93C5FD');
    }

    if (activeChartTab === 'wave') {
      // MODO SPLINE WAVE: Curva contínua suave com espaçamento e respiração excelentes
      mainChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: currentPeriodData.labels,
          datasets: [
            {
              label: 'Receita Arrecadada (R$)',
              data: currentPeriodData.revenues,
              borderColor: isDark ? '#00F2FE' : '#0284C7',
              borderWidth: 3,
              tension: 0.42,
              fill: true,
              backgroundColor: waveFillGradient,
              pointBackgroundColor: isDark ? '#00F2FE' : '#0284C7',
              pointBorderColor: isDark ? '#0B132B' : '#FFFFFF',
              pointBorderWidth: 2,
              pointRadius: 4.5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#FFFFFF',
              pointHoverBorderColor: '#00F2FE',
              pointHoverBorderWidth: 3
            },
            {
              label: 'Despesas Realizadas (R$)',
              data: currentPeriodData.expenses,
              borderColor: isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(2, 132, 199, 0.65)',
              borderWidth: 2.2,
              borderDash: [6, 6],
              tension: 0.42,
              fill: false,
              pointRadius: 3.5,
              pointBackgroundColor: isDark ? '#38BDF8' : '#0EA5E9'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 16,
              right: 16,
              bottom: 8,
              left: 8
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 14,
                boxHeight: 6,
                usePointStyle: true,
                pointStyle: 'circle',
                color: colors.textColor,
                font: { size: 12, weight: '600' },
                padding: 22
              }
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(11, 19, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              titleColor: isDark ? '#F8FAFC' : '#0F172A',
              titleFont: { size: 12, weight: '700' },
              bodyColor: isDark ? '#38BDF8' : '#0284C7',
              bodyFont: { size: 12, weight: '600' },
              borderColor: isDark ? 'rgba(0, 242, 254, 0.45)' : 'rgba(2, 132, 199, 0.35)',
              borderWidth: 1,
              padding: 14,
              cornerRadius: 12,
              boxPadding: 6,
              callbacks: {
                label: (context: any) => {
                  return ` ${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: colors.gridColor,
                tickLength: 0
              },
              ticks: {
                color: colors.textColor,
                font: { size: 11, weight: '500' },
                callback: (val: any) => {
                  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
                  return `R$ ${val}`;
                },
                padding: 12
              },
              border: { dash: [4, 4] }
            },
            x: {
              grid: {
                color: colors.gridColor,
                tickLength: 0
              },
              ticks: {
                color: colors.textColor,
                font: { size: 11, weight: '600' },
                padding: 12
              },
              border: { dash: [4, 4] }
            }
          }
        }
      });
    } else {
      // MODO PILL BARS: Barras arredondadas estilo cápsula com gradiente e espaçamento
      mainChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: currentPeriodData.labels,
          datasets: [
            {
              label: 'Arrecadação (R$)',
              data: currentPeriodData.revenues,
              backgroundColor: barGradient,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.62,
              categoryPercentage: 0.68
            },
            {
              label: 'Custos Realizados (R$)',
              data: currentPeriodData.expenses,
              backgroundColor: barExpensesGradient,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.62,
              categoryPercentage: 0.68
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 16,
              right: 16,
              bottom: 8,
              left: 8
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                color: colors.textColor,
                font: { size: 12, weight: '600' },
                padding: 22
              }
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(11, 19, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              titleColor: isDark ? '#F8FAFC' : '#0F172A',
              titleFont: { size: 12, weight: '700' },
              bodyColor: isDark ? '#38BDF8' : '#0284C7',
              bodyFont: { size: 12, weight: '600' },
              borderColor: isDark ? 'rgba(0, 242, 254, 0.45)' : 'rgba(2, 132, 199, 0.35)',
              borderWidth: 1,
              padding: 14,
              cornerRadius: 12,
              callbacks: {
                label: (context: any) => {
                  return ` ${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: colors.gridColor },
              ticks: {
                color: colors.textColor,
                font: { size: 11 },
                callback: (val: any) => {
                  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
                  return `R$ ${val}`;
                },
                padding: 12
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: colors.textColor,
                font: { size: 11, weight: '600' },
                padding: 12
              }
            }
          }
        }
      });
    }

    return () => {
      if (mainChartInstance.current) {
        mainChartInstance.current.destroy();
      }
    };
  }, [activeChartTab, isDark, currentPeriodData, colors]);

  // 4. Renderização Dinâmica do Gráfico de Donut / Rosca Futurista
  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !donutChartRef.current) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    const ctx = donutChartRef.current.getContext('2d');
    if (!ctx) return;

    const donutColors = isDark
      ? ['#00F2FE', '#38BDF8', '#0EA5E9', '#2563EB', '#1E40AF']
      : ['#0284C7', '#0EA5E9', '#38BDF8', '#1D4ED8', '#64748B'];

    donutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: currentPeriodData.donutData.labels,
        datasets: [
          {
            data: currentPeriodData.donutData.values,
            backgroundColor: donutColors,
            borderWidth: isDark ? 3 : 2,
            borderColor: isDark ? '#0B132B' : '#FFFFFF',
            hoverOffset: 6,
            spacing: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%', // Espessura arejada para não espremer o centro
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              color: colors.textColor,
              font: { size: 10.5, weight: '500' },
              padding: 14
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(11, 19, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            titleColor: isDark ? '#F8FAFC' : '#0F172A',
            bodyColor: isDark ? '#38BDF8' : '#0284C7',
            borderColor: isDark ? 'rgba(0, 242, 254, 0.45)' : 'rgba(2, 132, 199, 0.35)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (context: any) => {
                return ` ${context.label}: R$ ${context.parsed.toLocaleString('pt-BR')}`;
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
  }, [isDark, currentPeriodData, colors]);

  const periodOptions: { id: DateFilterPeriod; label: string }[] = [
    { id: 'day', label: 'Dia' },
    { id: 'biweek', label: 'Quinzena' },
    { id: 'month', label: 'Mês' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'semester', label: 'Semestre' },
    { id: 'year', label: 'Anual' }
  ];

  return (
    <div
      className="analytics-infographic-container rounded-2xl p-6 sm:p-8 space-y-7 transition-all duration-300"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.cardShadow
      }}
    >
      {/* 1. SEÇÃO SUPERIOR: TÍTULO ESPAÇOSO & STATUS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
              style={{
                background: isDark ? 'rgba(0, 242, 254, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                color: isDark ? '#00F2FE' : '#0284C7',
                border: `1px solid ${isDark ? 'rgba(0, 242, 254, 0.3)' : 'rgba(2, 132, 199, 0.25)'}`
              }}
            >
              <Sparkles size={13} /> Analytics Executivo
            </span>

            <span className="text-xs text-[var(--color-text-muted)] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronização em tempo real
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Painel Financeiro & Desempenho
          </h3>

          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
            Acompanhamento analítico de fluxo de caixa, despesas operacionais e saúde patrimonial.
          </p>
        </div>

        {/* CONTROLE DE DETALHES GERAIS */}
        {onNavigateFinancial && (
          <button
            onClick={onNavigateFinancial}
            className="self-start lg:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/10 transition-colors shadow-xs"
            title="Abrir detalhes no financeiro"
          >
            <Maximize2 size={14} />
            <span>Ver Balancete Completo</span>
          </button>
        )}
      </div>

      {/* 2. BARRA DE FILTROS DINÂMICOS DE DATA & SELETOR DE MODO DO GRÁFICO */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm shadow-xs">
        {/* GRUPO 1: FILTRO DE PERÍODOS DE DATA (Dia, Quinzena, Mês, Trimestre, Semestre, Anual) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] shrink-0">
            <Calendar size={16} className={isDark ? 'text-cyan-400' : 'text-sky-600'} />
            <span>Filtrar Período:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {periodOptions.map(option => {
              const isActive = activePeriod === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setActivePeriod(option.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-xs'
                        : 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* GRUPO 2: TIPO DE GRÁFICO (WAVE VS BARS) */}
        <div className="flex items-center gap-2 self-start xl:self-auto shrink-0">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] hidden sm:inline">
            Modo:
          </span>
          <div
            className="p-1 rounded-xl flex items-center gap-1 border"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.9)',
              borderColor: colors.cardBorder
            }}
          >
            <button
              onClick={() => setActiveChartTab('wave')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'wave'
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-white text-sky-700 shadow-xs border border-sky-200'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Curva suave contínua (Spline Wave)"
            >
              <Activity size={14} className={activeChartTab === 'wave' ? 'text-cyan-400' : ''} />
              <span>Curva Suave (Spline)</span>
            </button>

            <button
              onClick={() => setActiveChartTab('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'bars'
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-white text-sky-700 shadow-xs border border-sky-200'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Barras em cápsula com indicador de crescimento"
            >
              <BarChart3 size={14} className={activeChartTab === 'bars' ? 'text-cyan-400' : ''} />
              <span>Barras em Cápsula</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LINHA DE MÉTRICAS DE TOPO REORGANIZADA COM ESPAÇAMENTO AREJADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Arrecadação */}
        <div
          className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200 shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <span>Arrecadação ({currentPeriodData.periodLabel})</span>
              <span className="text-emerald-500 font-bold flex items-center text-xs">
                <ArrowUpRight size={13} /> +{currentPeriodData.growth}%
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {security.maskMoney(totalRevenues)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
              <span>Eficiência de Arrecadação</span>
              <span className="font-bold text-[var(--color-text)]">98.2%</span>
            </div>
            <div className="w-full bg-cyan-950/20 dark:bg-cyan-950/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: '98.2%',
                  background: 'linear-gradient(90deg, #00F2FE, #2563EB)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Despesas */}
        <div
          className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200 shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <span>Despesas ({currentPeriodData.periodLabel})</span>
              <span className="text-sky-500 font-bold text-xs">Dentro do Limite</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {security.maskMoney(totalExpenses)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
              <span>Execução do Orçamento</span>
              <span className="font-bold text-[var(--color-text)]">84.5%</span>
            </div>
            <div className="w-full bg-cyan-950/20 dark:bg-cyan-950/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: '84.5%',
                  background: 'linear-gradient(90deg, #38BDF8, #0EA5E9)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Taxa de Adimplência */}
        <div
          className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200 shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <span>Taxa de Adimplência</span>
              <span className="text-emerald-500 font-bold text-xs">Excelente</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              96.8%
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
              <span>Meta Mínima: 90%</span>
              <span className="font-bold text-emerald-500">+6.8% superado</span>
            </div>
            <div className="w-full bg-cyan-950/20 dark:bg-cyan-950/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: '96.8%',
                  background: 'linear-gradient(90deg, #00F2FE, #10B981)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Saldo em Conta */}
        <div
          className="p-5 rounded-2xl border flex flex-col justify-between transition-all hover:translate-y-[-2px] duration-200 shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <span>Saldo Líquido em Conta</span>
              <span className="text-cyan-500 font-bold text-xs">Disponível</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] tracking-tight">
              {security.maskMoney(latestBalance)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-1.5">
              <span>Fundo Reserva: R$ 38.000</span>
              <span className="font-bold text-cyan-400">Ativo</span>
            </div>
            <div className="w-full bg-cyan-950/20 dark:bg-cyan-950/40 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: '86%',
                  background: 'linear-gradient(90deg, #00F2FE, #3B82F6)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. ÁREA CENTRAL DOS GRÁFICOS COM ALTURA AMPLIADA E SEM APERTO VISUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        {/* GRÁFICO 1: ONDULAÇÃO SUAVE (SPLINE WAVE) OU BARRAS EM CÁPSULA (PILL BARS) */}
        <div
          className="lg:col-span-2 p-6 sm:p-7 rounded-2xl border flex flex-col justify-between relative overflow-hidden shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          {/* Cabeçalho do Card com Título e Indicador de Tendência Bem Separados */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full animate-pulse shrink-0"
                  style={{ background: isDark ? '#00F2FE' : '#0284C7' }}
                />
                <h4 className="text-base sm:text-lg font-bold text-[var(--color-text)] tracking-tight">
                  {activeChartTab === 'wave'
                    ? 'Curva Contínua de Fluxo Financeiro (Spline Wave)'
                    : 'Comparativo de Arrecadação por Período'}
                </h4>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] pl-5">
                Visualização dinâmica filtrada por: <b>{currentPeriodData.periodLabel}</b>
              </p>
            </div>

            {/* Seta de Crescimento da Imagem de Referência */}
            <div
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shrink-0"
              style={{
                background: isDark ? 'rgba(0, 242, 254, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                color: isDark ? '#00F2FE' : '#0284C7',
                border: `1px solid ${isDark ? 'rgba(0, 242, 254, 0.25)' : 'rgba(2, 132, 199, 0.2)'}`
              }}
            >
              <TrendingUp size={15} />
              <span>Tendência +{currentPeriodData.growth}%</span>
            </div>
          </div>

          {/* Canvas do Gráfico com Altura Confortável */}
          <div className="relative w-full h-[300px] my-2">
            <canvas ref={mainChartRef} />
          </div>

          {/* Legenda e Notas Informativas de Rodapé com Respiro */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Receitas Efetivas
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                Custos Operacionais
              </span>
            </div>

            <div className="font-semibold text-[var(--color-text)]">
              Granularidade: {currentPeriodData.periodLabel}
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: DONUT FUTURISTA COM CENTRO AMPLO E TEXTO AREJADO */}
        <div
          className="p-6 sm:p-7 rounded-2xl border flex flex-col justify-between relative overflow-hidden shadow-xs"
          style={{
            background: colors.innerCardBg,
            borderColor: colors.cardBorder
          }}
        >
          {/* Cabeçalho do Donut com Espaçamento Confortável */}
          <div className="flex items-center justify-between mb-5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <PieIcon size={17} className={isDark ? 'text-cyan-400' : 'text-sky-600'} />
                <h4 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                  Distribuição de Gastos
                </h4>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Por centros de custo
              </p>
            </div>

            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full shadow-xs"
              style={{
                background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
                color: isDark ? '#38BDF8' : '#0369A1'
              }}
            >
              {currentPeriodData.periodLabel}
            </span>
          </div>

          {/* Canvas do Donut com Altura Harmoniosa */}
          <div className="relative w-full h-[260px] flex items-center justify-center my-auto">
            <canvas ref={donutChartRef} />

            {/* CENTRO DO DONUT COM TIPOGRAFIA ESPAÇOSA E HIERÁRQUICA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                Total do Período
              </span>
              <span
                className="text-xl sm:text-2xl font-black tracking-tight my-1"
                style={{ color: isDark ? '#00F2FE' : '#0284C7' }}
              >
                {security.maskMoney(totalExpenses)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-500">
                100% Conciliado
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-center text-xs text-[var(--color-text-muted)]">
            Auditoria automatizada com conciliação bancária diária
          </div>
        </div>
      </div>

      {/* 5. PILARES DE GESTÃO INFOGRÁFICOS (STEP 01, 02, 03) COM PADDING E RESPIRO GENEROSOS */}
      <div className="pt-2">
        <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Indicadores Chave de Conformidade ({currentPeriodData.periodLabel})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* PILAR 01 - ADIMPLÊNCIA */}
          <div
            className="p-4.5 rounded-2xl border flex items-center gap-4 transition-all shadow-xs"
            style={{
              background: colors.innerCardBg,
              borderColor: colors.cardBorder
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #00F2FE 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                color: '#FFFFFF'
              }}
            >
              01
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[var(--color-text)] truncate">
                  Adimplência das Cotas
                </span>
                <span className="font-black text-cyan-500 text-sm">96.8%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: '96.8%',
                    background: 'linear-gradient(90deg, #00F2FE, #0EA5E9)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* PILAR 02 - MANUTENÇÕES */}
          <div
            className="p-4.5 rounded-2xl border flex items-center gap-4 transition-all shadow-xs"
            style={{
              background: colors.innerCardBg,
              borderColor: colors.cardBorder
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #38BDF8 0%, #06B6D4 100%)'
                  : 'linear-gradient(135deg, #0EA5E9 0%, #0D9488 100%)',
                color: '#FFFFFF'
              }}
            >
              02
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[var(--color-text)] truncate">
                  Manutenções em Dia
                </span>
                <span className="font-black text-sky-500 text-sm">89.5%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: '89.5%',
                    background: 'linear-gradient(90deg, #38BDF8, #2563EB)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* PILAR 03 - RESOLUÇÃO NO PRAZO */}
          <div
            className="p-4.5 rounded-2xl border flex items-center gap-4 transition-all shadow-xs"
            style={{
              background: colors.innerCardBg,
              borderColor: colors.cardBorder
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
                  : 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
                color: '#FFFFFF'
              }}
            >
              03
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[var(--color-text)] truncate">
                  Resolução no Prazo
                </span>
                <span className="font-black text-blue-500 text-sm">92.0%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: '92%',
                    background: 'linear-gradient(90deg, #2563EB, #00F2FE)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
