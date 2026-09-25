import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  ShieldCheck,
  UserCheck,
  Package,
  Car,
  Plus,
  LogOut,
  CheckCircle2,
  Search,
  MessageCircle
} from 'lucide-react';
import { Visitor, PackageItem } from '../types';

export const Access: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visitors' | 'packages' | 'vehicles'>('visitors');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [pickedByName, setPickedByName] = useState('');

  // Form states - Visitante
  const [visName, setVisName] = useState('');
  const [visDoc, setVisDoc] = useState('');
  const [visUnit, setVisUnit] = useState('A101');
  const [visReason, setVisReason] = useState('Visita Social');
  const [visPlate, setVisPlate] = useState('');

  // Form states - Encomenda
  const [pkgUnit, setPkgUnit] = useState('A101');
  const [pkgResident, setPkgResident] = useState('');
  const [pkgType, setPkgType] = useState('Pacote / Caixa');
  const [pkgVolumes, setPkgVolumes] = useState('1');

  const { success, warning, info } = useToast();

  const visitors = useAppStore(state => state.visitors);
  const addVisitor = useAppStore(state => state.addVisitor);
  const checkoutVisitor = useAppStore(state => state.checkoutVisitor);

  const packages = useAppStore(state => state.packages);
  const addPackage = useAppStore(state => state.addPackage);
  const pickupPackage = useAppStore(state => state.pickupPackage);

  const residents = useAppStore(state => state.residents);

  // Filtros
  const filteredVisitors = visitors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.destinationUnit || v.unit || '').toLowerCase().includes(q) ||
      (v.vehiclePlate || v.plate || '').toLowerCase().includes(q)
    );
  });

  const filteredPackages = packages.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.unit.toLowerCase().includes(q) || p.resident.toLowerCase().includes(q);
  });

  // Veículos de todos os moradores
  const allVehicles: { plate: string; model: string; color: string; spot: string; unit: string; residentName: string }[] = [];
  residents.forEach(res => {
    (res.vehicles || []).forEach(veh => {
      allVehicles.push({
        ...veh,
        unit: res.unit,
        residentName: res.name
      });
    });
  });

  const filteredVehicles = allVehicles.filter(veh => {
    const q = searchQuery.toLowerCase();
    return (
      veh.plate.toLowerCase().includes(q) ||
      veh.unit.toLowerCase().includes(q) ||
      veh.residentName.toLowerCase().includes(q)
    );
  });

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName) {
      warning('Informe o nome do visitante.');
      return;
    }

    addVisitor({
      name: visName,
      document: visDoc,
      destinationUnit: visUnit,
      unit: visUnit,
      reason: visReason,
      hasVehicle: !!visPlate,
      vehiclePlate: visPlate || undefined
    });

    success(`Entrada registrada para ${visName} na unidade ${visUnit}!`);
    setIsVisitorModalOpen(false);
    setVisName('');
    setVisDoc('');
    setVisPlate('');
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const vols = parseInt(pkgVolumes, 10) || 1;
    const resObj = residents.find(r => r.unit === pkgUnit);
    const resName = pkgResident || (resObj ? resObj.name : `Morador ${pkgUnit}`);

    addPackage({
      resident: resName,
      unit: pkgUnit,
      type: pkgType,
      volumes: vols
    });

    success(`Encomenda registrada para a Unidade ${pkgUnit}!`);
    setIsPackageModalOpen(false);

    // Opção de avisar WhatsApp
    const msg = encodeURIComponent(
      `Olá ${resName}! Uma nova encomenda (${pkgType} - ${vols} vol.) acaba de chegar na portaria para a unidade ${pkgUnit}. Favor retirar assim que possível.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handlePickupConfirm = () => {
    if (!selectedPackage || !pickedByName) {
      warning('Informe quem está retirando o pacote.');
      return;
    }

    pickupPackage(selectedPackage.id, pickedByName);
    success(`Encomenda entregue a ${pickedByName}!`);
    setIsPickupModalOpen(false);
    setSelectedPackage(null);
    setPickedByName('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Portaria & Controle de Acesso
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Registro em tempo real de visitantes, encomendas recebidas e consulta de veículos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'visitors' && (
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="btn btn-sm btn-primary flex items-center gap-1.5"
            >
              <Plus size={14} /> Registrar Visitante
            </button>
          )}
          {activeTab === 'packages' && (
            <button
              onClick={() => setIsPackageModalOpen(true)}
              className="btn btn-sm btn-primary flex items-center gap-1.5"
            >
              <Plus size={14} /> Receber Encomenda
            </button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'visitors'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <UserCheck size={16} /> Visitantes & Prestadores
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'packages'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Package size={16} /> Encomendas ({packages.filter(p => p.status === 'Aguardando Retirada').length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Car size={16} /> Verificação de Veículos
        </button>
      </div>

      {/* BUSCA */}
      <div className="card p-3">
        <div className="relative">
          <input
            type="text"
            className="form-control pl-9 text-xs"
            placeholder={
              activeTab === 'vehicles'
                ? 'Buscar por placa, modelo ou unidade...'
                : 'Buscar por nome, unidade ou documento...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* TAB 1: VISITANTES */}
      {activeTab === 'visitors' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome do Visitante</th>
                  <th>Documento (RG/CPF)</th>
                  <th>Destino</th>
                  <th>Motivo</th>
                  <th>Veículo</th>
                  <th>Entrada</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhum visitante registrado.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map(v => (
                    <tr key={v.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{v.name}</td>
                      <td className="text-xs text-[var(--color-text-muted)]">{v.document || v.doc || 'Não informado'}</td>
                      <td className="font-bold text-xs text-[var(--color-primary)]">{v.destinationUnit || v.unit}</td>
                      <td className="text-xs">{v.reason}</td>
                      <td className="text-xs">
                        {v.vehiclePlate || v.plate ? (
                          <span className="font-semibold uppercase">{v.vehiclePlate || v.plate}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">A pé</span>
                        )}
                      </td>
                      <td className="text-xs">{v.enteredAt || v.entryTime}</td>
                      <td>
                        <Badge variant={v.status === 'Dentro' ? 'warning' : 'success'}>
                          {v.status || 'Dentro'}
                        </Badge>
                      </td>
                      <td>
                        {(v.status === 'Dentro' || !v.status) && (
                          <button
                            onClick={() => {
                              checkoutVisitor(v.id);
                              success(`Saída registrada para ${v.name}`);
                            }}
                            className="btn btn-sm btn-outline text-xs py-1 text-rose-600 flex items-center gap-1"
                          >
                            <LogOut size={13} /> Saída
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ENCOMENDAS */}
      {activeTab === 'packages' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Destinatário</th>
                  <th>Tipo / Volumes</th>
                  <th>Data de Chegada</th>
                  <th>Status</th>
                  <th>Retirada Por</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma encomenda cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map(pkg => (
                    <tr key={pkg.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{pkg.unit}</td>
                      <td className="text-xs">{pkg.resident}</td>
                      <td className="text-xs">
                        <span className="font-semibold text-[var(--color-text)] block">{pkg.type}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{pkg.volumes} volume(s)</span>
                      </td>
                      <td className="text-xs">{pkg.receivedAt}</td>
                      <td>
                        <Badge variant={pkg.status === 'Retirado' ? 'success' : 'warning'}>
                          {pkg.status}
                        </Badge>
                      </td>
                      <td className="text-xs text-[var(--color-text-muted)]">
                        {pkg.pickedBy ? (
                          <div>
                            <span className="font-semibold text-[var(--color-text)] block">{pkg.pickedBy}</span>
                            <span className="text-[11px]">{pkg.pickedAt}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {pkg.status !== 'Retirado' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPackage(pkg);
                                setPickedByName(pkg.resident);
                                setIsPickupModalOpen(true);
                              }}
                              className="btn btn-sm btn-primary text-xs py-1"
                            >
                              Entregar
                            </button>
                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(
                                  `Lembrete de Encomenda: sua encomenda (${pkg.type}) continua disponível na portaria aguardando retirada para a Unidade ${pkg.unit}.`
                                );
                                window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                              }}
                              className="btn btn-sm btn-outline text-xs py-1 text-emerald-600"
                              title="Notificar via WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={13} /> Retirado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VEÍCULOS */}
      {activeTab === 'vehicles' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Placa do Veículo</th>
                  <th>Modelo & Cor</th>
                  <th>Vaga Associada</th>
                  <th>Unidade</th>
                  <th>Proprietário / Morador</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhum veículo encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((veh, i) => (
                    <tr key={i}>
                      <td className="font-bold text-sm uppercase text-[var(--color-primary)]">
                        {veh.plate}
                      </td>
                      <td className="text-xs">
                        <span className="font-semibold text-[var(--color-text)] block">{veh.model}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{veh.color}</span>
                      </td>
                      <td className="font-bold text-xs">{veh.spot}</td>
                      <td className="font-bold text-xs">{veh.unit}</td>
                      <td className="text-xs">{veh.residentName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR VISITANTE */}
      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Registrar Entrada de Visitante ou Prestador"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsVisitorModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateVisitor}>
              Liberar Entrada
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateVisitor} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: João da Silva"
                value={visName}
                onChange={e => setVisName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Documento (RG ou CPF)</label>
              <input
                type="text"
                className="form-control"
                placeholder="00.000.000-0"
                value={visDoc}
                onChange={e => setVisDoc(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Unidade de Destino</label>
              <select
                className="form-control"
                value={visUnit}
                onChange={e => setVisUnit(e.target.value)}
              >
                {residents.map(res => (
                  <option key={res.id} value={res.unit}>
                    {res.unit} - {res.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo do Acesso</label>
              <select
                className="form-control"
                value={visReason}
                onChange={e => setVisReason(e.target.value)}
              >
                <option value="Visita Social">Visita Social</option>
                <option value="Entrega / Delivery">Entrega / Delivery</option>
                <option value="Prestador de Serviço">Prestador de Serviço / Manutenção</option>
                <option value="Corretor / Vistoria">Corretor / Vistoria</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Placa do Veículo (se houver)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: ABC-1234"
              value={visPlate}
              onChange={e => setVisPlate(e.target.value.toUpperCase())}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL RECEBER ENCOMENDA */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title="Dar Entrada em Encomenda / Pacote"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPackageModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreatePackage}>
              Guardar e Notificar Morador
            </button>
          </>
        }
      >
        <form onSubmit={handleCreatePackage} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Unidade Destino</label>
              <select
                className="form-control"
                value={pkgUnit}
                onChange={e => {
                  setPkgUnit(e.target.value);
                  const r = residents.find(res => res.unit === e.target.value);
                  if (r) setPkgResident(r.name);
                }}
              >
                {residents.map(res => (
                  <option key={res.id} value={res.unit}>
                    {res.unit} - {res.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Morador / Destinatário</label>
              <input
                type="text"
                className="form-control"
                value={pkgResident}
                onChange={e => setPkgResident(e.target.value)}
                placeholder="Nome na etiqueta"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Tipo de Volume</label>
              <select
                className="form-control"
                value={pkgType}
                onChange={e => setPkgType(e.target.value)}
              >
                <option value="Pacote / Caixa">Pacote / Caixa</option>
                <option value="Envelope / Documento">Envelope / Documento</option>
                <option value="Carga Pesada / Móvel">Carga Pesada / Móvel</option>
                <option value="Alimento / Perecível">Alimento / Perecível</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantidade de Volumes</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={pkgVolumes}
                onChange={e => setPkgVolumes(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL BAIXA / RETIRADA */}
      {selectedPackage && (
        <Modal
          isOpen={isPickupModalOpen}
          onClose={() => setIsPickupModalOpen(false)}
          title="Confirmar Retirada de Encomenda"
          size="sm"
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setIsPickupModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handlePickupConfirm}>
                Confirmar Entrega
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-[var(--color-bg)] rounded-lg text-xs">
              <div>Unidade: <b className="text-[var(--color-text)]">{selectedPackage.unit}</b></div>
              <div>Volumes: <b className="text-[var(--color-text)]">{selectedPackage.volumes} ({selectedPackage.type})</b></div>
              <div>Recebido em: <b className="text-[var(--color-text)]">{selectedPackage.receivedAt}</b></div>
            </div>

            <div className="form-group">
              <label className="form-label">Nome de Quem Está Retirando</label>
              <input
                type="text"
                className="form-control"
                value={pickedByName}
                onChange={e => setPickedByName(e.target.value)}
                placeholder="Ex: Titular ou portador autorizado"
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Access;
