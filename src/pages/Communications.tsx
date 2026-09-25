import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  Share2,
  Calendar,
  AlertTriangle,
  Eye,
  CheckCheck
} from 'lucide-react';
import { Announcement } from '../types';

export const Communications: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Informativo');
  const [target, setTarget] = useState('Todos os Moradores');
  const [isPinned, setIsPinned] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const { user } = useAuth();
  const { success, warning } = useToast();

  const announcements = useAppStore(state => state.announcements);
  const addAnnouncement = useAppStore(state => state.addAnnouncement);
  const deleteAnnouncement = useAppStore(state => state.deleteAnnouncement);
  const togglePinAnnouncement = useAppStore(state => state.togglePinAnnouncement);

  const categories = ['all', 'Informativo', 'Urgente', 'Manutenção', 'Regulamento', 'Convocação'];

  const filtered = announcements.filter(a => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.date || '').localeCompare(a.date || '');
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      warning('Preencha o título e a mensagem do comunicado.');
      return;
    }

    addAnnouncement({
      title,
      content,
      category,
      target,
      pinned: isPinned,
      urgent: isUrgent
    });

    success('Comunicado publicado no mural!');
    setIsNewModalOpen(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsUrgent(false);
  };

  const handleShareWhatsApp = (a: Announcement) => {
    const text = encodeURIComponent(
      `*COMUNICADO CONDOMINIAL - Residencial das Palmeiras*\n\n*${a.title}*\n\n${a.content}\n\n_Publicado pela Administração em ${a.date || 'hoje'}_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Mural de Comunicados & Avisos
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Canal oficial de transmissão e circulares da administração para moradores
          </p>
        </div>

        {user?.role !== 'MORADOR' && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Novo Comunicado
          </button>
        )}
      </div>

      {/* FILTROS POR CATEGORIA */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {cat === 'all' ? 'Todos os Avisos' : cat}
          </button>
        ))}
      </div>

      {/* GRID DE COMUNICADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-xs text-[var(--color-text-muted)]">
            Nenhum comunicado encontrado nesta categoria.
          </div>
        ) : (
          filtered.map(a => (
            <div
              key={a.id}
              className={`card p-5 space-y-3.5 transition-all flex flex-col justify-between ${
                a.pinned
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/[0.02]'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {a.pinned && (
                      <span className="badge badge-primary flex items-center gap-1">
                        <Pin size={11} fill="currentColor" /> Fixado
                      </span>
                    )}
                    {a.urgent && (
                      <span className="badge badge-danger flex items-center gap-1">
                        <AlertTriangle size={11} /> Urgente
                      </span>
                    )}
                    <Badge variant="neutral">{a.category}</Badge>
                  </div>

                  {user?.role !== 'MORADOR' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinAnnouncement(a.id)}
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        title={a.pinned ? 'Desafixar aviso' : 'Fixar no topo'}
                      >
                        <Pin size={14} className={a.pinned ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => {
                          deleteAnnouncement(a.id);
                          success('Comunicado removido.');
                        }}
                        className="p-1 text-[var(--color-text-muted)] hover:text-rose-500 transition-colors"
                        title="Excluir comunicado"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-[var(--color-text)] mb-2">
                  {a.title}
                </h3>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {a.date || a.createdAt || 'Recente'}
                  </span>
                  {a.views !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye size={13} /> {a.views} leituras
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleShareWhatsApp(a)}
                  className="text-[var(--color-primary)] hover:underline flex items-center gap-1 text-xs font-semibold"
                >
                  <Share2 size={13} /> Compartilhar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL NOVO COMUNICADO */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Publicar Comunicado no Mural"
        size="md"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Publicar Agora
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Título do Comunicado</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Interrupção Temporária no Fornecimento de Água"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="Informativo">Informativo</option>
                <option value="Urgente">Urgente</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Regulamento">Regulamento</option>
                <option value="Convocação">Convocação</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Público-Alvo</label>
              <select
                className="form-control"
                value={target}
                onChange={e => setTarget(e.target.value)}
              >
                <option value="Todos os Moradores">Todos os Moradores</option>
                <option value="Bloco A">Apenas Bloco A</option>
                <option value="Bloco B">Apenas Bloco B</option>
                <option value="Bloco C">Apenas Bloco C</option>
                <option value="Bloco D">Apenas Bloco D</option>
                <option value="Proprietários">Apenas Proprietários</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mensagem / Texto Completo</label>
            <textarea
              className="form-control"
              rows={5}
              placeholder="Digite o conteúdo detalhado do aviso aos condôminos..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
              />
              Fixar no topo do mural
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-600">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={e => setIsUrgent(e.target.checked)}
              />
              Marcar como Alerta Urgente
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Communications;
