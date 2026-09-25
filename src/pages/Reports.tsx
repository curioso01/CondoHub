import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { audit } from '../lib/audit';
import { security } from '../lib/security';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  UserCheck
} from 'lucide-react';
import { AuditLog } from '../types';

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'financial' | 'operational' | 'audit'>('financial');
  const [period, setPeriod] = useState('2026-09');

  const { success } = useToast();

  const receivables = useAppStore(state => state.receivables);
  const payables = useAppStore(state => state.payables);
  const maintenanceOrders = useAppStore(state => state.maintenanceOrders);
  const occurrences = useAppStore(state => state.occurrences);
  const reservations = useAppStore(state => state.reservations);
  const visitors = useAppStore(state => state.visitors);

  const auditLogs = audit.getLogs();

  // Cálculos financeiros
  const totalReceitas = receivables
    .filter(r => r.status === 'Pago')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalDespesas = payables
    .filter(p => p.status === 'Pago')
    .reduce((acc, p) => acc + p.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Cálculos operacionais
  const totalOS = maintenanceOrders.length;
  const osConcluidas = maintenanceOrders.filter(o => o.status === 'Concluída').length;
  const osAbertas = totalOS - osConcluidas;

  const totalOcorrencias = occurrences.length;
  const ocorrenciasResolvidas = occurrences.filter(o => o.status === 'Resolvida').length;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (selectedReport === 'financial') {
      csvContent += 'Tipo,Unidade_ou_Fornecedor,Descricao,Vencimento,Valor,Status\n';
      receivables.forEach(r => {
        csvContent += `Receita,"${r.unit}","${r.type}",${r.due},${r.amount},${r.status}\n`;
      });
      payables.forEach(p => {
        csvContent += `Despesa,"${p.supplier}","${p.description}",${p.due},${p.amount},${p.status}\n`;
      });
    } else if (selectedReport === 'audit') {
      csvContent += 'Data/Hora,Usuario,Acao,Modulo,Detalhes\n';
      auditLogs.forEach(l => {
        const detailsStr = typeof l.details === 'string' ? l.details : JSON.stringify(l.details);
        csvContent += `"${l.timestamp || ''}","${l.userName}","${l.action}","${l.module}","${detailsStr.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += 'OS_Total,OS_Concluidas,Ocorrencias_Total,Ocorrencias_Resolvidas,Reservas_Total\n';
      csvContent += `${totalOS},${osConcluidas},${totalOcorrencias},${ocorrenciasResolvidas},${reservations.length}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${selectedReport}_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Relatório exportado em formato CSV com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight mb-2">
            Relatórios Gerenciais & Auditoria
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]" style={{ marginTop: '10px', marginBottom: '16px' }}>
            Demonstrativos consolidados, indicadores de desempenho condominial e logs de segurança
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-sm btn-outline flex items-center gap-1.5 text-xs"
          >
            <FileSpreadsheet size={14} /> Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs"
          >
            <Printer size={14} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold"
        style={{ marginBottom: '32px' }}
      >
        <button
          onClick={() => setSelectedReport('financial')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            selectedReport === 'financial'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <TrendingUp size={16} /> Demonstrativo Financeiro
        </button>
        <button
          onClick={() => setSelectedReport('operational')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            selectedReport === 'operational'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <BarChart3 size={16} /> Indicadores Operacionais
        </button>
        <button
          onClick={() => setSelectedReport('audit')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            selectedReport === 'audit'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <ShieldCheck size={16} /> Trilha de Auditoria ({auditLogs.length})
        </button>
      </div>

      {/* VIEW 1: FINANCEIRO */}
      {selectedReport === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase block">
                Total Arrecadado (Receitas)
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {security.maskMoney(totalReceitas)}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                Taxas ordinárias, fundos e reservas
              </span>
            </div>

            <div className="card p-5">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase block">
                Despesas Liquidadas
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {security.maskMoney(totalDespesas)}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                Contratos fixos, concessionárias e OS
              </span>
            </div>

            <div className="card p-5">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase block">
                Superávit / Resultado do Período
              </span>
              <div
                className={`text-2xl font-black mt-1 ${
                  saldoLiquido >= 0 ? 'text-blue-600' : 'text-rose-600'
                }`}
              >
                {security.maskMoney(saldoLiquido)}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
                Saldo transferido ao fundo de caixa
              </span>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              Resumo Sintético por Categoria de Custo
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Folha de Pagamento & Encargos', value: 18450, total: 32000 },
                { name: 'Contratos de Manutenção (Elevadores, Bombas)', value: 6800, total: 32000 },
                { name: 'Concessionárias de Água & Energia', value: 4320, total: 32000 },
                { name: 'Serviços Gerais & Jardinagem', value: 2430, total: 32000 }
              ].map((item, i) => {
                const pct = Math.round((item.value / item.total) * 100);
                return (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span>{item.name}</span>
                      <span>{security.maskMoney(item.value)} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: OPERACIONAL */}
      {selectedReport === 'operational' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-4">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
                Ordens de Serviço Abertas
              </span>
              <div className="text-2xl font-black text-amber-500 mt-1">{osAbertas}</div>
              <span className="text-[11px] text-[var(--color-text-muted)]">Em andamento / análise</span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
                OS Concluídas no Mês
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{osConcluidas}</div>
              <span className="text-[11px] text-[var(--color-text-muted)]">Índice de resolução de 85%</span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
                Ocorrências Registradas
              </span>
              <div className="text-2xl font-black text-blue-600 mt-1">{totalOcorrencias}</div>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {ocorrenciasResolvidas} resolvidas administrativamente
              </span>
            </div>

            <div className="card p-4">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold block">
                Fluxo de Visitantes
              </span>
              <div className="text-2xl font-black text-purple-600 mt-1">{visitors.length}</div>
              <span className="text-[11px] text-[var(--color-text-muted)]">Acessos monitorados na portaria</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-sm text-[var(--color-text)]">
                Taxa de Ocupação de Áreas Comuns
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Salão de Festas Nobre</span>
                  <b className="text-[var(--color-primary)]">78% de fins de semana reservados</b>
                </div>
                <div className="flex items-center justify-between">
                  <span>Churrasqueira Gourmet</span>
                  <b className="text-[var(--color-primary)]">92% de ocupação</b>
                </div>
                <div className="flex items-center justify-between">
                  <span>Espaço Zen & SPA</span>
                  <b className="text-[var(--color-primary)]">45% de ocupação</b>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quadra Poliesportiva</span>
                  <b className="text-[var(--color-primary)]">64% de ocupação</b>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-sm text-[var(--color-text)]">
                SLA Médio de Atendimento da Manutenção
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Emergências (Hidráulica / Elevadores)</span>
                  <b className="text-emerald-600">&lt; 2 horas</b>
                </div>
                <div className="flex items-center justify-between">
                  <span>Manutenção Preventiva Periódica</span>
                  <b className="text-blue-600">100% no prazo legal</b>
                </div>
                <div className="flex items-center justify-between">
                  <span>Solicitações de Moradores (Lâmpadas/Interfone)</span>
                  <b className="text-amber-600">14 horas</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TRILHA DE AUDITORIA */}
      {selectedReport === 'audit' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Data e Horário</th>
                  <th>Usuário Responsável</th>
                  <th>Módulo / Ação</th>
                  <th>Descrição dos Fatos Auditados</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhum registro de auditoria no histórico recente.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: AuditLog, i: number) => (
                    <tr key={i}>
                      <td className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                        {log.timestamp || log.createdAt || 'Recentemente'}
                      </td>
                      <td className="text-xs font-bold text-[var(--color-primary)]">
                        {log.userName}
                      </td>
                      <td>
                        <Badge variant="neutral">{log.action}</Badge>
                      </td>
                      <td className="text-xs text-[var(--color-text)] font-mono">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
