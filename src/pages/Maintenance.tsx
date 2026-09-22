import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { security } from '../lib/security';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Plus,
  Wrench,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import { WorkOrderStatus, Priority } from '../types';

export const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'preventive' | 'suppliers'>('kanban');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states - Nova OS
  const [orderArea, setOrderArea] = useState('Elevadores');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDesc, setOrderDesc] = useState('');
  const [orderPriority, setOrderPriority] = useState<Priority>('Média');
  const [orderSupplier, setOrderSupplier] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderDate, setOrderDate] = useState('');

  const { success, warning } = useToast();

  const orders = useAppStore(state => state.maintenanceOrders);
  const addWorkOrder = useAppStore(state => state.addWorkOrder);
  const updateWorkOrderStatus = useAppStore(state => state.updateWorkOrderStatus);
  const prevMaintenance = useAppStore(state => state.preventiveMaintenance);
  const suppliers = useAppStore(state => state.suppliers);

  const columns: { key: WorkOrderStatus; title: string; color: string }[] = [
    { key: 'Aberta', title: 'Aberta', color: 'border-t-blue-500' },
    { key: 'Em Análise', title: 'Em Análise', color: 'border-t-amber-500' },
    { key: 'Aprovada', title: 'Aprovada', color: 'border-t-indigo-500' },
    { key: 'Em Execução', title: 'Em Execução', color: 'border-t-purple-500' },
    { key: 'Concluída', title: 'Concluída', color: 'border-t-emerald-500' }
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitle) {
      warning('Informe o título da ordem de serviço.');
      return;
    }

    addWorkOrder({
      area: orderArea,
      title: orderTitle,
      description: orderDesc,
      priority: orderPriority,
      status: 'Aberta',
      supplier: orderSupplier || 'A Definir',
      estimatedAmount: orderAmount ? parseFloat(orderAmount) : undefined,
      estimatedDate: orderDate || new Date().toISOString().substring(0, 10)
    });

    success('Ordem de serviço criada com sucesso!');
    setIsNewOrderModalOpen(false);
    setOrderTitle('');
    setOrderDesc('');
    setOrderAmount('');
  };

  const handleStatusChange = (orderId: string, newStatus: WorkOrderStatus) => {
    updateWorkOrderStatus(orderId, newStatus, `Mudança de fase para ${newStatus}`);
    success(`Ordem de serviço atualizada para ${newStatus}!`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Manutenção & Conservação Predial
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Ordens de serviço, cronograma de manutenções preventivas e fornecedores
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="btn btn-sm btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Abrir Ordem de Serviço
        </button>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'kanban'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Quadro Kanban (Fluxo de OS)
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'table'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Lista Completa ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('preventive')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'preventive'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Manutenção Preventiva ({prevMaintenance.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          Fornecedores Homologados ({suppliers.length})
        </button>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map(col => {
            const colOrders = orders.filter(
              o => (o.status || 'Aberta') === col.key
            );

            return (
              <div
                key={col.key}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl border-t-4 ${col.color} p-3 flex flex-col`}
                style={{ minHeight: '480px' }}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border)]">
                  <span className="text-xs font-bold text-[var(--color-text)]">
                    {col.title}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                    {colOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderDetailsModalOpen(true);
                      }}
                      className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] hover:shadow-md cursor-pointer transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[var(--color-primary)] text-[11px]">
                          {order.id}
                        </span>
                        <Badge
                          variant={
                            order.priority === 'Urgente' || order.priority === 'Alta'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {order.priority}
                        </Badge>
                      </div>

                      <div className="font-semibold text-sm text-[var(--color-text)] line-clamp-2 mb-1">
                        {order.title}
                      </div>

                      <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
                        <span className="truncate">{order.area}</span>
                        {order.estimatedAmount && (
                          <span className="font-bold text-[var(--color-text)]">
                            {security.maskMoney(order.estimatedAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
                      Nenhuma OS nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LISTA DE ORDENS */}
      {activeTab === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº / ID</th>
                  <th>Área / Setor</th>
                  <th>Título & Descrição</th>
                  <th>Fornecedor</th>
                  <th>Prioridade</th>
                  <th>Previsão / Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => {
                      setSelectedOrder(o);
                      setIsOrderDetailsModalOpen(true);
                    }}
                    className="cursor-pointer hover:bg-[var(--color-bg)]"
                  >
                    <td className="font-bold text-xs text-[var(--color-primary)]">{o.id}</td>
                    <td className="text-xs font-semibold">{o.area}</td>
                    <td className="text-xs">
                      <div className="font-semibold text-sm text-[var(--color-text)]">{o.title}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                        {o.description}
                      </div>
                    </td>
                    <td className="text-xs">{o.supplier || 'Interno'}</td>
                    <td>
                      <Badge
                        variant={
                          o.priority === 'Urgente' || o.priority === 'Alta'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {o.priority}
                      </Badge>
                    </td>
                    <td className="text-xs">
                      {o.estimatedAmount ? security.maskMoney(o.estimatedAmount) : 'Sob Consulta'}
                    </td>
                    <td>
                      <Badge
                        variant={
                          o.status === 'Concluída'
                            ? 'success'
                            : o.status === 'Cancelada'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {o.status || 'Aberta'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: MANUTENÇÃO PREVENTIVA */}
      {activeTab === 'preventive' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prevMaintenance.map(pm => (
            <div key={pm.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--color-text)]">{pm.equipment}</span>
                <Badge variant={pm.status === 'Vencido' ? 'danger' : pm.status === 'Proximo' ? 'warning' : 'success'}>
                  {pm.status}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                <div>Periodicidade: <b className="text-[var(--color-text)]">{pm.frequency}</b></div>
                <div>Última Revisão: <b className="text-[var(--color-text)]">{pm.lastDate}</b></div>
                <div>Próxima Revisão: <b className="text-[var(--color-text)]">{pm.nextDate}</b></div>
                <div>Empresa Técnica: <b className="text-[var(--color-text)]">{pm.supplier}</b></div>
              </div>

              <button
                onClick={() => {
                  addWorkOrder({
                    area: pm.equipment,
                    title: `Revisão Periódica: ${pm.equipment}`,
                    description: `Manutenção preventiva obrigatória sob frequência ${pm.frequency}.`,
                    priority: 'Alta',
                    status: 'Aberta',
                    supplier: pm.supplier
                  });
                  success(`O.S. de revisão gerada para ${pm.equipment}!`);
                  setActiveTab('kanban');
                }}
                className="w-full btn btn-sm btn-outline text-xs mt-2"
              >
                Gerar O.S. Preventiva
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: FORNECEDORES */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="card p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--color-text)]">{s.name}</span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star size={13} fill="currentColor" /> {s.rating}
                </div>
              </div>

              <div className="text-xs text-[var(--color-text-muted)]">{s.cnpj}</div>

              <div className="flex flex-wrap gap-1">
                {s.specialty.map((spec, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[var(--color-bg)] rounded text-[10px] text-[var(--color-text-muted)]">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} /> {s.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={12} /> {s.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVA ORDEM DE SERVIÇO */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Abertura de Ordem de Serviço"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsNewOrderModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateOrder}>
              Cadastrar Ordem de Serviço
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Área / Sistema</label>
              <select
                className="form-control"
                value={orderArea}
                onChange={e => setOrderArea(e.target.value)}
              >
                <option value="Elevadores">Elevadores</option>
                <option value="Bombas e Hidráulica">Bombas e Hidráulica</option>
                <option value="Elétrica e Iluminação">Elétrica e Iluminação</option>
                <option value="Portões e Interfonia">Portões e Interfonia</option>
                <option value="Piscina e Lazer">Piscina e Lazer</option>
                <option value="Estrutura e Alvenaria">Estrutura e Alvenaria</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prioridade</label>
              <select
                className="form-control"
                value={orderPriority}
                onChange={e => setOrderPriority(e.target.value as Priority)}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Título da OS</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Troca de cabos de tração do Elevador Social Bloco B"
              value={orderTitle}
              onChange={e => setOrderTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição Detalhada do Problema / Escopo</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Descreva as falhas detectadas, riscos e orientações técnicas..."
              value={orderDesc}
              onChange={e => setOrderDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Fornecedor Técnico</label>
              <select
                className="form-control"
                value={orderSupplier}
                onChange={e => setOrderSupplier(e.target.value)}
              >
                <option value="">Selecione ou deixe aberto...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valor Estimado (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="0,00"
                value={orderAmount}
                onChange={e => setOrderAmount(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALHES DA ORDEM DE SERVIÇO */}
      {selectedOrder && (
        <Modal
          isOpen={isOrderDetailsModalOpen}
          onClose={() => setIsOrderDetailsModalOpen(false)}
          title={`Detalhes da Ordem: ${selectedOrder.id}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--color-text-muted)]">Mover para:</span>
                {columns.map(col => (
                  <button
                    key={col.key}
                    disabled={selectedOrder.status === col.key}
                    onClick={() => handleStatusChange(selectedOrder.id, col.key)}
                    className="btn btn-sm btn-outline text-xs py-1"
                  >
                    {col.title}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setIsOrderDetailsModalOpen(false)}>
                Fechar
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--color-primary)] uppercase">
                {selectedOrder.area}
              </span>
              <h3 className="text-lg font-bold text-[var(--color-text)] mt-0.5">
                {selectedOrder.title}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-[var(--color-bg)] rounded-lg text-xs">
              <div>
                <span className="text-[var(--color-text-muted)] block">Status Atual:</span>
                <b className="text-[var(--color-text)]">{selectedOrder.status || 'Aberta'}</b>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Prioridade:</span>
                <b className="text-[var(--color-text)]">{selectedOrder.priority}</b>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Fornecedor:</span>
                <b className="text-[var(--color-text)]">{selectedOrder.supplier || 'Interno'}</b>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)] uppercase mb-1">
                Descrição do Serviço
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {selectedOrder.description || 'Nenhuma descrição técnica informada.'}
              </p>
            </div>

            {/* Linha do tempo de alterações */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)] uppercase mb-2">
                Histórico de Acompanhamento
              </h4>
              <div className="space-y-2 border-l-2 border-[var(--color-border)] pl-3">
                {(selectedOrder.timeline || selectedOrder.history || []).map((h: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                      <span>{h.date}</span>
                      <span>•</span>
                      <b>{h.user}</b>
                    </div>
                    <div className="text-[var(--color-text)] mt-0.5">{h.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
