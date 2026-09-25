import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Calendar,
  Vote,
  FileText,
  Users,
  CheckCircle2,
  Plus,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Assembly } from '../types';

export const Assemblies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assemblies' | 'votings'>('assemblies');
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [isNewAssemblyModalOpen, setIsNewAssemblyModalOpen] = useState(false);

  // Form states - Nova Assembleia
  const [asmTitle, setAsmTitle] = useState('');
  const [asmType, setAsmType] = useState<'Ordinária' | 'Extraordinária'>('Ordinária');
  const [asmDate, setAsmDate] = useState('2026-10-15');
  const [asmTime, setAsmTime] = useState('19:30');
  const [asmLocation, setAsmLocation] = useState('Salão de Festas & Online (Híbrida)');
  const [asmQuorum, setAsmQuorum] = useState('1ª Convocação: 2/3 das Unidades | 2ª Convocação: Maioria Simples');
  const [asmPautas, setAsmPautas] = useState('1. Prestação de contas do exercício anterior\n2. Eleição de síndico e conselho fiscal\n3. Previsão orçamentária do próximo ano');

  const { user } = useAuth();
  const { success, info } = useToast();

  const assemblies = useAppStore(state => state.assemblies);
  const votings = useAppStore(state => state.votings);
  const castVote = useAppStore(state => state.castVote);
  const addAssembly = useAppStore(state => state.addAssembly);

  const handleCastVote = (votingId: string, optionId: string) => {
    const userUnit = user?.unitId || 'A101';
    castVote(votingId, userUnit, optionId);
    success(`Seu voto da Unidade ${userUnit} foi registrado com sucesso!`);
  };

  const handleCreateAssembly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asmTitle) {
      info('Informe o título da assembleia.');
      return;
    }

    const agendaItems = asmPautas.split('\n').filter(p => p.trim().length > 0).map((p, idx) => ({
      id: idx + 1,
      title: p.trim(),
      description: 'Deliberação e votação regimental',
      type: 'Deliberativa'
    }));

    addAssembly({
      title: asmTitle,
      type: asmType,
      date: asmDate,
      time: asmTime,
      location: asmLocation,
      quorum: asmQuorum,
      status: 'Futura',
      agenda: agendaItems,
      minutes: null
    });

    success('Edital de Convocação de Assembleia publicado!');
    setIsNewAssemblyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight mb-2">
            Assembleias & Votações Virtuais
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]" style={{ marginTop: '10px', marginBottom: '16px' }}>
            Editais de convocação, atas deliberativas assinadas e enquetes por fração ideal
          </p>
        </div>

        {user?.role !== 'MORADOR' && (
          <button
            onClick={() => setIsNewAssemblyModalOpen(true)}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Convocar Assembleia
          </button>
        )}
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold"
        style={{ marginBottom: '32px' }}
      >
        <button
          onClick={() => setActiveTab('assemblies')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'assemblies'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Assembleias Gerais ({assemblies.length})
        </button>
        <button
          onClick={() => setActiveTab('votings')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'votings'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Votações Online Ativas ({votings.length})
        </button>
      </div>

      {/* VIEW 1: ASSEMBLEIAS */}
      {activeTab === 'assemblies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assemblies.map(asm => (
            <div key={asm.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={asm.type === 'Ordinária' ? 'primary' : 'warning'}>
                      {asm.type}
                    </Badge>
                    <Badge variant={asm.status === 'Realizada' ? 'success' : 'neutral'}>
                      {asm.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-[var(--color-text)] leading-snug">
                    {asm.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)] p-3 bg-[var(--color-bg)] rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[var(--color-primary)]" />
                  <span>{asm.date} às {asm.time}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Users size={14} className="text-[var(--color-primary)]" />
                  <span className="truncate">{asm.location}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[var(--color-text)] uppercase mb-2">
                  Ordem do Dia / Pautas
                </h4>
                <ul className="text-xs space-y-1 text-[var(--color-text-muted)] list-disc list-inside">
                  {asm.agenda.map(a => (
                    <li key={a.id} className="truncate">{a.title}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                {asm.minutes ? (
                  <button
                    onClick={() => {
                      setSelectedAssembly(asm);
                      setIsAssemblyModalOpen(true);
                    }}
                    className="btn btn-sm btn-outline text-xs flex items-center gap-1 text-[var(--color-primary)]"
                  >
                    <FileText size={13} /> Visualizar Ata Deliberativa
                  </button>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)] italic">
                    Ata pendente de homologação
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: VOTAÇÕES ONLINE */}
      {activeTab === 'votings' && (
        <div className="space-y-6">
          {votings.map(v => {
            const userUnit = user?.unitId || 'A101';
            const userCurrentVote = v.userVotes[userUnit];
            const totalVotes = Object.keys(v.userVotes).length;
            const quorumPct = Math.round((totalVotes / 48) * 100);

            return (
              <div key={v.id} className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={v.status === 'Aberta' ? 'success' : 'neutral'}>
                        {v.status}
                      </Badge>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Encerramento: {v.endDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[var(--color-text)]">
                      {v.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[var(--color-text-muted)] block">Quórum Atingido:</span>
                    <span className="text-base font-black text-[var(--color-primary)]">
                      {totalVotes} de 48 Unidades ({quorumPct}%)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {v.description}
                </p>

                {/* Opções de voto */}
                <div className="space-y-2.5">
                  {v.options.map(opt => {
                    const isSelected = userCurrentVote === opt.id;

                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-xs'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={`vote_${v.id}`}
                              checked={isSelected}
                              onChange={() => handleCastVote(v.id, opt.id)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-[var(--color-text)]">
                              {opt.text}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-[var(--color-text)]">
                            {opt.votesCount} votos ({opt.fractionPercent}%)
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                            style={{ width: `${opt.fractionPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userCurrentVote && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1">
                    <CheckCircle2 size={15} />
                    <span>Seu voto foi registrado e computado com peso de fração ideal da unidade {userUnit}.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALHES DA ATA */}
      {selectedAssembly && selectedAssembly.minutes && (
        <Modal
          isOpen={isAssemblyModalOpen}
          onClose={() => setIsAssemblyModalOpen(false)}
          title={`Ata Deliberativa: ${selectedAssembly.title}`}
          size="lg"
          footer={
            <button className="btn btn-primary" onClick={() => setIsAssemblyModalOpen(false)}>
              Fechar Documento
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[var(--color-bg)] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[var(--color-text-muted)] block">Presença Registrada:</span>
                <b className="text-[var(--color-text)]">
                  {selectedAssembly.minutes.attendeesCount} Presentes • {selectedAssembly.minutes.proxiesCount} Procurações
                </b>
              </div>
              <Badge variant="success">Homologada & Registrada</Badge>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)] mb-1">
                Texto Integral da Convocação e Abertura
              </h4>
              <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                {selectedAssembly.minutes.text}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)] mb-2">
                Deliberações por Item de Pauta
              </h4>
              <div className="space-y-2">
                {selectedAssembly.minutes.itemsDeliberation.map((it, i) => (
                  <div key={i} className="p-3 border border-[var(--color-border)] rounded-lg">
                    <div className="font-semibold text-[var(--color-text)] mb-1">
                      Item {it.item}: {it.text}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                      <span className="text-emerald-600 font-bold">Favoráveis: {it.votesFavor}</span>
                      <span className="text-rose-500 font-bold">Contrários: {it.votesAgainst}</span>
                      <span>Abstenções: {it.votesAbstain}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" /> Assinaturas Digitais Válidas
              </h4>
              <div className="divide-y divide-[var(--color-border)]">
                {selectedAssembly.minutes.signatures.map((sig, i) => (
                  <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                    <div>
                      <b className="text-[var(--color-text)]">{sig.name}</b>
                      <span className="text-[var(--color-text-muted)] ml-1">({sig.role})</span>
                    </div>
                    <span className="text-[var(--color-text-muted)]">{sig.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL CONVOCAR ASSEMBLEIA */}
      <Modal
        isOpen={isNewAssemblyModalOpen}
        onClose={() => setIsNewAssemblyModalOpen(false)}
        title="Publicar Edital de Convocação de Assembleia"
        size="md"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsNewAssemblyModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateAssembly}>
              Publicar e Disparar Notificação
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAssembly} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Título da Assembleia</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Assembleia Geral Extraordinária - Reforma da Fachada"
              value={asmTitle}
              onChange={e => setAsmTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                value={asmType}
                onChange={e => setAsmType(e.target.value as any)}
              >
                <option value="Ordinária">Ordinária (AGO)</option>
                <option value="Extraordinária">Extraordinária (AGE)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data e Horário</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  className="form-control"
                  value={asmDate}
                  onChange={e => setAsmDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="form-control"
                  value={asmTime}
                  onChange={e => setAsmTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Local / Meio de Transmissão</label>
            <input
              type="text"
              className="form-control"
              value={asmLocation}
              onChange={e => setAsmLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quórum Regimental</label>
            <input
              type="text"
              className="form-control"
              value={asmQuorum}
              onChange={e => setAsmQuorum(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pautas da Ordem do Dia (1 por linha)</label>
            <textarea
              className="form-control"
              rows={4}
              value={asmPautas}
              onChange={e => setAsmPautas(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assemblies;
