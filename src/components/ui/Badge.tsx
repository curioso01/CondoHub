// CONDOHUB — COMPONENTE BADGE DE STATUS

// ─── MAPA COMPLETO STATUS → CLASSE CSS ────────────────────────────────────────
const STATUS_CLASS_MAP: Record<string, string> = {
  // ── Financeiro — Recebíveis ────────────────────────────────────────────────
  'Pago':                    'badge-success',
  'Pendente':                'badge-warning',
  'Vencido':                 'badge-danger',
  'Em acordo':               'badge-warning',

  // ── Financeiro — Pagamentos ────────────────────────────────────────────────
  'Pago ':                   'badge-success',   // alias com espaço (defensivo)
  'Em aprovação':            'badge-warning',
  'Cancelado':               'badge-muted',

  // ── Reservas ──────────────────────────────────────────────────────────────
  'Confirmada':              'badge-success',
  'Aguardando aprovação':    'badge-warning',
  'Cancelada':               'badge-muted',
  'Concluída':               'badge-success',

  // ── Ocorrências — Status ───────────────────────────────────────────────────
  'Aberta':                  'badge-info',
  'Em análise':              'badge-warning',
  'Em providência':          'badge-warning',
  'Resolvida':               'badge-success',
  'Arquivada':               'badge-muted',

  // ── Ocorrências — Prioridade ───────────────────────────────────────────────
  'Urgente':                 'badge-danger',
  'Alta':                    'badge-danger',
  'Media':                   'badge-warning',
  'Média':                   'badge-warning',
  'Baixa':                   'badge-info',

  // ── Manutenção — OS Kanban ─────────────────────────────────────────────────
  'aberta':                  'badge-info',
  'em_analise':              'badge-warning',
  'aprovada':                'badge-primary',
  'em_execucao':             'badge-primary',
  'concluida':               'badge-success',
  'cancelada':               'badge-muted',
  'Em Execução':             'badge-primary',
  'Em Análise':              'badge-warning',
  'Aprovada':                'badge-success',

  // ── Manutenção — Preventiva ────────────────────────────────────────────────
  'Em dia':                  'badge-success',
  'Proximo':                 'badge-warning',
  'Vencendo em 30 dias':     'badge-warning',

  // ── Multas/Advertências ────────────────────────────────────────────────────
  '1ª Advertência':          'badge-warning',
  '2ª Advertência':          'badge-danger',
  'Multa':                   'badge-danger',
  'Recurso':                 'badge-warning',
  'Notificado':              'badge-info',
  'Recorrido':               'badge-warning',
  'Confirmado':              'badge-success',

  // ── Assembleias ───────────────────────────────────────────────────────────
  'Futura':                  'badge-info',
  'Realizada':               'badge-success',

  // ── Votações ──────────────────────────────────────────────────────────────
  'Encerrada':               'badge-muted',

  // ── Portaria — Visitantes ──────────────────────────────────────────────────
  'Dentro':                  'badge-info',
  'Saiu':                    'badge-muted',

  // ── Portaria — Encomendas ──────────────────────────────────────────────────
  'Aguardando Retirada':     'badge-warning',
  'Retirado':                'badge-success',

  // ── Unidades ──────────────────────────────────────────────────────────────
  'Ocupada':                 'badge-success',
  'Vaga':                    'badge-muted',
  'Em Reforma':              'badge-warning',

  // ── Fornecedores / Moradores ───────────────────────────────────────────────
  'ativo':                   'badge-success',
  'Ativo':                   'badge-success',
  'inativo':                 'badge-muted',
  'Inativo':                 'badge-muted',
  'inadimplente':            'badge-danger',
  'Inadimplente':            'badge-danger',

  // ── Documentos / Integrações ───────────────────────────────────────────────
  'Válido':                  'badge-success',
  'Conectado (Demo)':        'badge-success',
  'Desconectado':            'badge-muted',

  // ── Outros ────────────────────────────────────────────────────────────────
  'Ativo ':                  'badge-success',  // defensivo
};

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export interface BadgeProps {
  status?: string;
  variant?: string;
  children?: React.ReactNode;
  className?: string;
  /** Se true, adiciona animação pulsante (para status Urgente) */
  pulse?: boolean;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export function Badge({ status, variant, children, className = '', pulse }: BadgeProps) {
  const label = children !== undefined ? children : (status ?? variant ?? '');
  const text = typeof label === 'string' ? label : (status || '');

  let statusClass = 'badge-info';
  if (status && STATUS_CLASS_MAP[status]) {
    statusClass = STATUS_CLASS_MAP[status];
  } else if (variant) {
    statusClass = variant.startsWith('badge-') ? variant : `badge-${variant}`;
  } else if (typeof children === 'string' && STATUS_CLASS_MAP[children]) {
    statusClass = STATUS_CLASS_MAP[children];
  }

  const isUrgent = text === 'Urgente' || pulse;

  return (
    <span
      className={`badge ${statusClass}${isUrgent ? ' badge-urgent-pulse' : ''} ${className}`.trim()}
    >
      {label}
    </span>
  );
}

/**
 * Retorna apenas a classe CSS correspondente ao status.
 * Útil para aplicar em outros elementos sem usar o componente Badge.
 */
export function getBadgeClass(status: string): string {
  return STATUS_CLASS_MAP[status] ?? 'badge-info';
}

export default Badge;
