export type UserRole = 'SUPER_ADMIN' | 'SINDICO' | 'CONSELHEIRO' | 'MORADOR' | 'PORTEIRO';
export type PaymentStatus = 'Pago' | 'Pendente' | 'Vencido' | 'Negociando';
export type OccurrenceStatus = 'Aberta' | 'Em análise' | 'Em providência' | 'Resolvida' | 'Arquivada';
export type WorkOrderStatus = 'Aberta' | 'Em Análise' | 'Aprovada' | 'Em Execução' | 'Concluída' | 'Cancelada';
export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type ReservationStatus = 'Confirmada' | 'Aguardando aprovação' | 'Cancelada' | 'Concluída';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  condoId: string;
  unitId?: string;
}

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

export interface Vehicle {
  plate: string;
  model: string;
  color: string;
  spot: string;
}

export interface Resident {
  id: string;
  name: string;
  cpf: string;
  unit: string;
  block: string;
  type: 'proprietario' | 'inquilino';
  phone: string;
  email: string;
  vehicles: Vehicle[];
  status: 'ativo' | 'inadimplente';
}

export interface Receivable {
  id: string;
  unit: string;
  resident: string;
  type: string;
  ref: string;
  due: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  method: string | null;
}

export interface Payable {
  id: string;
  supplier: string;
  cnpj: string;
  category: string;
  description: string;
  due: string;
  amount: number;
  status: 'Pendente' | 'Pago' | 'Em aprovação' | 'Cancelado';
  approvedBy: string | null;
  costCenter: string;
}

export interface OccurrenceTimeline {
  date: string;
  user: string;
  text: string;
  isInternal?: boolean;
}

export interface Occurrence {
  id: string;
  createdBy?: string;
  anonymous?: boolean;
  isAnonymous?: boolean;
  category: string;
  title?: string;
  description: string;
  dateOccurred?: string;
  date?: string;
  unitOffender?: string;
  offendingUnit?: string | null;
  complainingUnit?: string;
  resident?: string;
  location?: string;
  priority: Priority;
  status: OccurrenceStatus;
  resolution?: string;
  resolutionNotes?: string;
  createdAt?: string;
  slaHoursLeft?: number;
  slaStatus?: 'ok' | 'warning' | 'expired';
  photos?: string[];
  timeline?: OccurrenceTimeline[];
}

export interface Reservation {
  id: string;
  createdBy?: string;
  createdByName?: string;
  resident?: string;
  unit?: string;
  areaId?: string;
  areaName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeSlot?: string;
  guests?: number;
  guestsCount?: number;
  status: ReservationStatus;
  fee: number;
  notes?: string;
}

export interface WorkOrderHistory {
  date: string;
  user: string;
  status?: string;
  note?: string;
}

export interface WorkOrder {
  id: string;
  number?: string;
  area: string;
  title: string;
  description?: string;
  priority: Priority;
  status?: WorkOrderStatus;
  column?: string;
  supplier?: string;
  estimatedValue?: number;
  estimatedAmount?: number;
  estimatedDate?: string;
  createdAt?: string;
  history?: WorkOrderHistory[];
  timeline?: WorkOrderHistory[];
  photos?: string[];
}

export interface Announcement {
  id: string;
  createdBy?: string;
  title: string;
  content: string;
  category: 'Informativo' | 'Urgente' | 'Regulamento' | 'Convocação' | 'Manutenção';
  recipients?: string;
  target?: string;
  pinned: boolean;
  published?: boolean;
  urgent?: boolean;
  views?: number;
  date?: string;
  expiresAt?: string;
  expires?: string | null;
  createdAt?: string;
}

export interface Visitor {
  id: string;
  registeredBy?: string;
  name: string;
  document?: string;
  doc?: string;
  docType?: string;
  destinationUnit?: string;
  unit?: string;
  reason: string;
  hasVehicle?: boolean;
  vehiclePlate?: string;
  plate?: string | null;
  model?: string | null;
  color?: string | null;
  enteredAt?: string;
  entryTime?: string;
  leftAt?: string;
  exitTime?: string | null;
  status?: 'Dentro' | 'Saiu';
}

export interface PackageItem {
  id: string;
  resident: string;
  unit: string;
  type: string;
  volumes: number;
  receivedAt: string;
  status: 'Aguardando Retirada' | 'Retirado';
  pickedAt: string | null;
  pickedBy: string | null;
}

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

export interface AssemblyAgendaItem {
  id: number;
  title: string;
  description: string;
  type: string;
}

export interface AssemblyMinutesItem {
  item: number;
  text: string;
  votesFavor: number;
  votesAgainst: number;
  votesAbstain: number;
}

export interface AssemblySignature {
  name: string;
  role: string;
  date: string;
}

export interface AssemblyMinutes {
  attendeesCount: number;
  absentCount: number;
  proxiesCount: number;
  text: string;
  itemsDeliberation: AssemblyMinutesItem[];
  signatures: AssemblySignature[];
  isFinalized: boolean;
}

export interface Assembly {
  id: string;
  title: string;
  type: 'Ordinária' | 'Extraordinária';
  date: string;
  time: string;
  endTime?: string;
  location: string;
  quorum: string;
  status: 'Realizada' | 'Futura' | 'Cancelada';
  agenda: AssemblyAgendaItem[];
  minutes: AssemblyMinutes | null;
}

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
  status: 'Aberta' | 'Encerrada';
  type: 'fraction' | 'unit';
  options: VotingOption[];
  userVotes: Record<string, string>;
}

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
  status: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  expiresDate: string | null;
  status: string;
  isPublic: boolean;
  filename: string;
  size: string;
}

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
  status: 'ativo' | 'inativo';
}

export interface AuditLog {
  id: string;
  timestamp?: string;
  userId: string;
  userName: string;
  role?: string;
  action: string;
  module: string;
  details: Record<string, unknown> | string;
  ip?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  type: 'financial' | 'occurrence' | 'reservation' | 'maintenance' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  module: string;
  createdAt: string;
}

export interface FinancialMonth {
  month: string;
  revenue: number;
  expenses: number;
  balance: number;
}

export interface Fine {
  id: string;
  unit: string;
  residentName: string;
  violation: string;
  level: '1ª Advertência' | '2ª Advertência' | 'Multa';
  amount?: number;
  date: string;
  status: 'Notificado' | 'Recorrido' | 'Confirmado' | 'Pago';
  description: string;
  createdAt?: string;
}

export interface PreventiveMaintenance {
  id: string;
  equipment: string;
  frequency: string;
  lastDate: string;
  nextDate: string;
  supplier: string;
  status: 'Em dia' | 'Proximo' | 'Vencido';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
