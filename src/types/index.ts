// CONDOHUB — TIPOS E INTERFACES TYPESCRIPT

// ─── ROLES ────────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'SINDICO' | 'CONSELHEIRO' | 'MORADOR' | 'PORTEIRO';

// ─── USUÁRIO / AUTH ───────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar: string;
  condoId: string;
  unitId?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginAttempts {
  [email: string]: {
    count: number;
    lastAttempt: number;
  };
}

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  waitSeconds?: number;
}

// ─── CONDOMÍNIO ───────────────────────────────────────────────────────────────
export interface Condo {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  email: string;
  sindico: string;
  adminCompany: string;
  totalUnits: number;
  blocks: string[];
  unitsPerBlock: number;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  logo: string | null;
  plan: string;
}

// ─── VEÍCULO ──────────────────────────────────────────────────────────────────
export interface Vehicle {
  plate: string;
  model: string;
  color: string;
  spot: string;
}

// ─── MORADOR / RESIDENTE ──────────────────────────────────────────────────────
export type ResidentType = 'proprietario' | 'inquilino';
export type ResidentStatus = 'ativo' | 'inadimplente' | 'inativo';

export interface Resident {
  id: string;
  name: string;
  cpf: string;
  unit: string;
  block: string;
  type: ResidentType;
  phone: string;
  email: string;
  vehicles: Vehicle[];
  status: ResidentStatus;
}

// ─── UNIDADE ──────────────────────────────────────────────────────────────────
export type UnitStatus = 'Ocupada' | 'Vaga' | 'Em Reforma';

export interface Unit {
  id: string;
  unit: string;
  block: string;
  area: number;
  fraction: number;
  spots: string[];
  ownerName: string;
  ownerCpf: string;
  ownerPhone: string;
  ownerEmail: string;
  tenantName: string | null;
  tenantPhone: string | null;
  status: UnitStatus;
}

// ─── FINANCEIRO — RECEBÍVEIS ──────────────────────────────────────────────────
export type ReceivableStatus = 'Pago' | 'Pendente' | 'Vencido' | 'Em acordo';
export type PaymentMethod = 'Pix' | 'Boleto' | 'TED' | 'Dinheiro' | 'Cartão' | null;

export interface Receivable {
  id: string;
  unit: string;
  resident: string;
  type: string;
  ref: string;
  due: string;
  amount: number;
  status: ReceivableStatus;
  paidAt: string | null;
  method: PaymentMethod;
}

// ─── FINANCEIRO — PAGAMENTOS ──────────────────────────────────────────────────
export type PayableStatus = 'Pago' | 'Pendente' | 'Em aprovação' | 'Cancelado';

export interface Payable {
  id: string;
  supplier: string;
  cnpj: string;
  category: string;
  description: string;
  due: string;
  amount: number;
  status: PayableStatus;
  approvedBy: string | null;
  costCenter: string;
}

// ─── FINANCEIRO — MESES ───────────────────────────────────────────────────────
export interface FinancialMonth {
  month: string;
  revenue: number;
  expenses: number;
  balance: number;
}

// ─── MULTAS / ADVERTÊNCIAS ────────────────────────────────────────────────────
export type FineLevel = '1ª Advertência' | '2ª Advertência' | 'Multa';
export type FineStatus = 'Aberta' | 'Paga' | 'Cancelada' | 'Recurso';

export interface Fine {
  id: string;
  unit: string;
  resident: string;
  level: FineLevel;
  category: string;
  description: string;
  date: string;
  amount: number;
  status: FineStatus;
  receivableId?: string;
}

// ─── MANUTENÇÃO — ORDENS DE SERVIÇO ──────────────────────────────────────────
export type WorkOrderPriority = 'Urgente' | 'Alta' | 'Media' | 'Baixa';
export type WorkOrderColumn =
  | 'aberta'
  | 'em_analise'
  | 'aprovada'
  | 'em_execucao'
  | 'concluida'
  | 'cancelada';

export interface WorkOrderHistory {
  date: string;
  user: string;
  note: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  area: string;
  priority: WorkOrderPriority;
  supplier: string;
  estimatedAmount: number;
  estimatedDate: string;
  column: WorkOrderColumn;
  photos: string[];
  timeline: WorkOrderHistory[];
}

// ─── MANUTENÇÃO — PREVENTIVA ──────────────────────────────────────────────────
export type PreventiveStatus = 'Em dia' | 'Proximo' | 'Vencido';

export interface PreventiveMaintenance {
  id: string;
  equipment: string;
  frequency: string;
  lastDate: string;
  nextDate: string;
  supplier: string;
  status: PreventiveStatus;
}

// ─── FORNECEDORES ─────────────────────────────────────────────────────────────
export type SupplierStatus = 'ativo' | 'inativo';

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  specialty: string[];
  contact: string;
  email: string;
  phone: string;
  rating: number;
  ordersCount: number;
  status: SupplierStatus;
}

// ─── ASSEMBLEIAS ──────────────────────────────────────────────────────────────
export type AssemblyType = 'Ordinária' | 'Extraordinária';
export type AssemblyStatus = 'Futura' | 'Realizada' | 'Cancelada';

export interface AgendaItem {
  id: number;
  title: string;
  description: string;
  type: 'aprovação' | 'votação' | 'informativo';
}

