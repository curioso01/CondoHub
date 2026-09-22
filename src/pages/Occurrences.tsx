import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  EyeOff,
  User,
  MessageSquare,
  Search,
  Send
} from 'lucide-react';
import { OccurrenceStatus, Priority, Occurrence } from '../types';

export const Occurrences: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOcc, setSelectedOcc] = useState<Occurrence | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form states - Nova Ocorrência
  const [category, setCategory] = useState('Barulho / Perturbação');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Média');
  const [unitOffender, setUnitOffender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { user } = useAuth();
  const { success, warning } = useToast();

  const occurrences = useAppStore(state => state.occurrences);
  const addOccurrence = useAppStore(state => state.addOccurrence);
  const updateOccurrenceStatus = useAppStore(state => state.updateOccurrenceStatus);

  const filtered = occurrences.filter(occ => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      occ.category.toLowerCase().includes(q) ||
      occ.description.toLowerCase().includes(q) ||
      (occ.unitOffender || occ.offendingUnit || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || occ.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      warning('Descreva os fatos da ocorrência.');
      return;
    }

    const myUnit = user?.unitId || 'A101';
    const myName = isAnonymous ? 'Anônimo' : (user?.name || 'Morador');

    addOccurrence({
      category,
      description,
      priority,
      status: 'Aberta',
      resident: myName,
      complainingUnit: myUnit,
      unitOffender: unitOffender || undefined,
      isAnonymous
    });

    success('Ocorrência registrada no livro digital da administração!');
    setIsNewModalOpen(false);
    setDescription('');
    setUnitOffender('');
    setIsAnonymous(false);
  };

  const handleResolve = (status: OccurrenceStatus) => {
    if (!selectedOcc) return;
    updateOccurrenceStatus(selectedOcc.id, status, resolutionText);
    success(`Ocorrência atualizada para ${status}!`);
    setIsDetailsModalOpen(false);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Livro de Ocorrências & Notificações
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Registro oficial de incidentes, barulho, garagens e resolução administrativa com SLA
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn btn-sm btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Registrar Ocorrência
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="card p-3.5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            className="form-control pl-9 text-xs"
            placeholder="Buscar por categoria, descrição ou unidade infratora..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        <select
          className="form-control text-xs w-full sm:w-48"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          <option value="Aberta">Aberta</option>
          <option value="Em análise">Em análise</option>
          <option value="Em providência">Em providência</option>
          <option value="Resolvida">Resolvida</option>
        </select>
      </div>

      {/* TABELA DE OCORRÊNCIAS */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Categoria</th>
                <th>Descrição dos Fatos</th>
                <th>Unidade Notificante</th>
                <th>Unidade Infratora</th>
                <th>Prioridade</th>
                <th>Status / SLA</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map(occ => (
                  <tr
                    key={occ.id}
                    onClick={() => {
                      setSelectedOcc(occ);
                      setIsDetailsModalOpen(true);
                    }}
                    className="cursor-pointer hover:bg-[var(--color-bg)]"
                  >
                    <td className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {occ.date || occ.createdAt || 'Hoje'}
                    </td>
                    <td className="font-bold text-xs text-[var(--color-text)]">
                      {occ.category}
                    </td>
                    <td className="text-xs text-[var(--color-text-muted)] max-w-sm truncate">
                      {occ.description}
                    </td>
                    <td className="text-xs">
                      {occ.isAnonymous || occ.anonymous ? (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)] italic">
                          <EyeOff size={13} /> Anônimo
                        </span>
                      ) : (
                        <span>{occ.complainingUnit || 'A101'}</span>
                      )}
                    </td>
                    <td className="font-bold text-xs text-rose-600">
                      {occ.unitOffender || occ.offendingUnit || 'Área Comum'}
                    </td>
                    <td>
                      <Badge
                        variant={
                          occ.priority === 'Urgente' || occ.priority === 'Alta'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {occ.priority}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            occ.status === 'Resolvida'
                              ? 'success'
                              : occ.status === 'Aberta'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {occ.status}
                        </Badge>
                        {occ.status !== 'Resolvida' && occ.slaHoursLeft !== undefined && (
                          <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                            <Clock size={11} /> {occ.slaHoursLeft}h
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedOcc(occ);
                          setIsDetailsModalOpen(true);
                        }}
                        className="btn btn-sm btn-outline text-xs py-1"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR NOVA OCORRÊNCIA */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Registrar Ocorrência no Livro da Administração"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateOccurrence}>
              Protocolar Ocorrência
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOccurrence} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Categoria do Incidente</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Barulho / Perturbação">Barulho / Perturbação da Tranquilidade</option>
                <option value="Garagem / Estacionamento">Garagem / Estacionamento Indevido</option>
                <option value="Animais de Estimação">Animais de Estimação / Regras</option>
                <option value="Lixo / Descarte Irregular">Lixo / Descarte Irregular</option>
                <option value="Danos ao Patrimônio">Danos ao Patrimônio Comum</option>
                <option value="Convivência / Outros">Convivência / Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gravidade / Prioridade</label>
              <select
                className="form-control"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Unidade Envolvida / Infratora (se souber)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Bloco B - Apt 304"
              value={unitOffender}
              onChange={e => setUnitOffender(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição Detalhada dos Fatos</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Relate com precisão data, horário aproximado e o ocorrido..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
              />
              Registrar em Sigilo / Ocorrência Anônima (sua unidade não será exposta)
            </label>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALHES E RESOLUÇÃO DA OCORRÊNCIA */}
      {selectedOcc && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Protocolo de Ocorrência: ${selectedOcc.id}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              {user?.role !== 'MORADOR' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResolve('Em providência')}
                    className="btn btn-sm btn-outline text-xs"
                  >
                    Marcar em Providência
                  </button>
                  <button
                    onClick={() => handleResolve('Resolvida')}
                    className="btn btn-sm btn-primary text-xs"
                  >
                    Encerrar e Marcar como Resolvida
                  </button>
                </div>
              ) : (
                <div />
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between p-3.5 bg-[var(--color-bg)] rounded-lg">
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-primary)] uppercase">
                  {selectedOcc.category}
                </span>
                <h4 className="text-base font-bold text-[var(--color-text)] mt-0.5">
                  {selectedOcc.unitOffender ? `Unidade Apontada: ${selectedOcc.unitOffender}` : 'Área Comum'}
                </h4>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Notificado por: {selectedOcc.isAnonymous ? 'Anônimo' : (selectedOcc.resident || 'Morador')}
                </div>
              </div>
              <Badge
                variant={
                  selectedOcc.status === 'Resolvida'
                    ? 'success'
                    : selectedOcc.status === 'Aberta'
                    ? 'warning'
                    : 'info'
                }
              >
                {selectedOcc.status}
              </Badge>
            </div>

            <div>
              <h5 className="font-bold text-sm text-[var(--color-text)] mb-1">
                Relato do Ocorrido
              </h5>
              <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                {selectedOcc.description}
              </p>
            </div>

            {/* Linha do tempo de providências */}
            <div>
              <h5 className="font-bold text-sm text-[var(--color-text)] mb-2">
                Histórico de Providências & Parecer
              </h5>
              <div className="space-y-2 border-l-2 border-[var(--color-border)] pl-3">
                {(selectedOcc.timeline || []).map((t, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                      <span>{t.date}</span>
                      <span>•</span>
                      <b>{t.user}</b>
                    </div>
                    <div className="text-[var(--color-text)] mt-0.5">{t.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input de providência para administração */}
            {user?.role !== 'MORADOR' && selectedOcc.status !== 'Resolvida' && (
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                <label className="form-label font-bold">Adicionar Despacho / Providência Tomada</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ex: Notificado o morador da unidade infratora por advertência formal..."
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
