// CONDOHUB — STORE PRINCIPAL DA APLICAÇÃO (ZUSTAND — SEM PERSIST DIRETO)
// Usa storage.ts internamente para salvar/ler do localStorage.

import { create } from 'zustand';
import storage from '../lib/storage';
import { log as auditLog } from '../lib/audit';
import { generateId } from '../lib/security';
import { useAuthStore } from './useAuthStore';
import type {
  Condo,
  Resident,
  Unit,
  Receivable,
  Payable,
  FinancialMonth,
  Fine,
  WorkOrder,
  PreventiveMaintenance,
  Supplier,
  Assembly,
  Voting,
  Announcement,
  Visitor,
  Package,
  CommonArea,
  Reservation,
  Occurrence,
  AuditLog,
  Document,
  Integration,
  NotificationSetting,
} from '../types';

// ─── TIPO DO ESTADO ───────────────────────────────────────────────────────────
interface AppState {
  // Dados principais
  condo: Condo | null;
  residents: Resident[];
  units: Unit[];
  receivables: Receivable[];
  payables: Payable[];
  financialMonths: FinancialMonth[];
  fines: Fine[];
  workOrders: WorkOrder[];
  preventiveMaintenance: PreventiveMaintenance[];
  suppliers: Supplier[];
  assemblies: Assembly[];
  votings: Voting[];
  announcements: Announcement[];
  visitors: Visitor[];
  packages: Package[];
  commonAreas: CommonArea[];
  reservations: Reservation[];
  occurrences: Occurrence[];
  auditLogs: AuditLog[];
  documents: Document[];
  integrations: Integration[];
  notificationSettings: NotificationSetting[];

  // ── Inicialização ────────────────────────────────────────────────────────────
  seed: () => void;

  // ── Auditoria ────────────────────────────────────────────────────────────────
  logAudit: (action: string, module: string, details?: unknown) => void;

  // ── Condomínio ───────────────────────────────────────────────────────────────
  updateCondo: (data: Partial<Condo>) => void;

  // ── Moradores ────────────────────────────────────────────────────────────────
  addResident: (resident: Omit<Resident, 'id'>) => Resident;
  updateResident: (id: string, data: Partial<Resident>) => void;
  removeResident: (id: string) => void;

  // ── Unidades ─────────────────────────────────────────────────────────────────
  updateUnit: (id: string, data: Partial<Unit>) => void;

  // ── Recebíveis ───────────────────────────────────────────────────────────────
  addReceivable: (rec: Omit<Receivable, 'id'>) => Receivable;
  updateReceivable: (id: string, data: Partial<Receivable>) => void;
  removeReceivable: (id: string) => void;

  // ── Pagamentos ───────────────────────────────────────────────────────────────
  addPayable: (pay: Omit<Payable, 'id'>) => Payable;
  updatePayable: (id: string, data: Partial<Payable>) => void;
  removePayable: (id: string) => void;

  // ── Meses Financeiros ─────────────────────────────────────────────────────────
  updateFinancialMonth: (month: string, data: Partial<FinancialMonth>) => void;

  // ── Multas ────────────────────────────────────────────────────────────────────
  addFine: (fine: Omit<Fine, 'id'>) => Fine;
  updateFine: (id: string, data: Partial<Fine>) => void;
  removeFine: (id: string) => void;

  // ── Ordens de Serviço ────────────────────────────────────────────────────────
  addWorkOrder: (order: Omit<WorkOrder, 'id'>) => WorkOrder;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  removeWorkOrder: (id: string) => void;

  // ── Manutenção Preventiva ─────────────────────────────────────────────────────
  addPreventiveMaintenance: (pm: Omit<PreventiveMaintenance, 'id'>) => PreventiveMaintenance;
  updatePreventiveMaintenance: (id: string, data: Partial<PreventiveMaintenance>) => void;
  removePreventiveMaintenance: (id: string) => void;

