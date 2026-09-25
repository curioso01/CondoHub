import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { security } from '../lib/security';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Home,
  QrCode,
  Package,
  Calendar,
  AlertTriangle,
  FileText,
  Copy,
  CheckCircle2,
  Users,
  Clock,
  Send,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Receivable } from '../types';

export const Portal: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const userUnit = user?.unitId || 'A101';

  // Stores
  const receivables = useAppStore(state => state.receivables).filter(b => b.unit === userUnit);
  const packages = useAppStore(state => state.packages).filter(p => p.unit === userUnit && p.status === 'Aguardando Retirada');
  const reservations = useAppStore(state => state.reservations).filter(r => r.unit === userUnit);
  const occurrences = useAppStore(state => state.occurrences).filter(o => o.complainingUnit === userUnit);
  const announcements = useAppStore(state => state.announcements).slice(0, 3);
  const addVisitor = useAppStore(state => state.addVisitor);

  // Modal pré-autorização de visitante
  const [isPreAuthModalOpen, setIsPreAuthModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestDoc, setGuestDoc] = useState('');
  const [guestDate, setGuestDate] = useState(new Date().toISOString().substring(0, 10));

  // Modal boleto PIX
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);

  const handlePreAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) return;

    addVisitor({
      name: guestName,
      document: guestDoc || 'Apresentará na portaria',
      destinationUnit: userUnit,
      unit: userUnit,
      reason: 'Visita Autorizada via App',
      entryTime: `Previsto: ${guestDate}`
    });

    success(`Visitante ${guestName} pré-autorizado na portaria!`);
    setIsPreAuthModalOpen(false);
    setGuestName('');
    setGuestDoc('');
  };

  const copyPixCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Código PIX Copia e Cola copiado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE BOAS-VINDAS */}
      <div className="card p-6 bg-gradient-to-r from-[var(--color-primary)] to-emerald-700 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Espaço Exclusivo do Morador
          </span>
          <h2 className="text-2xl font-black mt-1">
            Olá, {user?.name || 'Condômino'}!
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Você está gerenciando a <b>Unidade {userUnit}</b> • Residencial das Palmeiras
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreAuthModalOpen(true)}
            className="btn btn-sm bg-white text-[var(--color-primary)] hover:bg-emerald-50 border-0 font-bold text-xs flex items-center gap-1.5"
          >
            <QrCode size={14} /> Liberar Visitante
          </button>
          <button
            onClick={() => navigate('/reservations')}
            className="btn btn-sm bg-emerald-800/40 text-white hover:bg-emerald-800/60 border border-white/20 font-bold text-xs flex items-center gap-1.5"
          >
            <Calendar size={14} /> Reservar Lazer
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ENCOMENDAS */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold">Encomendas na Portaria</span>
            <Package size={18} className="text-[var(--color-primary)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text)]">
            {packages.length}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {packages.length > 0
              ? 'Volumes disponíveis para retirada no locker'
              : 'Nenhuma encomenda pendente'}
          </p>
        </div>

        {/* BOLETOS PENDENTES */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold">Boletos em Aberto</span>
            <FileText size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            {receivables.filter(b => b.status === 'Pendente' || b.status === 'Vencido').length}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Taxa condominial do mês vigente
          </p>
        </div>

        {/* MINHAS RESERVAS */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold">Espaços Agendados</span>
            <Calendar size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-500">
            {reservations.filter(r => r.status === 'Confirmada').length}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Reservas ativas de lazer
          </p>
        </div>

        {/* OCORRÊNCIAS MINHAS */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold">Ocorrências Abertas</span>
            <AlertTriangle size={18} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-500">
            {occurrences.filter(o => o.status !== 'Resolvida').length}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Chamados em acompanhamento
          </p>
        </div>
      </div>

      {/* BOLETOS E ENCOMENDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BOLETOS DA UNIDADE */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-primary)]" />
              Taxas Condominiais & Boletos
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Unidade {userUnit}</span>
          </div>

          <div className="space-y-3">
            {receivables.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                Nenhum boleto lançado para sua unidade.
              </div>
            ) : (
              receivables.map(b => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-[var(--color-text)]">
                      {security.maskMoney(b.amount)}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {b.type} • Vencimento: {b.due}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'Pago' ? 'success' : 'warning'}>
                      {b.status}
                    </Badge>

                    {b.status !== 'Pago' && (
                      <button
                        onClick={() => setSelectedReceivable(b)}
                        className="btn btn-sm btn-primary text-xs py-1"
                      >
                        Pagar PIX
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ENCOMENDAS AGUARDANDO RETIRADA */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Package size={16} className="text-[var(--color-primary)]" />
              Encomendas na Portaria
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Locker Digital</span>
          </div>

          <div className="space-y-3">
            {packages.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1 opacity-70" />
                Nenhum pacote aguardando retirada. Você está em dia!
              </div>
            ) : (
              packages.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-500/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--color-text)]">
                      {p.type} ({p.volumes} volumes)
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      Chegou em {p.receivedAt}
                    </div>
                  </div>

                  <Badge variant="warning">Aguardando Retirada</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AVISOS DO CONDOMÍNIO RECENTES */}
      <div className="card p-5 space-y-3">
        <h3 className="font-bold text-base text-[var(--color-text)]">
          Últimos Comunicados da Administração
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.map(a => (
            <div
              key={a.id}
              className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <Badge variant="neutral">{a.category}</Badge>
                <span className="text-[var(--color-text-muted)]">{a.date}</span>
              </div>
              <h4 className="font-bold text-[var(--color-text)] line-clamp-1">{a.title}</h4>
              <p className="text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PRÉ-AUTORIZAÇÃO DE VISITANTE */}
      <Modal
        isOpen={isPreAuthModalOpen}
        onClose={() => setIsPreAuthModalOpen(false)}
        title="Liberar Visitante Antecipadamente"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPreAuthModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handlePreAuthorize}>
              Enviar Autorização para Portaria
            </button>
          </>
        }
      >
        <form onSubmit={handlePreAuthorize} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Nome Completo do Visitante ou Prestador</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Mariana Rodrigues"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Documento (opcional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="RG ou CPF"
                value={guestDoc}
                onChange={e => setGuestDoc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data Prevista da Visita</label>
              <input
                type="date"
                className="form-control"
                value={guestDate}
                onChange={e => setGuestDate(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL PIX DO BOLETO */}
      {selectedReceivable && (
        <Modal
          isOpen={!!selectedReceivable}
          onClose={() => setSelectedReceivable(null)}
          title="Pagamento Instantâneo via PIX"
          size="sm"
          footer={
            <button className="btn btn-primary w-full" onClick={() => setSelectedReceivable(null)}>
              Fechar
            </button>
          }
        >
          <div className="text-center space-y-4 text-xs">
            <div className="p-4 bg-white rounded-xl inline-block border border-[var(--color-border)] shadow-xs">
              <div className="w-40 h-40 bg-zinc-900 flex items-center justify-center text-white text-center p-2 rounded text-[11px] font-mono">
                [QR CODE PIX DINÂMICO CONDOMÍNIO]
              </div>
            </div>

            <div>
              <span className="text-[var(--color-text-muted)] block">Valor da Quota:</span>
              <div className="text-xl font-black text-emerald-600">
                {security.maskMoney(selectedReceivable.amount)}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Vencimento: {selectedReceivable.due}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--color-bg)] rounded-lg text-left">
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold block mb-1">
                Linha Digitável / Copia e Cola:
              </span>
              <div className="text-[11px] font-mono text-[var(--color-text)] break-all select-all">
                00190.00009 01234.567890 12345.678901 2 98760000050000
              </div>
            </div>

            <button
              onClick={() => copyPixCode('00190000090123456789012345678901298760000050000')}
              className="btn btn-outline w-full flex items-center justify-center gap-1.5 text-xs"
            >
              <Copy size={13} /> Copiar Código PIX
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Portal;
