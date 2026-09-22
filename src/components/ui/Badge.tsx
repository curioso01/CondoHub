import React from 'react';

const STATUS_MAP: Record<string, string> = {
  // Financeiro
  Pago: 'success',
  Pendente: 'warning',
  Vencido: 'danger',
  Atrasado: 'danger',
  // Ocorrências
  Aberta: 'info',
  Resolvida: 'success',
  'Em análise': 'warning',
  Arquivada: 'muted',
  // Reservas
  Aprovada: 'success',
  Cancelada: 'muted',
  Confirmada: 'success',
  Rejeitada: 'danger',
  // Comunicados / Geral
  Urgente: 'danger',
  Importante: 'warning',
  Normal: 'neutral',
  // Manutenção
  'Em Execução': 'primary',
  'Em andamento': 'primary',
  Concluída: 'success',
  'Aguardando Peça': 'warning',
  // Portaria / Encomendas
  'Aguardando Retirada': 'warning',
  Retirado: 'success',
  Presente: 'success',
  Saiu: 'muted'
};

export interface BadgeProps {
  status?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary' | 'muted';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  children,
  className = '',
  style
}) => {
  // Se passou status, mapeia automaticamente
  let resolvedVariant = variant;
  if (status && !resolvedVariant) {
    resolvedVariant = (STATUS_MAP[status] as any) || 'neutral';
  } else if (!resolvedVariant && typeof children === 'string') {
    resolvedVariant = (STATUS_MAP[children] as any) || 'neutral';
  }

  const variantClass = `badge-${resolvedVariant || 'neutral'}`;
  const content = children !== undefined ? children : status;

  return (
    <span className={`badge ${variantClass} ${className}`} style={style}>
      {content}
    </span>
  );
};