  // ── Fornecedores ─────────────────────────────────────────────────────────────
  addSupplier: (sup: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;

  // ── Assembleias ──────────────────────────────────────────────────────────────
  addAssembly: (assembly: Omit<Assembly, 'id'>) => Assembly;
  updateAssembly: (id: string, data: Partial<Assembly>) => void;
  removeAssembly: (id: string) => void;

  // ── Votações ─────────────────────────────────────────────────────────────────
  addVoting: (voting: Omit<Voting, 'id'>) => Voting;
  updateVoting: (id: string, data: Partial<Voting>) => void;
  castVote: (votingId: string, unit: string, optionId: string) => void;

  // ── Comunicados ───────────────────────────────────────────────────────────────
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => Announcement;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  removeAnnouncement: (id: string) => void;
  incrementViews: (id: string) => void;

  // ── Visitantes ────────────────────────────────────────────────────────────────
  addVisitor: (visitor: Omit<Visitor, 'id'>) => Visitor;
  updateVisitor: (id: string, data: Partial<Visitor>) => void;
  registerExit: (id: string) => void;

  // ── Encomendas ────────────────────────────────────────────────────────────────
  addPackage: (pkg: Omit<Package, 'id'>) => Package;
  updatePackage: (id: string, data: Partial<Package>) => void;
  markPackagePickedUp: (id: string, pickedBy: string) => void;

  // ── Reservas ──────────────────────────────────────────────────────────────────
  addReservation: (res: Omit<Reservation, 'id'>) => Reservation;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;

  // ── Ocorrências ───────────────────────────────────────────────────────────────
  addOccurrence: (occ: Omit<Occurrence, 'id'>) => Occurrence;
  updateOccurrence: (id: string, data: Partial<Occurrence>) => void;
  removeOccurrence: (id: string) => void;

  // ── Documentos ────────────────────────────────────────────────────────────────
  addDocument: (doc: Omit<Document, 'id'>) => Document;
  updateDocument: (id: string, data: Partial<Document>) => void;
  removeDocument: (id: string) => void;

  // ── Integrações ───────────────────────────────────────────────────────────────
  updateIntegration: (id: string, data: Partial<Integration>) => void;

  // ── Configurações de Notificação ──────────────────────────────────────────────
  updateNotificationSetting: (event: string, data: Partial<NotificationSetting>) => void;

  // ── Backup ────────────────────────────────────────────────────────────────────
  exportBackup: () => void;
  importBackup: (json: string) => { success: boolean; error?: string };
}

// ─── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────────
function saveToStorage<T>(key: string, data: T): void {
  storage.set(key, data);
}

function loadFromStorage<T>(key: string): T | null {
  return storage.get<T>(key);
}

/** Lê todos os dados do localStorage ou retorna null se não existirem */
function loadAllFromStorage() {
  return {
    condo:                   loadFromStorage<Condo>('condo'),
    residents:               loadFromStorage<Resident[]>('residents') ?? [],
    units:                   loadFromStorage<Unit[]>('units') ?? [],
    receivables:             loadFromStorage<Receivable[]>('receivables') ?? [],
    payables:                loadFromStorage<Payable[]>('payables') ?? [],
    financialMonths:         loadFromStorage<FinancialMonth[]>('financial_months') ?? [],
    fines:                   loadFromStorage<Fine[]>('fines') ?? [],
    workOrders:              loadFromStorage<WorkOrder[]>('maintenance_orders') ?? [],
    preventiveMaintenance:   loadFromStorage<PreventiveMaintenance[]>('preventive_maintenance') ?? [],
    suppliers:               loadFromStorage<Supplier[]>('suppliers') ?? [],
    assemblies:              loadFromStorage<Assembly[]>('assemblies') ?? [],
    votings:                 loadFromStorage<Voting[]>('votings') ?? [],
    announcements:           loadFromStorage<Announcement[]>('announcements') ?? [],
    visitors:                loadFromStorage<Visitor[]>('visitors') ?? [],
    packages:                loadFromStorage<Package[]>('packages') ?? [],
    commonAreas:             loadFromStorage<CommonArea[]>('common_areas') ?? [],
    reservations:            loadFromStorage<Reservation[]>('reservations') ?? [],
    occurrences:             loadFromStorage<Occurrence[]>('occurrences') ?? [],
    auditLogs:               loadFromStorage<AuditLog[]>('audit_logs') ?? [],
    documents:               loadFromStorage<Document[]>('documents') ?? [],
    integrations:            loadFromStorage<Integration[]>('integrations') ?? [],
    notificationSettings:    loadFromStorage<NotificationSetting[]>('notifications_settings') ?? [],
  };
}

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()((set, get) => ({
  // ── Estado inicial vazio (seed() preenche) ─────────────────────────────────
  condo: null,
  residents: [],
  units: [],
  receivables: [],
  payables: [],
  financialMonths: [],
  fines: [],
  workOrders: [],
  preventiveMaintenance: [],
  suppliers: [],
  assemblies: [],
  votings: [],
  announcements: [],
  visitors: [],
  packages: [],
  commonAreas: [],
  reservations: [],
  occurrences: [],
  auditLogs: [],
  documents: [],
  integrations: [],
  notificationSettings: [],

  // ────────────────────────────────────────────────────────────────────────────
  // seed — carrega do localStorage; se vazio, usa window.CondoSeed
  // ────────────────────────────────────────────────────────────────────────────
  seed() {
    // Se o condo já existe no localStorage, não faz seed novamente
    if (!storage.has('condo')) {
      const seedData = (window as Window & { CondoSeed?: Record<string, unknown> }).CondoSeed;
      if (seedData) {
        // Salvar cada chave do CondoSeed no localStorage
        Object.entries(seedData).forEach(([key, value]) => {
          storage.set(key, value);
        });
        console.info('[CondoHub] Banco de dados inicializado com dados de demonstração.');
      }
    }

    // Carregar tudo do localStorage para o estado Zustand
    const data = loadAllFromStorage();
    set({
      condo:                 data.condo,
      residents:             data.residents,
      units:                 data.units,
      receivables:           data.receivables,
      payables:              data.payables,
      financialMonths:       data.financialMonths,
      fines:                 data.fines,
      workOrders:            data.workOrders,
      preventiveMaintenance: data.preventiveMaintenance,
      suppliers:             data.suppliers,
      assemblies:            data.assemblies,
      votings:               data.votings,
      announcements:         data.announcements,
      visitors:              data.visitors,
      packages:              data.packages,
      commonAreas:           data.commonAreas,
      reservations:          data.reservations,
      occurrences:           data.occurrences,
      auditLogs:             data.auditLogs,
      documents:             data.documents,
      integrations:          data.integrations,
      notificationSettings:  data.notificationSettings,
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // logAudit — registra no localStorage e atualiza o estado
  // ────────────────────────────────────────────────────────────────────────────
  logAudit(action, module, details = {}) {
    const authUser = useAuthStore.getState().user;
    const userId = authUser?.id ?? 'system';
    const userName = authUser?.name ?? 'Sistema';
    const newLog = auditLog(userId, userName, action, module, details);
    // Atualiza o estado para refletir o log adicionado
    set(state => ({ auditLogs: [newLog, ...state.auditLogs].slice(0, 500) }));
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CONDOMÍNIO
  // ────────────────────────────────────────────────────────────────────────────
  updateCondo(data) {
    set(state => {
      const updated = state.condo ? { ...state.condo, ...data } : (data as Condo);
      saveToStorage('condo', updated);
      return { condo: updated };
    });
    get().logAudit('Dados do Condomínio Atualizados', 'Cadastro', data);
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MORADORES
  // ────────────────────────────────────────────────────────────────────────────
  addResident(resident) {
    const newResident: Resident = { id: generateId('r'), ...resident };
    set(state => {
      const updated = [...state.residents, newResident];
      saveToStorage('residents', updated);
      return { residents: updated };
    });
    get().logAudit('Morador Cadastrado', 'Cadastro', { name: newResident.name, unit: newResident.unit });
    return newResident;
  },

  updateResident(id, data) {
    set(state => {
      const updated = state.residents.map(r => (r.id === id ? { ...r, ...data } : r));
      saveToStorage('residents', updated);
      return { residents: updated };
    });
    get().logAudit('Morador Atualizado', 'Cadastro', { ...data, id });
  },

  removeResident(id) {
    const found = get().residents.find(r => r.id === id);
    set(state => {
      const updated = state.residents.filter(r => r.id !== id);
      saveToStorage('residents', updated);
      return { residents: updated };
    });
    get().logAudit('Morador Removido', 'Cadastro', { name: found?.name, unit: found?.unit });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // UNIDADES
  // ────────────────────────────────────────────────────────────────────────────
  updateUnit(id, data) {
    set(state => {
      const updated = state.units.map(u => (u.id === id ? { ...u, ...data } : u));
      saveToStorage('units', updated);
      return { units: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // RECEBÍVEIS
  // ────────────────────────────────────────────────────────────────────────────
  addReceivable(rec) {
    const newRec: Receivable = { id: generateId('rcv'), ...rec };
    set(state => {
      const updated = [...state.receivables, newRec];
      saveToStorage('receivables', updated);
      return { receivables: updated };
    });
    get().logAudit('Recebível Criado', 'Financeiro', { unit: newRec.unit, amount: newRec.amount, type: newRec.type });
    return newRec;
  },

  updateReceivable(id, data) {
    set(state => {
      const updated = state.receivables.map(r => (r.id === id ? { ...r, ...data } : r));
      saveToStorage('receivables', updated);
      return { receivables: updated };
    });
    get().logAudit('Recebível Atualizado', 'Financeiro', { ...data, id });
  },

  removeReceivable(id) {
    set(state => {
      const updated = state.receivables.filter(r => r.id !== id);
      saveToStorage('receivables', updated);
      return { receivables: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // PAGAMENTOS
  // ────────────────────────────────────────────────────────────────────────────
  addPayable(pay) {
    const newPay: Payable = { id: generateId('pay'), ...pay };
    set(state => {
      const updated = [...state.payables, newPay];
      saveToStorage('payables', updated);
      return { payables: updated };
    });
    get().logAudit('Pagamento Criado', 'Financeiro', { supplier: newPay.supplier, amount: newPay.amount });
    return newPay;
  },

  updatePayable(id, data) {
    set(state => {
      const updated = state.payables.map(p => (p.id === id ? { ...p, ...data } : p));
      saveToStorage('payables', updated);
      return { payables: updated };
    });
    get().logAudit('Pagamento Atualizado', 'Financeiro', { ...data, id });
  },

  removePayable(id) {
    set(state => {
      const updated = state.payables.filter(p => p.id !== id);
      saveToStorage('payables', updated);
      return { payables: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MESES FINANCEIROS
  // ────────────────────────────────────────────────────────────────────────────
  updateFinancialMonth(month, data) {
    set(state => {
      const updated = state.financialMonths.map(m =>
        m.month === month ? { ...m, ...data } : m
      );
      saveToStorage('financial_months', updated);
      return { financialMonths: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MULTAS
  // addFine: se level === 'Multa', cria Receivable automaticamente
  // ────────────────────────────────────────────────────────────────────────────
  addFine(fine) {
    const newFine: Fine = { id: generateId('fine'), ...fine };
    set(state => {
      const updated = [...state.fines, newFine];
      saveToStorage('fines', updated);
      return { fines: updated };
    });

    // Criação automática de Receivable para multas financeiras
    if (newFine.level === 'Multa' && newFine.amount > 0) {
      const receivable = get().addReceivable({
        unit: newFine.unit,
        resident: newFine.resident,
        type: `Multa — ${newFine.category}`,
        ref: newFine.date.substring(0, 7),
        due: newFine.date,
        amount: newFine.amount,
        status: 'Pendente',
        paidAt: null,
        method: null,
      });
      // Vincula o ID do recebível na multa
      set(state => {
        const updated = state.fines.map(f =>
          f.id === newFine.id ? { ...f, receivableId: receivable.id } : f
        );
        saveToStorage('fines', updated);
        return { fines: updated };
      });
    }

    get().logAudit('Multa/Advertência Emitida', 'Financeiro', {
      unit: newFine.unit,
      level: newFine.level,
      category: newFine.category,
    });
    return newFine;
  },

  updateFine(id, data) {
    set(state => {
      const updated = state.fines.map(f => (f.id === id ? { ...f, ...data } : f));
      saveToStorage('fines', updated);
      return { fines: updated };
    });
  },

  removeFine(id) {
    set(state => {
      const updated = state.fines.filter(f => f.id !== id);
      saveToStorage('fines', updated);
      return { fines: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ORDENS DE SERVIÇO
  // ────────────────────────────────────────────────────────────────────────────
  addWorkOrder(order) {
    const newOrder: WorkOrder = { id: `OS-${String(Date.now()).slice(-6)}`, ...order };
    set(state => {
      const updated = [...state.workOrders, newOrder];
      saveToStorage('maintenance_orders', updated);
      return { workOrders: updated };
    });
    get().logAudit('Ordem de Serviço Criada', 'Manutenção', { title: newOrder.title, area: newOrder.area });
    return newOrder;
  },

  updateWorkOrder(id, data) {
    set(state => {
      const updated = state.workOrders.map(o => (o.id === id ? { ...o, ...data } : o));
      saveToStorage('maintenance_orders', updated);
      return { workOrders: updated };
    });
    if (data.column) {
      get().logAudit('OS Movida no Kanban', 'Manutenção', { id, column: data.column });
    }
  },

  removeWorkOrder(id) {
    set(state => {
      const updated = state.workOrders.filter(o => o.id !== id);
      saveToStorage('maintenance_orders', updated);
      return { workOrders: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MANUTENÇÃO PREVENTIVA
  // ────────────────────────────────────────────────────────────────────────────
  addPreventiveMaintenance(pm) {
    const newPm: PreventiveMaintenance = { id: generateId('pm'), ...pm };
    set(state => {
      const updated = [...state.preventiveMaintenance, newPm];
      saveToStorage('preventive_maintenance', updated);
      return { preventiveMaintenance: updated };
    });
    return newPm;
  },

  updatePreventiveMaintenance(id, data) {
    set(state => {
      const updated = state.preventiveMaintenance.map(p => (p.id === id ? { ...p, ...data } : p));
      saveToStorage('preventive_maintenance', updated);
      return { preventiveMaintenance: updated };
    });
  },

  removePreventiveMaintenance(id) {
    set(state => {
      const updated = state.preventiveMaintenance.filter(p => p.id !== id);
      saveToStorage('preventive_maintenance', updated);
      return { preventiveMaintenance: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // FORNECEDORES
  // ────────────────────────────────────────────────────────────────────────────
  addSupplier(sup) {
    const newSup: Supplier = { id: generateId('sup'), ...sup };
    set(state => {
      const updated = [...state.suppliers, newSup];
      saveToStorage('suppliers', updated);
      return { suppliers: updated };
    });
    get().logAudit('Fornecedor Cadastrado', 'Manutenção', { name: newSup.name });
    return newSup;
  },

  updateSupplier(id, data) {
    set(state => {
      const updated = state.suppliers.map(s => (s.id === id ? { ...s, ...data } : s));
      saveToStorage('suppliers', updated);
      return { suppliers: updated };
    });
  },

  removeSupplier(id) {
    set(state => {
      const updated = state.suppliers.filter(s => s.id !== id);
      saveToStorage('suppliers', updated);
      return { suppliers: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ASSEMBLEIAS
  // ────────────────────────────────────────────────────────────────────────────
  addAssembly(assembly) {
    const newAssembly: Assembly = { id: generateId('as'), ...assembly };
    set(state => {
      const updated = [...state.assemblies, newAssembly];
      saveToStorage('assemblies', updated);
      return { assemblies: updated };
    });
    get().logAudit('Assembleia Criada', 'Assembleias', { title: newAssembly.title, date: newAssembly.date });
    return newAssembly;
  },

  updateAssembly(id, data) {
    set(state => {
      const updated = state.assemblies.map(a => (a.id === id ? { ...a, ...data } : a));
      saveToStorage('assemblies', updated);
      return { assemblies: updated };
    });
  },

  removeAssembly(id) {
    set(state => {
      const updated = state.assemblies.filter(a => a.id !== id);
      saveToStorage('assemblies', updated);
      return { assemblies: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // VOTAÇÕES
  // ────────────────────────────────────────────────────────────────────────────
  addVoting(voting) {
    const newVoting: Voting = { id: generateId('vote'), ...voting };
    set(state => {
      const updated = [...state.votings, newVoting];
      saveToStorage('votings', updated);
      return { votings: updated };
    });
    get().logAudit('Votação Criada', 'Assembleias', { title: newVoting.title });
    return newVoting;
  },

  updateVoting(id, data) {
    set(state => {
      const updated = state.votings.map(v => (v.id === id ? { ...v, ...data } : v));
      saveToStorage('votings', updated);
      return { votings: updated };
    });
  },

  castVote(votingId, unit, optionId) {
    set(state => {
      const updated = state.votings.map(v => {
        if (v.id !== votingId) return v;
        if (v.userVotes[unit]) return v; // Já votou
        const newOptions = v.options.map(o =>
          o.id === optionId ? { ...o, votesCount: o.votesCount + 1 } : o
        );
        return { ...v, options: newOptions, userVotes: { ...v.userVotes, [unit]: optionId } };
      });
      saveToStorage('votings', updated);
      return { votings: updated };
    });
    get().logAudit('Voto Registrado', 'Assembleias', { votingId, unit, opt: optionId });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // COMUNICADOS
  // ────────────────────────────────────────────────────────────────────────────
  addAnnouncement(ann) {
    const newAnn: Announcement = { id: generateId('com'), ...ann };
    set(state => {
      const updated = [newAnn, ...state.announcements];
      saveToStorage('announcements', updated);
      return { announcements: updated };
    });
    get().logAudit('Comunicado Publicado', 'Comunicados', { title: newAnn.title, category: newAnn.category });
    return newAnn;
  },

  updateAnnouncement(id, data) {
    set(state => {
      const updated = state.announcements.map(a => (a.id === id ? { ...a, ...data } : a));
      saveToStorage('announcements', updated);
      return { announcements: updated };
    });
  },

  removeAnnouncement(id) {
    set(state => {
      const updated = state.announcements.filter(a => a.id !== id);
      saveToStorage('announcements', updated);
      return { announcements: updated };
    });
  },

  incrementViews(id) {
    set(state => {
      const updated = state.announcements.map(a =>
        a.id === id ? { ...a, views: a.views + 1 } : a
      );
      saveToStorage('announcements', updated);
      return { announcements: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // VISITANTES
  // ────────────────────────────────────────────────────────────────────────────
  addVisitor(visitor) {
    const newVisitor: Visitor = { id: generateId('vis'), ...visitor };
    set(state => {
      const updated = [newVisitor, ...state.visitors];
      saveToStorage('visitors', updated);
      return { visitors: updated };
    });
    get().logAudit('Registro de Entrada', 'Portaria', { name: newVisitor.name, unit: newVisitor.unit });
    return newVisitor;
  },

  updateVisitor(id, data) {
    set(state => {
      const updated = state.visitors.map(v => (v.id === id ? { ...v, ...data } : v));
      saveToStorage('visitors', updated);
      return { visitors: updated };
    });
  },

  registerExit(id) {
    const exitTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const visitor = get().visitors.find(v => v.id === id);
    set(state => {
      const updated = state.visitors.map(v =>
        v.id === id ? { ...v, exitTime, status: 'Saiu' as const } : v
      );
      saveToStorage('visitors', updated);
      return { visitors: updated };
    });
    get().logAudit('Registro de Saída', 'Portaria', { name: visitor?.name, unit: visitor?.unit });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ENCOMENDAS
  // ────────────────────────────────────────────────────────────────────────────
  addPackage(pkg) {
    const newPkg: Package = { id: generateId('pkg'), ...pkg };
    set(state => {
      const updated = [newPkg, ...state.packages];
      saveToStorage('packages', updated);
      return { packages: updated };
    });
    get().logAudit('Recebimento de Pacote', 'Encomendas', { resident: newPkg.resident, unit: newPkg.unit });
    return newPkg;
  },

  updatePackage(id, data) {
    set(state => {
      const updated = state.packages.map(p => (p.id === id ? { ...p, ...data } : p));
      saveToStorage('packages', updated);
      return { packages: updated };
    });
  },

  markPackagePickedUp(id, pickedBy) {
    const pickedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const pkg = get().packages.find(p => p.id === id);
    set(state => {
      const updated = state.packages.map(p =>
        p.id === id ? { ...p, status: 'Retirado' as const, pickedAt, pickedBy } : p
      );
      saveToStorage('packages', updated);
      return { packages: updated };
    });
    get().logAudit('Retirada de Encomenda', 'Encomendas', { unit: pkg?.unit, pickedBy });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // RESERVAS
  // ────────────────────────────────────────────────────────────────────────────
  addReservation(res) {
    const newRes: Reservation = { id: generateId('res'), ...res };
    set(state => {
      const updated = [newRes, ...state.reservations];
      saveToStorage('reservations', updated);
      return { reservations: updated };
    });
    get().logAudit('Reserva Solicitada', 'Reservas', { area: newRes.areaName, unit: newRes.unit, date: newRes.date });
    return newRes;
  },

  updateReservation(id, data) {
    set(state => {
      const updated = state.reservations.map(r => (r.id === id ? { ...r, ...data } : r));
      saveToStorage('reservations', updated);
      return { reservations: updated };
    });
    if (data.status) {
      get().logAudit(`Reserva ${data.status}`, 'Reservas', { id, status: data.status });
    }
  },

  removeReservation(id) {
    set(state => {
      const updated = state.reservations.filter(r => r.id !== id);
      saveToStorage('reservations', updated);
      return { reservations: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // OCORRÊNCIAS
  // ────────────────────────────────────────────────────────────────────────────
  addOccurrence(occ) {
    const newOcc: Occurrence = { id: generateId('occ'), ...occ };
    set(state => {
      const updated = [newOcc, ...state.occurrences];
      saveToStorage('occurrences', updated);
      return { occurrences: updated };
    });
    get().logAudit('Abertura de Ocorrência', 'Ocorrências', {
      category: newOcc.category,
      unit: newOcc.complainingUnit,
    });
    return newOcc;
  },

  updateOccurrence(id, data) {
    set(state => {
      const updated = state.occurrences.map(o => (o.id === id ? { ...o, ...data } : o));
      saveToStorage('occurrences', updated);
      return { occurrences: updated };
    });
    if (data.status) {
      get().logAudit('Atualização de Ocorrência', 'Ocorrências', { id, status: data.status });
    }
  },

  removeOccurrence(id) {
    set(state => {
      const updated = state.occurrences.filter(o => o.id !== id);
      saveToStorage('occurrences', updated);
      return { occurrences: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // DOCUMENTOS
  // ────────────────────────────────────────────────────────────────────────────
  addDocument(doc) {
    const newDoc: Document = { id: generateId('doc'), ...doc };
    set(state => {
      const updated = [newDoc, ...state.documents];
      saveToStorage('documents', updated);
      return { documents: updated };
    });
    get().logAudit('Documento Adicionado', 'Cadastro', { title: newDoc.title, category: newDoc.category });
    return newDoc;
  },

  updateDocument(id, data) {
    set(state => {
      const updated = state.documents.map(d => (d.id === id ? { ...d, ...data } : d));
      saveToStorage('documents', updated);
      return { documents: updated };
    });
  },

  removeDocument(id) {
    set(state => {
      const updated = state.documents.filter(d => d.id !== id);
      saveToStorage('documents', updated);
      return { documents: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // INTEGRAÇÕES
  // ────────────────────────────────────────────────────────────────────────────
  updateIntegration(id, data) {
    set(state => {
      const updated = state.integrations.map(i => (i.id === id ? { ...i, ...data } : i));
      saveToStorage('integrations', updated);
      return { integrations: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CONFIGURAÇÕES DE NOTIFICAÇÃO
  // ────────────────────────────────────────────────────────────────────────────
  updateNotificationSetting(event, data) {
    set(state => {
      const updated = state.notificationSettings.map(s =>
        s.event === event ? { ...s, ...data } : s
      );
      saveToStorage('notifications_settings', updated);
      return { notificationSettings: updated };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BACKUP — exportBackup
  // Baixa todos os dados como JSON via Blob
  // ────────────────────────────────────────────────────────────────────────────
  exportBackup() {
    const state = get();
    const today = new Date().toISOString().split('T')[0];

    const backupData = {
      _version: 1,
      _exportedAt: new Date().toISOString(),
      _exportedBy: useAuthStore.getState().user?.name ?? 'Sistema',
      condo:                 state.condo,
      residents:             state.residents,
      units:                 state.units,
      receivables:           state.receivables,
      payables:              state.payables,
      financial_months:      state.financialMonths,
      fines:                 state.fines,
      maintenance_orders:    state.workOrders,
      preventive_maintenance: state.preventiveMaintenance,
      suppliers:             state.suppliers,
      assemblies:            state.assemblies,
      votings:               state.votings,
      announcements:         state.announcements,
      visitors:              state.visitors,
      packages:              state.packages,
      common_areas:          state.commonAreas,
      reservations:          state.reservations,
      occurrences:           state.occurrences,
      audit_logs:            state.auditLogs,
      documents:             state.documents,
      integrations:          state.integrations,
      notifications_settings: state.notificationSettings,
    };

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    get().logAudit('Backup Exportado', 'Configurações', { date: today });
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BACKUP — importBackup
  // Valida estrutura → restaura dados → recarrega estado
  // ────────────────────────────────────────────────────────────────────────────
  importBackup(json: string): { success: boolean; error?: string } {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      return { success: false, error: 'Arquivo JSON inválido ou corrompido.' };
    }

    // Validação básica de estrutura
    if (!parsed.condo || !parsed.residents || !parsed.receivables) {
      return {
        success: false,
        error: 'Estrutura de backup inválida. Verifique se o arquivo é um backup do CondoHub.',
      };
    }

    // Restaurar cada entidade no localStorage
    const keyMap: Record<string, string> = {
      condo:                  'condo',
      residents:              'residents',
      units:                  'units',
      receivables:            'receivables',
      payables:               'payables',
      financial_months:       'financial_months',
      fines:                  'fines',
      maintenance_orders:     'maintenance_orders',
      preventive_maintenance: 'preventive_maintenance',
      suppliers:              'suppliers',
      assemblies:             'assemblies',
      votings:                'votings',
      announcements:          'announcements',
      visitors:               'visitors',
      packages:               'packages',
      common_areas:           'common_areas',
      reservations:           'reservations',
      occurrences:            'occurrences',
      audit_logs:             'audit_logs',
      documents:              'documents',
      integrations:           'integrations',
      notifications_settings: 'notifications_settings',
    };

    Object.entries(keyMap).forEach(([backupKey, storageKey]) => {
      if (parsed[backupKey] !== undefined) {
        storage.set(storageKey, parsed[backupKey]);
      }
    });

    // Recarregar estado do localStorage
    get().seed();
    get().logAudit('Backup Importado', 'Configurações', {});

    return { success: true };
  },
}));
