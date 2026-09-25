import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { security } from '../lib/security';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CalendarDays,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { ReservationStatus } from '../types';

export const Reservations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'areas'>('calendar');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form states
  const [selectedAreaId, setSelectedAreaId] = useState('a1');
  const [resDate, setResDate] = useState('2026-10-03');
  const [resSlot, setResSlot] = useState('Noite (18:00 às 23:30)');
  const [resGuests, setResGuests] = useState('25');
  const [resNotes, setResNotes] = useState('');
  const [resUnit, setResUnit] = useState('A101');

  const { user } = useAuth();
  const { success, warning } = useToast();

  const commonAreas = useAppStore(state => state.commonAreas);
  const reservations = useAppStore(state => state.reservations);
  const addReservation = useAppStore(state => state.addReservation);
  const updateReservationStatus = useAppStore(state => state.updateReservationStatus);
  const residents = useAppStore(state => state.residents);

  const selectedArea = commonAreas.find(a => a.id === selectedAreaId) || commonAreas[0];

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();

    // Checar conflito de data para a mesma área
    const conflict = reservations.find(
      r => r.areaId === selectedAreaId && r.date === resDate && r.status !== 'Cancelada'
    );

    if (conflict) {
      warning(`O espaço ${selectedArea.name} já possui uma reserva confirmada para o dia ${resDate}.`);
      return;
    }

    const unitToUse = user?.role === 'MORADOR' ? (user.unitId || 'A101') : resUnit;
    const residentName = user?.role === 'MORADOR' ? user.name : (residents.find(r => r.unit === unitToUse)?.name || 'Morador');

    addReservation({
      areaId: selectedArea.id,
      areaName: selectedArea.name,
      resident: residentName,
      unit: unitToUse,
      date: resDate,
      timeSlot: resSlot,
      guestsCount: parseInt(resGuests, 10) || 1,
      fee: selectedArea.fee || 0,
      status: selectedArea.autoApprove ? 'Confirmada' : 'Aguardando aprovação',
      notes: resNotes
    });

    success(`Reserva agendada com sucesso para ${resDate}!`);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight mb-2">
            Reservas de Espaços Comuns
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]" style={{ marginTop: '10px', marginBottom: '16px' }}>
            Agendamento de salão de festas, churrasqueiras, quadra e regras de uso
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn btn-sm btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Fazer Reserva
        </button>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold"
        style={{ marginBottom: '32px' }}
      >
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <CalendarDays size={16} /> Agenda de Reservas ({reservations.length})
        </button>
        <button
          onClick={() => setActiveTab('areas')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'areas'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Sparkles size={16} /> Espaços Disponíveis ({commonAreas.length})
        </button>
      </div>

      {/* VIEW 1: AGENDA */}
      {activeTab === 'calendar' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Espaço Comum</th>
                  <th>Unidade / Solicitante</th>
                  <th>Período</th>
                  <th>Convidados</th>
                  <th>Taxa</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma reserva registrada até o momento.
                    </td>
                  </tr>
                ) : (
                  reservations.map(res => (
                    <tr key={res.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{res.date}</td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--color-primary)]">
                          {res.areaName}
                        </div>
                      </td>
                      <td className="text-xs">
                        <span className="font-bold block">{res.unit || 'A101'}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{res.resident}</span>
                      </td>
                      <td className="text-xs text-[var(--color-text-muted)]">{res.timeSlot || 'Dia inteiro'}</td>
                      <td className="text-xs font-semibold">{res.guestsCount || res.guests || 10} pessoas</td>
                      <td className="text-xs font-bold">
                        {res.fee > 0 ? security.maskMoney(res.fee) : 'Gratuito'}
                      </td>
                      <td>
                        <Badge
                          variant={
                            res.status === 'Confirmada'
                              ? 'success'
                              : res.status === 'Cancelada'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {res.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {res.status === 'Aguardando aprovação' && user?.role !== 'MORADOR' && (
                            <button
                              onClick={() => {
                                updateReservationStatus(res.id, 'Confirmada');
                                success('Reserva aprovada com sucesso!');
                              }}
                              className="btn btn-sm btn-outline text-xs py-1 text-emerald-600"
                              title="Aprovar Reserva"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          {res.status !== 'Cancelada' && (
                            <button
                              onClick={() => {
                                updateReservationStatus(res.id, 'Cancelada');
                                success('Reserva cancelada.');
                              }}
                              className="btn btn-sm btn-outline text-xs py-1 text-rose-600"
                              title="Cancelar Reserva"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: ESPAÇOS */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commonAreas.map(area => (
            <div key={area.id} className="card p-5 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-[var(--color-text)]">{area.name}</span>
                  <Badge variant={area.fee > 0 ? 'primary' : 'neutral'}>
                    {area.fee > 0 ? security.maskMoney(area.fee) : 'Sem Taxa'}
                  </Badge>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {area.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-[var(--color-bg)] rounded-lg text-xs text-[var(--color-text-muted)]">
                  <div>
                    Capacidade: <b className="text-[var(--color-text)]">{area.capacity} pessoas</b>
                  </div>
                  <div>
                    Aprovação: <b className="text-[var(--color-text)]">{area.autoApprove ? 'Automática' : 'Síndico'}</b>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-[var(--color-text-muted)]">
                  <span className="font-semibold text-[var(--color-text)] block mb-1 flex items-center gap-1">
                    <Info size={12} /> Regras de Utilização:
                  </span>
                  {area.rules}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedAreaId(area.id);
                  setIsNewModalOpen(true);
                }}
                className="w-full btn btn-sm btn-primary text-xs mt-2"
              >
                Agendar Este Espaço
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVA RESERVA */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Agendar Espaço Comum"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateReservation}>
              Confirmar Reserva
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateReservation} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Selecione o Espaço Comum</label>
            <select
              className="form-control"
              value={selectedAreaId}
              onChange={e => setSelectedAreaId(e.target.value)}
            >
              {commonAreas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} • {a.capacity} pessoas • {a.fee > 0 ? security.maskMoney(a.fee) : 'Gratuito'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Data Pretendida</label>
              <input
                type="date"
                className="form-control"
                value={resDate}
                onChange={e => setResDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Período / Turno</label>
              <select
                className="form-control"
                value={resSlot}
                onChange={e => setResSlot(e.target.value)}
              >
                <option value="Manhã (09:00 às 13:00)">Manhã (09:00 às 13:00)</option>
                <option value="Tarde (13:30 às 17:30)">Tarde (13:30 às 17:30)</option>
                <option value="Noite (18:00 às 23:30)">Noite (18:00 às 23:30)</option>
                <option value="Dia Completo">Dia Completo (09:00 às 22:00)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Unidade Solicitante</label>
              <input
                type="text"
                className="form-control"
                value={user?.role === 'MORADOR' ? (user.unitId || 'A101') : resUnit}
                onChange={e => setResUnit(e.target.value)}
                disabled={user?.role === 'MORADOR'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qtd Estimada de Convidados</label>
              <input
                type="number"
                max={selectedArea?.capacity || 100}
                min="1"
                className="form-control"
                value={resGuests}
                onChange={e => setResGuests(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações Adicionais (opcional)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Ex: Aluguel de brinquedo inflável / DJ..."
              value={resNotes}
              onChange={e => setResNotes(e.target.value)}
            />
          </div>

          {selectedArea && selectedArea.fee > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              <b>Taxa de Locação:</b> {security.maskMoney(selectedArea.fee)}. O valor será automaticamente lançado na taxa condominial da sua unidade.
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Reservations;
