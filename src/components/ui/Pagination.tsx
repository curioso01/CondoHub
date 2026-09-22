import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  total?: number;
  page?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  // Aliases for compatibility
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  perPage,
  onPageChange,
  totalItems,
  currentPage,
  pageSize,
  totalPages: propTotalPages
}) => {
  const effectiveTotal = total !== undefined ? total : totalItems ?? 0;
  const effectivePage = page !== undefined ? page : currentPage ?? 1;
  const effectivePerPage = perPage !== undefined ? perPage : pageSize ?? 10;
  const calculatedTotalPages =
    propTotalPages !== undefined
      ? propTotalPages
      : Math.max(1, Math.ceil(effectiveTotal / effectivePerPage));

  if (calculatedTotalPages <= 1 && effectiveTotal <= effectivePerPage) {
    return null;
  }

  const startRecord = effectiveTotal > 0 ? (effectivePage - 1) * effectivePerPage + 1 : 0;
  const endRecord = Math.min(effectivePage * effectivePerPage, effectiveTotal);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] mt-4">
      <div>
        Mostrando <span className="font-semibold text-[var(--color-text)]">{startRecord}</span> a{' '}
        <span className="font-semibold text-[var(--color-text)]">{endRecord}</span> de{' '}
        <span className="font-semibold text-[var(--color-text)]">{effectiveTotal}</span> registros
      </div>

      <div className="flex items-center gap-1">
        {/* Primeira página */}
        <button
          className="btn btn-sm btn-outline p-1.5"
          onClick={() => onPageChange(1)}
          disabled={effectivePage <= 1}
          title="Primeira Página"
          aria-label="Primeira página"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Página Anterior */}
        <button
          className="btn btn-sm btn-outline px-2.5 py-1.5 flex items-center gap-1"
          onClick={() => onPageChange(effectivePage - 1)}
          disabled={effectivePage <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Indicador de Página */}
        <span className="px-3 py-1 font-semibold text-[var(--color-text)] bg-[var(--color-bg)] rounded-md border border-[var(--color-border)]">
          {effectivePage} / {calculatedTotalPages}
        </span>

        {/* Próxima Página */}
        <button
          className="btn btn-sm btn-outline px-2.5 py-1.5 flex items-center gap-1"
          onClick={() => onPageChange(effectivePage + 1)}
          disabled={effectivePage >= calculatedTotalPages}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={14} />
        </button>

        {/* Última Página */}
        <button
          className="btn btn-sm btn-outline p-1.5"
          onClick={() => onPageChange(calculatedTotalPages)}
          disabled={effectivePage >= calculatedTotalPages}
          title="Última Página"
          aria-label="Última página"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};
