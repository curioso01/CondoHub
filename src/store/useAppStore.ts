import { create } from 'zustand';
import {
  Condo,
  Resident,
  Receivable,
  Payable,
  FinancialMonth,
  WorkOrder,
  PreventiveMaintenance,
  Supplier,
  Assembly,
  Voting,
  Announcement,
  Visitor,
  PackageItem,
  CommonArea,
  Reservation,
  Occurrence,
  Unit,
  DocumentItem,
  Fine,
  PaymentStatus,
  WorkOrderStatus,
  ReservationStatus,
  OccurrenceStatus,
  AuditLog
} from '../types';
import { storage } from '../lib/storage';
import { audit } from '../lib/audit';

declare global {
  interface Window {
    CondoSeed?: Record<string, unknown>;
  }
}

function getInitialData<T>(key: string, fallback: T): T {
  const fromStorage = storage.get<T>(key);
  if (fromStorage !== null && fromStorage !== undefined) {
    return fromStorage;
  }
  if (typeof window !== 'undefined' && window.CondoSeed && window.CondoSeed[key]) {
    const seedVal = window.CondoSeed[key] as T;
    storage.set(key, seedVal);
    return seedVal;
  }
  return fallback;
}

export interface AppState {
  condo: Condo;
  residents: Resident[];
  units: Unit[];
  receivables: Receivable[];
  payables: Payable[];
  financialMonths: FinancialMonth[];
  fines: Fine[];
  workOrders: WorkOrder[];
  maintenanceOrders: WorkOrder[]; // Alias
  preventiveMaintenance: PreventiveMaintenance[];
  suppliers: Supplier[];
  assemblies: Assembly[];
  votings: Voting[];
  announcements: Announcement[];
  visitors: Visitor[];
  packages: PackageItem[];
  commonAreas: CommonArea[];
  reservations: Reservation[];
  occurrences: Occurrence[];
  documents: DocumentItem[];
  auditLogs: AuditLog[];

  // Global & Lifecycle
  seed: () => void;
  resetToSeed: () => void;
  exportBackup: () => string;
  importBackup: (jsonContent: string) => boolean;
  logAudit: (action: string, module: string, details: Record<string, unknown> | string) => void;

  // Condo
  updateCondo: (data: Partial<Condo>) => void;

  // Receivables & Payables
  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  updateReceivable: (id: string, data: Partial<Receivable>) => void;
  removeReceivable: (id: string) => void;
  updateReceivableStatus: (id: string, status: PaymentStatus, method?: string) => void;

  addPayable: (payable: Omit<Payable, 'id'>) => void;
  updatePayable: (id: string, data: Partial<Payable>) => void;
  removePayable: (id: string) => void;
  updatePayableStatus: (id: string, status: 'Pendente' | 'Pago' | 'Em aprovação' | 'Cancelado', approvedBy?: string) => void;

  // Fines
  addFine: (fine: Omit<Fine, 'id' | 'createdAt'>) => void;
  updateFine: (id: string, data: Partial<Fine>) => void;
  removeFine: (id: string) => void;
  updateFineStatus: (id: string, status: 'Notificado' | 'Recorrido' | 'Confirmado' | 'Pago') => void;