export interface MinuteDeliberation {
  item: number;
  text: string;
  votesFavor: number;
  votesAgainst: number;
  votesAbstain: number;
}

export interface MinuteSignature {
  name: string;
  role: string;
  date: string;
}

export interface Minutes {
  attendeesCount: number;
  absentCount: number;
  proxiesCount: number;
  text: string;
  itemsDeliberation: MinuteDeliberation[];
  signatures: MinuteSignature[];
  isFinalized: boolean;
}

export interface Assembly {
  id: string;
  title: string;
  type: AssemblyType;
  date: string;
  time: string;
  endTime: string;
  location: string;
  quorum: string;
  status: AssemblyStatus;
  agenda: AgendaItem[];
  minutes: Minutes | null;
}

// ─── VOTAÇÕES ─────────────────────────────────────────────────────────────────
export type VotingStatus = 'Aberta' | 'Encerrada' | 'Cancelada';

export interface VotingOption {
  id: string;
  text: string;
  votesCount: number;
  fractionPercent: number;
}

export interface Voting {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: VotingStatus;
  type: 'fraction' | 'unit';
  options: VotingOption[];
  userVotes: Record<string, string>;
}

// ─── COMUNICADOS ──────────────────────────────────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  category: string;
  target: string;
  date: string;
  expires: string | null;
  pinned: boolean;
  urgent: boolean;
  views: number;
  content: string;
}

// ─── PORTARIA — VISITANTES ────────────────────────────────────────────────────
export type VisitorStatus = 'Dentro' | 'Saiu';
export type DocType = 'CPF' | 'RG' | 'CNH' | 'Passaporte';

export interface Visitor {
  id: string;
  name: string;
  docType: DocType;
  doc: string;
  unit: string;
  reason: string;
  entryTime: string;
  exitTime: string | null;
  hasVehicle: boolean;
  plate: string | null;
  model: string | null;
  color: string | null;
  photo: string | null;
  status: VisitorStatus;
}

// ─── PORTARIA — ENCOMENDAS ────────────────────────────────────────────────────
export type PackageStatus = 'Aguardando Retirada' | 'Retirado';

export interface Package {
  id: string;
  resident: string;
  unit: string;
  type: string;
  volumes: number;
  receivedAt: string;
  status: PackageStatus;
  pickedAt: string | null;
  pickedBy: string | null;
}

// ─── RESERVAS ─────────────────────────────────────────────────────────────────
export type ReservationStatus =
  | 'Confirmada'
  | 'Aguardando aprovação'
  | 'Cancelada'
  | 'Concluída';

export interface CommonArea {
  id: string;
  name: string;
  description: string;
  capacity: number;
  fee: number;
  minIntervalHours: number;
  autoApprove: boolean;
  rules: string;
  active: boolean;
  color: string;
}

export interface Reservation {
  id: string;
  areaId: string;
  areaName: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  resident: string;
  unit: string;
  status: ReservationStatus;
  fee: number;
  notes: string;
}

// ─── OCORRÊNCIAS ──────────────────────────────────────────────────────────────
export type OccurrenceStatus =
  | 'Aberta'
  | 'Em análise'
  | 'Em providência'
  | 'Resolvida'
  | 'Arquivada';
export type OccurrencePriority = 'Urgente' | 'Alta' | 'Media' | 'Baixa';
export type SLAStatus = 'ok' | 'warning' | 'danger';

export interface OccurrenceTimeline {
  date: string;
  user: string;
  text: string;
  isInternal: boolean;
}

export interface Occurrence {
  id: string;
  category: string;
  title: string;
  location: string;
  offendingUnit: string | null;
  complainingUnit: string;
  resident: string;
  date: string;
  description: string;
  priority: OccurrencePriority;
  isAnonymous: boolean;
  status: OccurrenceStatus;
  slaHoursLeft: number;
  slaStatus: SLAStatus;
  photos: string[];
  resolutionNotes?: string;
  timeline: OccurrenceTimeline[];
}

// ─── AUDITORIA ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  module: string;
  action: string;
  details: string;
  ip: string;
}

// ─── DOCUMENTOS ───────────────────────────────────────────────────────────────
export type DocumentStatus = 'Válido' | 'Vencido' | 'Arquivado';

export interface Document {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  expiresDate: string | null;
  status: DocumentStatus;
  isPublic: boolean;
  filename: string;
  size: string;
}

// ─── NOTIFICAÇÕES (IN-APP) ────────────────────────────────────────────────────
export type NotificationType = 'financial' | 'occurrence' | 'reservation' | 'system' | 'communication';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  module: string;
  read: boolean;
  createdAt: string;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── INTEGRAÇÕES ──────────────────────────────────────────────────────────────
export interface Integration {
  id: string;
  name: string;
  desc: string;
  status: string;
  key: string | null;
}

// ─── CONFIGURAÇÕES DE NOTIFICAÇÃO ─────────────────────────────────────────────
export interface NotificationSetting {
  event: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
}

// ─── PASSWORD VALIDATION ──────────────────────────────────────────────────────
export type PasswordStrength = 'fraca' | 'média' | 'forte';

export interface PasswordValidation {
  valid: boolean;
  strength: PasswordStrength;
  errors: string[];
}
