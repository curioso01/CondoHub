import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../hooks/useToast';
import { security } from '../lib/security';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import {
  Users,
  Building,
  FileText,
  Car,
  Plus,
  Search,
  Download,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { Resident, DocumentItem } from '../types';

export const Registry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'units' | 'residents' | 'documents'>('units');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Form states - Novo Morador
  const [resName, setResName] = useState('');
  const [resCpf, setResCpf] = useState('');
  const [resUnit, setResUnit] = useState('A101');
  const [resType, setResType] = useState<'proprietario' | 'inquilino'>('proprietario');
  const [resPhone, setResPhone] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehModel, setVehModel] = useState('');

  // Form states - Documento
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Legislação & Regimento');
  const [docExpires, setDocExpires] = useState('');

  const { success, warning } = useToast();

  const units = useAppStore(state => state.units);
  const residents = useAppStore(state => state.residents);
  const addResident = useAppStore(state => state.addResident);
  const documents = useAppStore(state => state.documents);
  const addDocument = useAppStore(state => state.addDocument);

  // Filter Units
  const filteredUnits = units.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.unit.toLowerCase().includes(q) ||
      u.ownerName.toLowerCase().includes(q) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(q));
    const matchesBlock = selectedBlock === 'all' || u.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  // Filter Residents
  const filteredResidents = residents.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q) ||
      r.cpf.includes(q) ||
      r.email.toLowerCase().includes(q);
    const matchesBlock = selectedBlock === 'all' || r.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  // Paged
  const pagedUnits = filteredUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pagedResidents = filteredResidents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resPhone) {
      warning('Preencha os dados obrigatórios do morador.');
      return;
    }

    const block = resUnit.charAt(0);
    const vehiclesList = vehPlate
      ? [{ plate: vehPlate.toUpperCase(), model: vehModel || 'Veículo', color: 'Prata', spot: `Vaga ${resUnit}` }]
      : [];

    addResident({
      name: resName,
      cpf: resCpf ? security.maskCPF(resCpf) : '000.000.000-00',
      unit: resUnit,
      block,
      type: resType,
      phone: security.maskPhone(resPhone),
      email: resEmail || `${resName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      vehicles: vehiclesList,
      status: 'ativo'
    });

    success(`Morador ${resName} cadastrado com sucesso na unidade ${resUnit}!`);
    setIsResidentModalOpen(false);
    setResName('');
    setResCpf('');
    setResPhone('');
    setResEmail('');
    setVehPlate('');
    setVehModel('');
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) {
      warning('Informe o título do documento.');
      return;
    }

    addDocument({
      title: docTitle,
      category: docCategory,
      expiresDate: docExpires || null,
      status: 'Válido',
      isPublic: true,
      filename: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      size: '1.4 MB'
    });

    success('Documento arquivado no acervo digital!');
    setIsDocModalOpen(false);
    setDocTitle('');
    setDocExpires('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Cadastros & Acervo Digital
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Mapeamento de 48 unidades, moradores, veículos e documentação técnica regulatória
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'residents' && (
            <button
              onClick={() => setIsResidentModalOpen(true)}
              className="btn btn-sm btn-primary flex items-center gap-1.5"
            >
              <Plus size={14} /> Cadastrar Morador
            </button>
          )}
          {activeTab === 'documents' && (
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="btn btn-sm btn-primary flex items-center gap-1.5"
            >
              <Plus size={14} /> Novo Documento
            </button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-4 text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('units'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'units'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Building size={16} /> Unidades & Frações ({units.length})
        </button>
        <button
          onClick={() => { setActiveTab('residents'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'residents'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Users size={16} /> Moradores & Contatos ({residents.length})
        </button>
        <button
          onClick={() => { setActiveTab('documents'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <FileText size={16} /> Acervo Documental ({documents.length})
        </button>
      </div>

      {/* BUSCA E FILTRO DE BLOCO */}
      <div className="card p-3.5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            className="form-control pl-9 text-xs"
            placeholder="Buscar por nome, unidade, CPF ou documento..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        {activeTab !== 'documents' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[var(--color-text-muted)] font-semibold whitespace-nowrap">
              Bloco:
            </span>
            <div className="flex items-center gap-1">
              {['all', 'A', 'B', 'C', 'D'].map(b => (
                <button
                  key={b}
                  onClick={() => { setSelectedBlock(b); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    selectedBlock === b
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {b === 'all' ? 'Todos' : b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: UNIDADES */}
      {activeTab === 'units' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Bloco</th>
                  <th>Área Privativa</th>
                  <th>Fração Ideal</th>
                  <th>Vagas de Garagem</th>
                  <th>Proprietário Titular</th>
                  <th>Ocupação / Inquilino</th>
                </tr>
              </thead>
              <tbody>
                {pagedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma unidade encontrada.
                    </td>
                  </tr>
                ) : (
                  pagedUnits.map(u => (
                    <tr key={u.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{u.unit}</td>
                      <td className="text-xs font-semibold">Bloco {u.block}</td>
                      <td className="text-xs">{u.area} m²</td>
                      <td className="text-xs font-semibold text-[var(--color-primary)]">
                        {u.fraction}%
                      </td>
                      <td className="text-xs">
                        {u.spots && u.spots.length > 0 ? (
                          <span className="font-medium text-[var(--color-text)]">
                            {u.spots.join(', ')}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">-</span>
                        )}
                      </td>
                      <td className="text-xs">
                        <div className="font-semibold text-[var(--color-text)]">{u.ownerName}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{u.ownerPhone}</div>
                      </td>
                      <td className="text-xs">
                        {u.tenantName ? (
                          <div>
                            <span className="font-semibold text-blue-600 block">{u.tenantName}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">Inquilino</span>
                          </div>
                        ) : (
                          <span className="badge badge-neutral">Proprietário Residente</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUnits.length / pageSize)}
            onPageChange={setCurrentPage}
            totalItems={filteredUnits.length}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* TAB 2: MORADORES */}
      {activeTab === 'residents' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome do Morador</th>
                  <th>Unidade / Bloco</th>
                  <th>Vínculo</th>
                  <th>CPF</th>
                  <th>Contato (Tel / E-mail)</th>
                  <th>Veículos Cadastrados</th>
                  <th>Status Financeiro</th>
                </tr>
              </thead>
              <tbody>
                {pagedResidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhum morador cadastrado.
                    </td>
                  </tr>
                ) : (
                  pagedResidents.map(r => (
                    <tr key={r.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{r.name}</td>
                      <td className="text-xs font-bold text-[var(--color-primary)]">
                        {r.unit} (Bloco {r.block})
                      </td>
                      <td>
                        <Badge variant={r.type === 'proprietario' ? 'primary' : 'neutral'}>
                          {r.type === 'proprietario' ? 'Proprietário' : 'Inquilino'}
                        </Badge>
                      </td>
                      <td className="text-xs text-[var(--color-text-muted)]">{r.cpf}</td>
                      <td className="text-xs">
                        <div className="flex items-center gap-1 text-[var(--color-text)]">
                          <Phone size={11} /> {r.phone}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          <Mail size={11} /> {r.email}
                        </div>
                      </td>
                      <td className="text-xs">
                        {r.vehicles && r.vehicles.length > 0 ? (
                          <div className="space-y-0.5">
                            {r.vehicles.map((v, idx) => (
                              <span key={idx} className="block font-semibold uppercase text-[11px]">
                                {v.plate} ({v.model})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-muted)] text-[11px]">Nenhum veículo</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={r.status === 'inadimplente' ? 'danger' : 'success'}>
                          {r.status === 'inadimplente' ? 'Inadimplente' : 'Em Dia'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredResidents.length / pageSize)}
            onPageChange={setCurrentPage}
            totalItems={filteredResidents.length}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* TAB 3: DOCUMENTOS */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div key={doc.id} className="card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--color-primary)] uppercase">
                    {doc.category}
                  </span>
                  <Badge variant="success">{doc.status}</Badge>
                </div>

                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  {doc.title}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)] p-2.5 bg-[var(--color-bg)] rounded-lg">
                  <div>Arquivo: <b className="text-[var(--color-text)]">{doc.filename}</b></div>
                  <div>Tamanho: <b>{doc.size}</b></div>
                  <div>Publicado em: <b>{doc.uploadDate}</b></div>
                  {doc.expiresDate && (
                    <div className="text-amber-600 font-semibold">
                      Vencimento: {doc.expiresDate}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  success(`Download do arquivo "${doc.filename}" iniciado.`);
                }}
                className="btn btn-sm btn-outline text-xs w-full flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Baixar Cópia em PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO MORADOR */}
      <Modal
        isOpen={isResidentModalOpen}
        onClose={() => setIsResidentModalOpen(false)}
        title="Cadastrar Novo Morador / Condômino"
        size="md"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsResidentModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateResident}>
              Salvar Cadastro
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateResident} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Carlos Mendonça"
                value={resName}
                onChange={e => setResName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                type="text"
                className="form-control"
                placeholder="000.000.000-00"
                value={resCpf}
                onChange={e => setResCpf(security.maskCPF(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Unidade</label>
              <select
                className="form-control"
                value={resUnit}
                onChange={e => setResUnit(e.target.value)}
              >
                {units.map(u => (
                  <option key={u.id} value={u.unit}>{u.unit} (Bloco {u.block})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vínculo</label>
              <select
                className="form-control"
                value={resType}
                onChange={e => setResType(e.target.value as any)}
              >
                <option value="proprietario">Proprietário</option>
                <option value="inquilino">Inquilino / Locatário</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-control"
                placeholder="(11) 90000-0000"
                value={resPhone}
                onChange={e => setResPhone(security.maskPhone(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                placeholder="nome@email.com"
                value={resEmail}
                onChange={e => setResEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]">
            <div className="form-group">
              <label className="form-label">Placa do Veículo (opcional)</label>
              <input
                type="text"
                className="form-control uppercase"
                placeholder="ABC-1234"
                value={vehPlate}
                onChange={e => setVehPlate(security.maskPlate(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modelo & Cor do Veículo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Honda Civic Preto"
                value={vehModel}
                onChange={e => setVehModel(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL NOVO DOCUMENTO */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Arquivar Novo Documento Oficial"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsDocModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCreateDocument}>
              Publicar no Acervo
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Título do Documento</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Alvará do Corpo de Bombeiros (AVCB) 2026"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-control"
                value={docCategory}
                onChange={e => setDocCategory(e.target.value)}
              >
                <option value="Legislação & Regimento">Legislação & Regimento</option>
                <option value="Laudos & Engenharia">Laudos & Engenharia</option>
                <option value="Seguros & Alvarás">Seguros & Alvarás</option>
                <option value="Contratos & Fornecedores">Contratos & Fornecedores</option>
                <option value="Prestação de Contas">Prestação de Contas</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Vencimento / Renovação</label>
              <input
                type="date"
                className="form-control"
                value={docExpires}
                onChange={e => setDocExpires(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Registry;
