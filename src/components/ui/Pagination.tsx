// CONDOHUB — COMPONENTE DE PAGINAÇÃO

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export interface PaginationProps {
  total?: number;
  page?: number;
  perPage?: number;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange: ((page: number) => void) | React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

// ─── HELPER — gera array de páginas com reticências ───────────────────────────
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const delta = 2; // páginas ao redor da atual

  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  pages.push(1);

  if (rangeStart > 2) pages.push('...');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 1) pages.push('...');

  pages.push(total);

  return pages;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export function Pagination({
  total,
  page,
  perPage,
  totalItems,
  currentPage,
  pageSize,
  totalPages: propTotalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  const current = page ?? currentPage ?? 1;
  const size = perPage ?? pageSize ?? 10;
  const count = total ?? totalItems ?? 0;
  const totalPages = propTotalPages ?? Math.max(1, Math.ceil(count / size));
  const from = count === 0 ? 0 : (current - 1) * size + 1;
  const to = Math.min(current * size, count);
  const pageRange = buildPageRange(current, totalPages);


  if (total === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
        }}
        className={className}
      >
        Nenhum registro encontrado.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        gap: '12px',
        flexWrap: 'wrap',
      }}
      className={className}
    >
      {/* Contador de registros */}
      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        Exibindo <strong>{from}</strong> a <strong>{to}</strong> de{' '}
        <strong>{count}</strong> registros
      </span>

      {/* Botões de página */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Primeira */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => onPageChange(1)}
          disabled={current <= 1}
          aria-label="Primeira página"
          title="Primeira"
        >
          «
        </button>

        {/* Anterior */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          aria-label="Página anterior"
        >
          Anterior
        </button>

        {/* Páginas numeradas com reticências */}
        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{
                padding: '6px 4px',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                userSelect: 'none',
              }}
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              className={`btn btn-sm ${p === current ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === current ? 'page' : undefined}
              style={{ minWidth: '34px' }}
            >
              {p}
            </button>
          )
        )}

        {/* Próxima */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= totalPages}
          aria-label="Próxima página"
        >
          Próxima
        </button>

        {/* Última */}
        <button
          className="btn btn-sm btn-outline"
          onClick={() => onPageChange(totalPages)}
          disabled={current >= totalPages}
          aria-label="Última página"
          title="Última"
        >
          »
        </button>
      </div>
    </div>
  );
}

export default Pagination;