  // Work Orders & Maintenance
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  removeWorkOrder: (id: string) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, note?: string, user?: string) => void;

  // Assemblies & Votings
  addAssembly: (assembly: Omit<Assembly, 'id'>) => void;
  updateAssembly: (id: string, data: Partial<Assembly>) => void;
  removeAssembly: (id: string) => void;
  castVote: (votingId: string, unitCode: string, optionId: string) => void;

  // Announcements
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'views'>) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  removeAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;

  // Visitors & Packages
  addVisitor: (visitor: Omit<Visitor, 'id' | 'enteredAt' | 'status'>) => void;
  updateVisitor: (id: string, data: Partial<Visitor>) => void;
  removeVisitor: (id: string) => void;
  checkoutVisitor: (id: string) => void;

  addPackage: (pkg: Omit<PackageItem, 'id' | 'receivedAt' | 'status' | 'pickedAt' | 'pickedBy'>) => void;
  updatePackage: (id: string, data: Partial<PackageItem>) => void;
  removePackage: (id: string) => void;
  pickupPackage: (id: string, pickedBy: string) => void;

  // Reservations
  addReservation: (res: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;

  // Occurrences
  addOccurrence: (occ: Omit<Occurrence, 'id' | 'createdAt' | 'timeline'>) => void;
  updateOccurrence: (id: string, data: Partial<Occurrence>) => void;
  removeOccurrence: (id: string) => void;
  updateOccurrenceStatus: (id: string, status: OccurrenceStatus, resolutionNotes?: string) => void;

  // Residents & Units
  addResident: (resident: Omit<Resident, 'id'>) => void;
  updateResident: (id: string, data: Partial<Resident>) => void;
  removeResident: (id: string) => void;
  deleteResident: (id: string) => void;

  // Documents
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => void;
  removeDocument: (id: string) => void;
}

const DEFAULT_CONDO: Condo = {
  id: 'c1',
  name: 'Residencial das Palmeiras',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Palmeiras, 500',
  neighborhood: 'Jardins',
  city: 'São Paulo',
  state: 'SP',
  cep: '01310-100',
  phone: '(11) 3456-7890',
  email: 'contato@palmeirascondo.com.br',
  sindico: 'Carlos Mendonça',
  adminCompany: 'Admicon Administradora Ltda',
  totalUnits: 48,
  blocks: ['A', 'B', 'C', 'D'],
  unitsPerBlock: 12,
  bankName: 'Banco Itaú',
  bankAgency: '1234',
  bankAccount: '56789-0',
  logo: null,
  plan: 'Profissional'
};

const initialWorkOrders = getInitialData<WorkOrder[]>('maintenance_orders', []);

