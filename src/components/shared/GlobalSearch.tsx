import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  Search,
  X,
  User,
  DollarSign,
  AlertTriangle,
  Wrench,
  Megaphone,
  UserCheck,
  ArrowRight
} from 'lucide-react';

interface SearchResult {
  category: string;
  title: string;
  sub: string;
  path: string;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const residents = useAppStore(state => state.residents);
  const receivables = useAppStore(state => state.receivables);
  const occurrences = useAppStore(state => state.occurrences);
  const workOrders = useAppStore(state => state.workOrders || state.maintenanceOrders);
  const announcements = useAppStore(state => state.announcements);
  const visitors = useAppStore(state => state.visitors);

  // Debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = debouncedQuery.toLowerCase().trim();
  const resultsByCategory: Record<string, SearchResult[]> = {};

  const addResult = (cat: string, item: SearchResult) => {
    if (!resultsByCategory[cat]) {
      resultsByCategory[cat] = [];
    }
    resultsByCategory[cat].push(item);
  };

  if (q.length >= 2) {
    // 1. residents (nome/unidade)
    residents.forEach(r => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        (r.cpf && r.cpf.includes(q))
      ) {
        addResult('Moradores & Unidades', {
          category: 'Moradores & Unidades',
          title: `${r.name} (${r.unit})`,
          sub: `Bloco ${r.block} • Tel: ${r.phone}`,
          path: '/cadastro',
          icon: <User size={16} className="text-blue-500" />
        });
      }
    });

    // 2. receivables (morador/unidade)
    receivables.forEach(rc => {
      if (
        (rc.resident && rc.resident.toLowerCase().includes(q)) ||
        (rc.unit && rc.unit.toLowerCase().includes(q)) ||
        (rc.type && rc.type.toLowerCase().includes(q))
      ) {
        addResult('Financeiro / Cobranças', {
          category: 'Financeiro / Cobranças',
          title: `${rc.type} - Unidade ${rc.unit} (${rc.resident || 'Morador'})`,
          sub: `R$ ${rc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Venc: ${rc.due} • Status: ${rc.status}`,
          path: '/financeiro',
          icon: <DollarSign size={16} className="text-emerald-500" />
        });
      }
    });

    // 3. occurrences (descrição/categoria)
    occurrences.forEach(o => {
      if (
        (o.description && o.description.toLowerCase().includes(q)) ||
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.category && o.category.toLowerCase().includes(q))
      ) {
        addResult('Ocorrências', {
          category: 'Ocorrências',
          title: o.title || `Ocorrência - ${o.category}`,
          sub: `${o.category} • Unidade ${o.unitOffender || o.complainingUnit || 'N/A'} • Status: ${o.status}`,
          path: '/ocorrencias',
          icon: <AlertTriangle size={16} className="text-rose-500" />
        });
      }
    });

    // 4. workOrders (título/área)
    workOrders.forEach(w => {
      if (
        (w.title && w.title.toLowerCase().includes(q)) ||
        (w.area && w.area.toLowerCase().includes(q)) ||
        (w.supplier && w.supplier.toLowerCase().includes(q))
      ) {
        addResult('Manutenção & Obras', {
          category: 'Manutenção & Obras',
          title: w.title,
          sub: `Área: ${w.area || 'Geral'} • Status: ${w.status || w.column} • ${w.supplier || 'Equipe Interna'}`,
          path: '/manutencao',
          icon: <Wrench size={16} className="text-amber-500" />
        });
      }
    });

    // 5. announcements (título/conteúdo)
    announcements.forEach(a => {
      if (
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q))
      ) {
        addResult('Comunicados', {
          category: 'Comunicados',
          title: a.title,
          sub: `${a.category} • Publicado em ${a.date || a.createdAt || 'recente'}`,
          path: '/comunicados',
          icon: <Megaphone size={16} className="text-indigo-500" />
        });
      }
    });

    // 6. visitors (nome/documento)
    visitors.forEach(v => {
      const docStr = v.document || v.doc || '';
      const destStr = v.destinationUnit || v.unit || '';
      if (
        (v.name && v.name.toLowerCase().includes(q)) ||
        docStr.toLowerCase().includes(q) ||
        destStr.toLowerCase().includes(q)
      ) {
        addResult('Portaria / Visitantes', {
          category: 'Portaria / Visitantes',
          title: `${v.name} (Doc: ${docStr || 'N/I'})`,
          sub: `Destino: Unidade ${destStr || 'Geral'} • Status: ${v.status || 'Dentro'} • Entrada: ${v.enteredAt || v.entryTime || 'Hoje'}`,
          path: '/portaria',
          icon: <UserCheck size={16} className="text-teal-500" />
        });
      }
    });
  }

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const totalResults = Object.values(resultsByCategory).reduce((acc, list) => acc + list.length, 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Campo de Busca com Ícone e Tecla Esc */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--color-border)] gap-3 bg-[var(--color-surface)]">
          <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            placeholder="Buscar moradores, taxas, ocorrências, manutenção, comunicados, portaria..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-md"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Resultados da busca agrupados por categoria */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {debouncedQuery.length < 2 ? (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
              Digite pelo menos 2 caracteres para pesquisar em todos os módulos do condomínio.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
              Nenhum registro encontrado para <b className="text-[var(--color-text)]">"{debouncedQuery}"</b>.
            </div>
          ) : (
            Object.entries(resultsByCategory).map(([category, items]) => (
              <div key={category} className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-2">
                  {category} ({items.length})
                </div>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item.path)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-bg)] border border-transparent hover:border-[var(--color-border)] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-[var(--color-bg)] group-hover:bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0 transition-colors">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[var(--color-text)] truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                            {item.sub}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
          <span>{totalResults > 0 ? `${totalResults} resultados encontrados` : 'Busca Global'}</span>
          <span>Pressione ESC para fechar</span>
        </div>
      </div>
    </div>
  );
};
