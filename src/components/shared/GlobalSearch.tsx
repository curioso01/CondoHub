// CONDOHUB — BUSCA GLOBAL (GLOBAL SEARCH MODAL)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  DollarSign,
  AlertTriangle,
  Wrench,
  Bell,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  module: string;
  route: string;
}

interface SearchResults {
  residents: SearchResult[];
  receivables: SearchResult[];
  occurrences: SearchResult[];
  workOrders: SearchResult[];
  announcements: SearchResult[];
  visitors: SearchResult[];
}

const emptyResults: SearchResults = {
  residents: [],
  receivables: [],
  occurrences: [],
  workOrders: [],
  announcements: [],
  visitors: [],
};

// Componente para destacar termo buscado
function HighlightText({ text, query }: { text?: string; query: string }) {
  if (!text) return null;
  if (!query || query.length < 2) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [isSearching, setIsSearching] = useState(false);

  // Dados do app store
  const residents = useAppStore(s => s.residents);
  const receivables = useAppStore(s => s.receivables);
  const occurrences = useAppStore(s => s.occurrences);
  const workOrders = useAppStore(s => s.workOrders);
  const announcements = useAppStore(s => s.announcements);
  const visitors = useAppStore(s => s.visitors);

  // Foco no input ao abrir e reset ao fechar
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(emptyResults);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Fechamento via teclado ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Executa a busca em todas as entidades
  const performSearch = (searchTerm: string) => {
    const term = searchTerm.toLowerCase();

    // 1. Moradores: nome e unit (ex: "Ana Paula — A101")
    const matchedResidents: SearchResult[] = residents
      .filter(r => r.name.toLowerCase().includes(term) || r.unit.toLowerCase().includes(term))
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        label: `${r.name} — ${r.unit}`,
        sublabel: `Bloco ${r.block} • ${r.type === 'proprietario' ? 'Proprietário' : 'Inquilino'}`,
        module: 'Moradores',
        route: '/cadastros',
      }));

    // 2. Recebíveis: resident e unit (ex: "Taxa Condominial — A101 • Vencido")
    const matchedReceivables: SearchResult[] = receivables
      .filter(
        rec =>
          rec.resident.toLowerCase().includes(term) ||
          rec.unit.toLowerCase().includes(term) ||
          rec.type.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(rec => ({
        id: rec.id,
        label: `${rec.type} — ${rec.unit} • ${rec.status}`,
        sublabel: `${rec.resident} • Vencimento: ${rec.due}`,
        module: 'Financeiro',
        route: '/financeiro',
      }));

    // 3. Ocorrências: description e category (ex: "Barulho excessivo — Ruído")
    const matchedOccurrences: SearchResult[] = occurrences
      .filter(
        occ =>
          (occ.title || '').toLowerCase().includes(term) ||
          occ.description.toLowerCase().includes(term) ||
          occ.category.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(occ => ({
        id: occ.id,
        label: `${occ.title || occ.description} — ${occ.category}`,
        sublabel: `Unidade: ${occ.complainingUnit} • Status: ${occ.status}`,
        module: 'Ocorrências',
        route: '/ocorrencias',
      }));

    // 4. Ordens de Serviço: title e area (ex: "Revisão elevador — Elevador")
    const matchedWorkOrders: SearchResult[] = workOrders
      .filter(
        wo =>
          wo.title.toLowerCase().includes(term) ||
          wo.area.toLowerCase().includes(term) ||
          (wo.supplier || '').toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(wo => ({
        id: wo.id,
        label: `${wo.title} — ${wo.area}`,
        sublabel: `Prioridade: ${wo.priority} • Fornecedor: ${wo.supplier}`,
        module: 'Manutenção',
        route: '/manutencao',
      }));

    // 5. Comunicados: title e category (ex: "Manutenção programada — Manutenção")
    const matchedAnnouncements: SearchResult[] = announcements
      .filter(
        ann =>
          ann.title.toLowerCase().includes(term) ||
          ann.category.toLowerCase().includes(term) ||
          ann.content.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(ann => ({
        id: ann.id,
        label: `${ann.title} — ${ann.category}`,
        sublabel: `Publicado em: ${ann.date}`,
        module: 'Comunicados',
        route: '/comunicados',
      }));

    // 6. Visitantes: name e unit (ex: "João Silva → A202")
    const matchedVisitors: SearchResult[] = visitors
      .filter(
        v =>
          v.name.toLowerCase().includes(term) ||
          v.unit.toLowerCase().includes(term) ||
          (v.doc || v.document || '').toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        label: `${v.name} → ${v.unit}`,
        sublabel: `Documento: ${v.doc || v.document || 'N/A'} • Status: ${v.status || 'Dentro'}`,
        module: 'Portaria',
        route: '/portaria',
      }));

    setResults({
      residents: matchedResidents,
      receivables: matchedReceivables,
      occurrences: matchedOccurrences,
      workOrders: matchedWorkOrders,
      announcements: matchedAnnouncements,
      visitors: matchedVisitors,
    });
  };

  // Debounce de 300ms no input
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults(emptyResults);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query.trim());
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.residents.length +
    results.receivables.length +
    results.occurrences.length +
    results.workOrders.length +
    results.announcements.length +
    results.visitors.length;

  const handleSelectResult = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 24px',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Busca Global"
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--color-surface)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        {/* ── BARRA DE BUSCA ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            gap: '12px',
            background: 'var(--color-surface)',
          }}
        >
          {isSearching ? (
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: 'var(--color-primary)', flexShrink: 0 }}
            />
          ) : (
            <Search size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar moradores, taxas, ordens de serviço, comunicados..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--color-text)',
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(emptyResults);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Limpar termo de busca"
            >
              <X size={16} />
            </button>
          )}

          <kbd
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              padding: '2px 6px',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* ── CONTEÚDO DOS RESULTADOS ─────────────────────────────────────── */}
        <div
          style={{
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Estado Inicial: menos de 3 caracteres */}
          {query.trim().length < 3 && (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '14px',
              }}
            >
              Digite pelo menos <strong>3 caracteres</strong> para buscar em todo o condomínio.
            </div>
          )}

          {/* Estado: busca realizada mas sem resultados */}
          {query.trim().length >= 3 && !isSearching && totalResultsCount === 0 && (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '14px',
              }}
            >
              Nenhum resultado encontrado para &ldquo;<strong>{query}</strong>&rdquo;.
            </div>
          )}

          {/* Categorias com resultados */}
          {results.residents.length > 0 && (
            <CategoryGroup
              title="MORADORES"
              icon={Users}
              iconColor="#3B82F6"
              items={results.residents}
              query={query}
              onSelect={handleSelectResult}
            />
          )}

          {results.receivables.length > 0 && (
            <CategoryGroup
              title="FINANCEIRO"
              icon={DollarSign}
              iconColor="#10B981"
              items={results.receivables}
              query={query}
              onSelect={handleSelectResult}
            />
          )}

          {results.occurrences.length > 0 && (
            <CategoryGroup
              title="OCORRÊNCIAS"
              icon={AlertTriangle}
              iconColor="#EF4444"
              items={results.occurrences}
              query={query}
              onSelect={handleSelectResult}
            />
          )}

          {results.workOrders.length > 0 && (
            <CategoryGroup
              title="ORDENS DE SERVIÇO"
              icon={Wrench}
              iconColor="#8B5CF6"
              items={results.workOrders}
              query={query}
              onSelect={handleSelectResult}
            />
          )}

          {results.announcements.length > 0 && (
            <CategoryGroup
              title="COMUNICADOS"
              icon={Bell}
              iconColor="#F59E0B"
              items={results.announcements}
              query={query}
              onSelect={handleSelectResult}
            />
          )}

          {results.visitors.length > 0 && (
            <CategoryGroup
              title="VISITANTES"
              icon={UserCheck}
              iconColor="#06B6D4"
              items={results.visitors}
              query={query}
              onSelect={handleSelectResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GRUPO POR CATEGORIA ──────────────────────────────────────────────────────
interface CategoryGroupProps {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor: string;
  items: SearchResult[];
  query: string;
  onSelect: (route: string) => void;
}

function CategoryGroup({
  title,
  icon: Icon,
  iconColor,
  items,
  query,
  onSelect,
}: CategoryGroupProps) {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.6px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Icon size={14} style={{ color: iconColor }} />
        <span>{title}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item.route)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            className="search-result-item"
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <HighlightText text={item.label} query={query} />
              </div>
              {item.sublabel && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px',
                  }}
                >
                  <HighlightText text={item.sublabel} query={query} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlobalSearch;