export const useAppStore = create<AppState>((set, get) => ({
  condo: getInitialData<Condo>('condo', DEFAULT_CONDO),
  residents: getInitialData<Resident[]>('residents', []),
  units: getInitialData<Unit[]>('units', []),
  receivables: getInitialData<Receivable[]>('receivables', []),
  payables: getInitialData<Payable[]>('payables', []),
  financialMonths: getInitialData<FinancialMonth[]>('financial_months', []),
  fines: getInitialData<Fine[]>('fines', [
    {
      id: 'fine_1',
      unit: 'A202',
      residentName: 'Fernando Henrique Lima',
      violation: 'Barulho Excessivo / Lei do Silêncio',
      level: '1ª Advertência',
      amount: 0,
      date: '2026-09-19',
      status: 'Notificado',
      description: 'Música alta e algazarra após às 22h no Bloco A.',
      createdAt: '2026-09-19 10:30'
    },
    {
      id: 'fine_2',
      unit: 'B102',
      residentName: 'Lucas Gabriel Pereira',
      violation: 'Vaga de Garagem Bloqueada',
      level: 'Multa',
      amount: 400,
      date: '2026-09-18',
      status: 'Confirmado',
      description: 'Estacionamento indevido na vaga de vizinho após reincidência.',
      createdAt: '2026-09-18 20:00'
    }
  ]),
  workOrders: initialWorkOrders,
  maintenanceOrders: initialWorkOrders,
  preventiveMaintenance: getInitialData<PreventiveMaintenance[]>('preventive_maintenance', []),
  suppliers: getInitialData<Supplier[]>('suppliers', []),
  assemblies: getInitialData<Assembly[]>('assemblies', []),
  votings: getInitialData<Voting[]>('votings', []),
  announcements: getInitialData<Announcement[]>('announcements', []),
  visitors: getInitialData<Visitor[]>('visitors', []),
  packages: getInitialData<PackageItem[]>('packages', []),
  commonAreas: getInitialData<CommonArea[]>('common_areas', []),
  reservations: getInitialData<Reservation[]>('reservations', []),
  occurrences: getInitialData<Occurrence[]>('occurrences', []),
  documents: getInitialData<DocumentItem[]>('documents', []),
  auditLogs: getInitialData<AuditLog[]>('audit_logs', audit.getLogs()),

  // seed(): se storage vazio, carrega window.CondoSeed; senão carrega do storage
  seed: () => {
    const existingResidents = storage.get<Resident[]>('residents');
    if (!existingResidents || existingResidents.length === 0) {
      if (typeof window !== 'undefined' && window.CondoSeed) {
        Object.keys(window.CondoSeed).forEach(k => {
          storage.set(k, window.CondoSeed![k]);
        });
        const seedOrders = (window.CondoSeed.maintenance_orders as WorkOrder[]) || [];
        set({
          condo: (window.CondoSeed.condo as Condo) || DEFAULT_CONDO,
          residents: (window.CondoSeed.residents as Resident[]) || [],
          units: (window.CondoSeed.units as Unit[]) || [],
          receivables: (window.CondoSeed.receivables as Receivable[]) || [],
          payables: (window.CondoSeed.payables as Payable[]) || [],
          financialMonths: (window.CondoSeed.financial_months as FinancialMonth[]) || [],
          workOrders: seedOrders,
          maintenanceOrders: seedOrders,
          preventiveMaintenance: (window.CondoSeed.preventive_maintenance as PreventiveMaintenance[]) || [],
          suppliers: (window.CondoSeed.suppliers as Supplier[]) || [],
          assemblies: (window.CondoSeed.assemblies as Assembly[]) || [],
          votings: (window.CondoSeed.votings as Voting[]) || [],
          announcements: (window.CondoSeed.announcements as Announcement[]) || [],
          visitors: (window.CondoSeed.visitors as Visitor[]) || [],
          packages: (window.CondoSeed.packages as PackageItem[]) || [],
          commonAreas: (window.CondoSeed.common_areas as CommonArea[]) || [],
          reservations: (window.CondoSeed.reservations as Reservation[]) || [],
          occurrences: (window.CondoSeed.occurrences as Occurrence[]) || [],
          documents: (window.CondoSeed.documents as DocumentItem[]) || []
        });
      }
    }
  },

  resetToSeed: () => {
    if (typeof window !== 'undefined' && window.CondoSeed) {
      Object.keys(window.CondoSeed).forEach(k => {
        storage.set(k, window.CondoSeed![k]);
      });
      storage.remove('fines');
      const seedOrders = (window.CondoSeed.maintenance_orders as WorkOrder[]) || [];
      set({
        condo: (window.CondoSeed.condo as Condo) || DEFAULT_CONDO,
        residents: (window.CondoSeed.residents as Resident[]) || [],
        units: (window.CondoSeed.units as Unit[]) || [],
        receivables: (window.CondoSeed.receivables as Receivable[]) || [],
        payables: (window.CondoSeed.payables as Payable[]) || [],
        financialMonths: (window.CondoSeed.financial_months as FinancialMonth[]) || [],
        workOrders: seedOrders,
        maintenanceOrders: seedOrders,
        preventiveMaintenance: (window.CondoSeed.preventive_maintenance as PreventiveMaintenance[]) || [],
        suppliers: (window.CondoSeed.suppliers as Supplier[]) || [],
        assemblies: (window.CondoSeed.assemblies as Assembly[]) || [],
        votings: (window.CondoSeed.votings as Voting[]) || [],
        announcements: (window.CondoSeed.announcements as Announcement[]) || [],
        visitors: (window.CondoSeed.visitors as Visitor[]) || [],
        packages: (window.CondoSeed.packages as PackageItem[]) || [],
        commonAreas: (window.CondoSeed.common_areas as CommonArea[]) || [],
        reservations: (window.CondoSeed.reservations as Reservation[]) || [],
        occurrences: (window.CondoSeed.occurrences as Occurrence[]) || [],
        documents: (window.CondoSeed.documents as DocumentItem[]) || [],
        fines: []
      });
      get().logAudit('Restauração de Dados da Semente (Seed Reset)', 'Configurações', 'Banco resetado para dados originais');
    }
  },

  // exportBackup(): JSON.stringify de todas as entidades + download via Blob nome: condohub-backup-YYYY-MM-DD.json
  exportBackup: () => {
    const data = {
      condo: get().condo,
      residents: get().residents,
      units: get().units,
      receivables: get().receivables,
      payables: get().payables,
      financial_months: get().financialMonths,
      fines: get().fines,
      maintenance_orders: get().workOrders,
      preventive_maintenance: get().preventiveMaintenance,
      suppliers: get().suppliers,
      assemblies: get().assemblies,
      votings: get().votings,
      announcements: get().announcements,
      visitors: get().visitors,
      packages: get().packages,
      common_areas: get().commonAreas,
      reservations: get().reservations,
      occurrences: get().occurrences,
      documents: get().documents,
      audit_logs: get().auditLogs,
      exportedAt: new Date().toISOString(),
      version: '2.0.0-react'
    };

    const jsonString = JSON.stringify(data, null, 2);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const today = new Date().toISOString().substring(0, 10);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `condohub-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    get().logAudit('Exportação de Backup Completo', 'Configurações', 'Download do arquivo JSON de backup');
    return jsonString;
  },

  // importBackup(json): valida estrutura (verifica chaves obrigatórias), restaura no storage
  importBackup: (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') return false;

      // Validação de estrutura mínima
      const hasBasicKeys = parsed.condo || parsed.residents || parsed.receivables || parsed.payables;
      if (!hasBasicKeys) {
        console.error('Arquivo de backup inválido: chaves principais ausentes.');
        return false;
      }

      const keysMap: Record<string, keyof AppState> = {
        condo: 'condo',
        residents: 'residents',
        units: 'units',
        receivables: 'receivables',
        payables: 'payables',
        financial_months: 'financialMonths',
        fines: 'fines',
        maintenance_orders: 'workOrders',
        preventive_maintenance: 'preventiveMaintenance',
        suppliers: 'suppliers',
        assemblies: 'assemblies',
        votings: 'votings',
        announcements: 'announcements',
        visitors: 'visitors',
        packages: 'packages',
        common_areas: 'commonAreas',
        reservations: 'reservations',
        occurrences: 'occurrences',
        documents: 'documents',
        audit_logs: 'auditLogs'
      };

      const newState: Partial<AppState> = {};

      Object.entries(keysMap).forEach(([storeKey, stateKey]) => {
        if (parsed[storeKey] !== undefined) {
          storage.set(storeKey, parsed[storeKey]);
          (newState as Record<string, unknown>)[stateKey] = parsed[storeKey];
        }
      });

      if (newState.workOrders) {
        newState.maintenanceOrders = newState.workOrders;
      }

      set(newState as AppState);
      get().logAudit('Restauração de Backup Concluída', 'Configurações', 'Dados importados com sucesso');
      return true;
    } catch (e) {
      console.error('Erro ao restaurar backup:', e);
      return false;
    }
  },

  // logAudit(action,module,details): chama audit.log + adiciona em auditLogs do estado
  logAudit: (action: string, module: string, details: Record<string, unknown> | string) => {
    audit.log('user_current', 'Usuário Autenticado', action, module, details);
    const updated = audit.getLogs();
    set({ auditLogs: updated });
  },

  updateCondo: (data) => {
    const updated = { ...get().condo, ...data };
    storage.set('condo', updated);
    set({ condo: updated });
    get().logAudit('Atualização dos Dados do Condomínio', 'Configurações', data as Record<string, unknown>);
  },

  // Receivables
  addReceivable: (receivable) => {
    const newRec: Receivable = {
      ...receivable,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    };
    const updated = [newRec, ...get().receivables];
    storage.set('receivables', updated);
    set({ receivables: updated });
  },

  updateReceivable: (id, data) => {
    const updated = get().receivables.map(r => (r.id === id ? { ...r, ...data } : r));
    storage.set('receivables', updated);
    set({ receivables: updated });
  },

  removeReceivable: (id) => {
    const updated = get().receivables.filter(r => r.id !== id);
    storage.set('receivables', updated);
    set({ receivables: updated });
  },

  updateReceivableStatus: (id, status, method) => {
    const updated = get().receivables.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          paidAt: status === 'Pago' ? new Date().toISOString().substring(0, 10) : null,
          method: method || r.method
        };
      }
      return r;
    });
    storage.set('receivables', updated);
    set({ receivables: updated });
  },

  // Payables
  addPayable: (payable) => {
    const newPay: Payable = {
      ...payable,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    };
    const updated = [newPay, ...get().payables];
    storage.set('payables', updated);
    set({ payables: updated });
  },

  updatePayable: (id, data) => {
    const updated = get().payables.map(p => (p.id === id ? { ...p, ...data } : p));
    storage.set('payables', updated);
    set({ payables: updated });
  },

  removePayable: (id) => {
    const updated = get().payables.filter(p => p.id !== id);
    storage.set('payables', updated);
    set({ payables: updated });
  },

  updatePayableStatus: (id, status, approvedBy) => {
    const updated = get().payables.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          paidAt: status === 'Pago' ? new Date().toISOString().substring(0, 10) : null,
          approvedBy: approvedBy || p.approvedBy
        };
      }
      return p;
    });
    storage.set('payables', updated);
    set({ payables: updated });
  },

  // addFine(fine): se fine.level==='Multa', cria automaticamente um Receivable com type='Multa', amount=fine.amount, ref=fine.date.substring(0,7)
  addFine: (fine) => {
    const newFine: Fine = {
      ...fine,
      id: `fine_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    const updated = [newFine, ...get().fines];
    storage.set('fines', updated);
    set({ fines: updated });

    if (fine.level === 'Multa' && (fine.amount || 0) > 0) {
      get().addReceivable({
        unit: fine.unit,
        resident: fine.residentName || 'Morador Infrator',
        type: 'Multa Condominial',
        ref: fine.date.substring(0, 7),
        due: fine.date,
        amount: fine.amount || 0,
        status: 'Pendente',
        paidAt: null,
        method: null
      });
    }

    get().logAudit('Registro de Advertência/Multa', 'Financeiro', {
      unit: fine.unit,
      level: fine.level,
      violation: fine.violation
    });
  },

  updateFine: (id, data) => {
    const updated = get().fines.map(f => (f.id === id ? { ...f, ...data } : f));
    storage.set('fines', updated);
    set({ fines: updated });
  },

  removeFine: (id) => {
    const updated = get().fines.filter(f => f.id !== id);
    storage.set('fines', updated);
    set({ fines: updated });
  },

  updateFineStatus: (id, status) => {
    const updated = get().fines.map(f => (f.id === id ? { ...f, status } : f));
    storage.set('fines', updated);
    set({ fines: updated });
  },

  // Work Orders & Maintenance
  addWorkOrder: (order) => {
    const newOrder: WorkOrder = {
      ...order,
      id: `os_${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    const updated = [newOrder, ...get().workOrders];
    storage.set('maintenance_orders', updated);
    set({ workOrders: updated, maintenanceOrders: updated });
  },

  updateWorkOrder: (id, data) => {
    const updated = get().workOrders.map(o => (o.id === id ? { ...o, ...data } : o));
    storage.set('maintenance_orders', updated);
    set({ workOrders: updated, maintenanceOrders: updated });
  },

  removeWorkOrder: (id) => {
    const updated = get().workOrders.filter(o => o.id !== id);
    storage.set('maintenance_orders', updated);
    set({ workOrders: updated, maintenanceOrders: updated });
  },

  updateWorkOrderStatus: (id, status, note, user) => {
    const updated = get().workOrders.map(o => {
      if (o.id === id) {
        const history = o.history || [];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...o,
          status,
          column: status,
          history: [
            ...history,
            {
              date: now,
              status,
              user: user || 'Administração',
              note: note || `Status alterado para ${status}`
            }
          ]
        };
      }
      return o;
    });
    storage.set('maintenance_orders', updated);
    set({ workOrders: updated, maintenanceOrders: updated });
  },

  // Assemblies & Votings
  addAssembly: (assembly) => {
    const newAssembly: Assembly = {
      ...assembly,
      id: `asm_${Date.now()}`
    };
    const updated = [newAssembly, ...get().assemblies];
    storage.set('assemblies', updated);
    set({ assemblies: updated });
  },

  updateAssembly: (id, data) => {
    const updated = get().assemblies.map(a => (a.id === id ? { ...a, ...data } : a));
    storage.set('assemblies', updated);
    set({ assemblies: updated });
  },

  removeAssembly: (id) => {
    const updated = get().assemblies.filter(a => a.id !== id);
    storage.set('assemblies', updated);
    set({ assemblies: updated });
  },

  castVote: (votingId, unitCode, optionId) => {
    const updated = get().votings.map(v => {
      if (v.id === votingId) {
        const userVotes = { ...(v.userVotes || {}), [unitCode]: optionId };
        const totalVotes = Object.keys(userVotes).length;
        const options = (v.options || []).map(opt => {
          const count = Object.values(userVotes).filter(vOptId => vOptId === opt.id).length;
          return {
            ...opt,
            votesCount: count,
            fractionPercent: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          };
        });
        return {
          ...v,
          userVotes,
          options
        };
      }
      return v;
    });
    storage.set('votings', updated);
    set({ votings: updated });
    get().logAudit('Voto em Assembleia Registrado', 'Assembleias', { votingId, unitCode, optionId });
  },

  // Announcements
  addAnnouncement: (announcement) => {
    const newAnn: Announcement = {
      ...announcement,
      id: `ann_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      views: 0
    };
    const updated = [newAnn, ...get().announcements];
    storage.set('announcements', updated);
    set({ announcements: updated });
  },

  updateAnnouncement: (id, data) => {
    const updated = get().announcements.map(a => (a.id === id ? { ...a, ...data } : a));
    storage.set('announcements', updated);
    set({ announcements: updated });
  },

  removeAnnouncement: (id) => {
    const updated = get().announcements.filter(a => a.id !== id);
    storage.set('announcements', updated);
    set({ announcements: updated });
  },

  deleteAnnouncement: (id) => {
    get().removeAnnouncement(id);
  },

  togglePinAnnouncement: (id) => {
    const updated = get().announcements.map(a => (a.id === id ? { ...a, pinned: !a.pinned } : a));
    storage.set('announcements', updated);
    set({ announcements: updated });
  },

  // Visitors
  addVisitor: (visitor) => {
    const newVis: Visitor = {
      ...visitor,
      id: `vis_${Date.now()}`,
      enteredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Dentro'
    };
    const updated = [newVis, ...get().visitors];
    storage.set('visitors', updated);
    set({ visitors: updated });
  },

  updateVisitor: (id, data) => {
    const updated = get().visitors.map(v => (v.id === id ? { ...v, ...data } : v));
    storage.set('visitors', updated);
    set({ visitors: updated });
  },

  removeVisitor: (id) => {
    const updated = get().visitors.filter(v => v.id !== id);
    storage.set('visitors', updated);
    set({ visitors: updated });
  },

  checkoutVisitor: (id) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = get().visitors.map(v =>
      v.id === id ? { ...v, status: 'Saiu' as const, exitTime: time, leftAt: time } : v
    );
    storage.set('visitors', updated);
    set({ visitors: updated });
  },

  // Packages
  addPackage: (p) => {
    const newPkg: PackageItem = {
      ...p,
      id: `pkg_${Date.now()}`,
      receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Aguardando Retirada',
      pickedAt: null,
      pickedBy: null
    };
    const updated = [newPkg, ...get().packages];
    storage.set('packages', updated);
    set({ packages: updated });
  },

  updatePackage: (id, data) => {
    const updated = get().packages.map(p => (p.id === id ? { ...p, ...data } : p));
    storage.set('packages', updated);
    set({ packages: updated });
  },

  removePackage: (id) => {
    const updated = get().packages.filter(p => p.id !== id);
    storage.set('packages', updated);
    set({ packages: updated });
  },

  pickupPackage: (id, pickedBy) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = get().packages.map(p =>
      p.id === id
        ? {
            ...p,
            status: 'Retirado' as const,
            pickedAt: time,
            pickedBy
          }
        : p
    );
    storage.set('packages', updated);
    set({ packages: updated });
  },

  // Reservations
  addReservation: (res) => {
    const newRes: Reservation = {
      ...res,
      id: `res_${Date.now()}`
    };
    const updated = [newRes, ...get().reservations];
    storage.set('reservations', updated);
    set({ reservations: updated });

    if (newRes.fee > 0) {
      get().addReceivable({
        unit: newRes.unit || 'A101',
        resident: newRes.resident || newRes.createdByName || 'Morador',
        type: `Taxa Reserva: ${newRes.areaName}`,
        ref: newRes.date.substring(0, 7),
        due: newRes.date,
        amount: newRes.fee,
        status: 'Pendente',
        paidAt: null,
        method: null
      });
    }
  },

  updateReservation: (id, data) => {
    const updated = get().reservations.map(r => (r.id === id ? { ...r, ...data } : r));
    storage.set('reservations', updated);
    set({ reservations: updated });
  },

  removeReservation: (id) => {
    const updated = get().reservations.filter(r => r.id !== id);
    storage.set('reservations', updated);
    set({ reservations: updated });
  },

  updateReservationStatus: (id, status) => {
    const updated = get().reservations.map(r => (r.id === id ? { ...r, status } : r));
    storage.set('reservations', updated);
    set({ reservations: updated });
  },

  // Occurrences
  addOccurrence: (occ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOcc: Occurrence = {
      ...occ,
      id: `occ_${Date.now()}`,
      createdAt: now,
      date: now,
      slaHoursLeft: 48,
      slaStatus: 'ok',
      timeline: [
        {
          date: now,
          user: occ.isAnonymous ? 'Anônimo' : occ.resident || 'Morador',
          text: 'Ocorrência registrada no sistema'
        }
      ]
    };
    const updated = [newOcc, ...get().occurrences];
    storage.set('occurrences', updated);
    set({ occurrences: updated });
  },

  updateOccurrence: (id, data) => {
    const updated = get().occurrences.map(o => (o.id === id ? { ...o, ...data } : o));
    storage.set('occurrences', updated);
    set({ occurrences: updated });
  },

  removeOccurrence: (id) => {
    const updated = get().occurrences.filter(o => o.id !== id);
    storage.set('occurrences', updated);
    set({ occurrences: updated });
  },

  updateOccurrenceStatus: (id, status, resolutionNotes) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = get().occurrences.map(o => {
      if (o.id === id) {
        const timeline = o.timeline || [];
        return {
          ...o,
          status,
          resolutionNotes: resolutionNotes || o.resolutionNotes,
          slaHoursLeft: status === 'Resolvida' || status === 'Arquivada' ? 0 : o.slaHoursLeft,
          timeline: [
            ...timeline,
            {
              date: now,
              user: 'Administração',
              text: `Status alterado para ${status}${resolutionNotes ? ': ' + resolutionNotes : ''}`
            }
          ]
        };
      }
      return o;
    });
    storage.set('occurrences', updated);
    set({ occurrences: updated });
  },

  // Residents & Units
  addResident: (resident) => {
    const newRes: Resident = {
      ...resident,
      id: `r_${Date.now()}`
    };
    const updated = [newRes, ...get().residents];
    storage.set('residents', updated);
    set({ residents: updated });
  },

  updateResident: (id, data) => {
    const updated = get().residents.map(r => (r.id === id ? { ...r, ...data } : r));
    storage.set('residents', updated);
    set({ residents: updated });
  },

  removeResident: (id) => {
    const updated = get().residents.filter(r => r.id !== id);
    storage.set('residents', updated);
    set({ residents: updated });
  },

  deleteResident: (id) => {
    get().removeResident(id);
  },

  // Documents
  addDocument: (doc) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadDate: new Date().toISOString().substring(0, 10)
    };
    const updated = [newDoc, ...get().documents];
    storage.set('documents', updated);
    set({ documents: updated });
  },

  removeDocument: (id) => {
    const updated = get().documents.filter(d => d.id !== id);
    storage.set('documents', updated);
    set({ documents: updated });
  }
}));
