// CONDOHUB — AUDITORIA DE AÇÕES

import storage from './storage';
import type { AuditLog } from '../types';

const MAX_LOGS = 500;

/**
 * Formata o objeto de detalhes em string legível.
 * Portado fielmente de window.Audit.formatDetails() em core.js.
 */
function formatDetails(details: unknown): string {
  if (!details) return '';

  if (typeof details === 'string') {
    const trimmed = details.trim();
    if (
      trimmed === '' ||
      trimmed === '{}' ||
      trimmed === '{"sub":null}' ||
      trimmed === 'null' ||
      trimmed === 'undefined'
    ) {
      return '';
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatDetails(parsed);
      }
    } catch {
      return details;
    }
  }

  if (typeof details === 'object' && details !== null) {
    const labels: Record<string, string> = {
      unit: 'Unidade',
      unitId: 'Unidade',
      amount: 'Valor',
      supplier: 'Fornecedor',
      area: 'Área',
      date: 'Data',
      name: 'Nome',
      title: 'Título',
      status: 'Status',
      category: 'Categoria',
      method: 'Forma',
      count: 'Qtd',
      email: 'E-mail',
      role: 'Perfil',
      total: 'Total',
      pickedBy: 'Retirado por',
      opt: 'Opção de Voto',
      column: 'Fase',
    };

    const parts: string[] = [];
    for (const [k, v] of Object.entries(details as Record<string, unknown>)) {
      if (v !== null && v !== undefined && v !== '' && k !== 'sub' && k !== 'id' && k !== 'userId') {
        const label = labels[k] ?? k;
        const val =
          typeof v === 'number' && (k === 'amount' || k === 'total')
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
            : String(v);
        parts.push(`${label}: ${val}`);
      }
    }
    return parts.join(' • ');
  }

  return String(details);
}

/**
 * Registra uma entrada de auditoria no localStorage.
 * Mantém no máximo 500 registros (FIFO).
 *
 * @param userId   - ID do usuário que realizou a ação
 * @param userName - Nome do usuário
 * @param action   - Descrição da ação (ex: "Login Bem-Sucedido")
 * @param module   - Módulo onde ocorreu (ex: "Autenticação")
 * @param details  - Objeto ou string com detalhes adicionais
 */
export function log(
  userId: string,
  userName: string,
  action: string,
  module: string,
  details: unknown = {}
): AuditLog {
  const existingLogs = storage.get<AuditLog[]>('audit_logs') ?? [];

  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId,
    userName,
    role: 'Sistema',
    module,
    action,
    details: formatDetails(details),
    ip: `189.120.45.${Math.floor(Math.random() * 200 + 10)}`, // Simulado — PRODUÇÃO: backend
  };

  const updatedLogs = [newLog, ...existingLogs];
  if (updatedLogs.length > MAX_LOGS) {
    updatedLogs.length = MAX_LOGS;
  }

  storage.set('audit_logs', updatedLogs);
  return newLog;
}

/**
 * Recupera logs de auditoria com filtros opcionais.
 */
export function getLogs(filter?: {
  module?: string;
  userId?: string;
  search?: string;
}): AuditLog[] {
  let logs = storage.get<AuditLog[]>('audit_logs') ?? [];

  // Remover entradas de navegação interna (compatibilidade com dados legados)
  logs = logs.filter(l => !l.action.startsWith('Acesso ao Módulo'));

  if (filter?.module) {
    logs = logs.filter(l => l.module === filter.module);
  }
  if (filter?.userId) {
    logs = logs.filter(l => l.userId === filter.userId);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    logs = logs.filter(
      l =>
        (l.details && l.details.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.userName && l.userName.toLowerCase().includes(q))
    );
  }

  return logs.map(l => ({ ...l, details: formatDetails(l.details) }));
}
