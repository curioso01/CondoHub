import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { security } from '../lib/security';
import { useToast } from '../hooks/useToast';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import {
  Plus,
  DollarSign,
  Search,
  CheckCircle,
  Copy,
  MessageCircle,
  AlertTriangle,
  Receipt,
  Download,
  Send,
  Printer,
  FileText,
  PieChart,
  List,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Check,
  Edit2
} from 'lucide-react';
import { PaymentStatus, Receivable, Payable, Fine } from '../types';

export const Financial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables' | 'statement' | 'budget' | 'fines'>('receivables');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modais de Ação
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [isPayActionModalOpen, setIsPayActionModalOpen] = useState(false);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isInadimplentesModalOpen, setIsInadimplentesModalOpen] = useState(false);
  const [isViewPayableModalOpen, setIsViewPayableModalOpen] = useState(false);
  const [isBudgetEditModalOpen, setIsBudgetEditModalOpen] = useState(false);

  // Itens Selecionados para Modais
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);

  // Formulário: Baixa Manual de Recebível
  const [payDate, setPayDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [payMethod, setPayMethod] = useState('Pix');
  const [payObs, setPayObs] = useState('');

  // Formulário: Acordo de Cobrança
  const [agreeVal, setAgreeVal] = useState('');
  const [agreeInstallments, setAgreeInstallments] = useState('1');
  const [agreeDue, setAgreeDue] = useState(() => new Date().toISOString().substring(0, 10));

  // Inadimplentes em Massa
  const [selectedInadIds, setSelectedInadIds] = useState<string[]>([]);
  const [isSendingInad, setIsSendingInad] = useState(false);

  // Form states - Novo Recebível
  const [recUnit, setRecUnit] = useState('A101');
  const [recResident, setRecResident] = useState('');
  const [recType, setRecType] = useState('Taxa Condominial Ordinária');
  const [recDue, setRecDue] = useState('2026-10-10');
  const [recAmount, setRecAmount] = useState('650.00');

  // Form states - Nova Despesa
  const [paySupplier, setPaySupplier] = useState('');
  const [payCnpj, setPayCnpj] = useState('');
  const [payCategory, setPayCategory] = useState('Manutenção');
  const [payDesc, setPayDesc] = useState('');
  const [payDue, setPayDue] = useState('2026-09-30');
  const [payAmount, setPayAmount] = useState('1200.00');
  const [payCostCenter, setPayCostCenter] = useState('Manutenção Geral');

  // Form states - Multa com Escalonamento Automático
  const [fineUnit, setFineUnit] = useState('A101');
  const [fineResident, setFineResident] = useState('');
  const [fineViolation, setFineViolation] = useState('Barulho Excessivo / Som Alto');
  const [fineLevel, setFineLevel] = useState<'1ª Advertência' | '2ª Advertência' | 'Multa'>('1ª Advertência');
  const [fineAmount, setFineAmount] = useState('0');
  const [fineDesc, setFineDesc] = useState('');

  // Orçamento Anual
  const [budgetCategories, setBudgetCategories] = useState([
    { id: 1, cat: 'Limpeza & Conservação', orc: 74400, real: 71200 },
    { id: 2, cat: 'Segurança & Monitoramento', orc: 54000, real: 54000 },
    { id: 3, cat: 'Manutenção de Elevadores', orc: 33600, real: 36800 },
    { id: 4, cat: 'Água & Esgoto Coletivo (Sabesp - Incluso na Cota)', orc: 25200, real: 23900 },
    { id: 5, cat: 'Energia Elétrica (Enel)', orc: 41400, real: 45200 },
    { id: 6, cat: 'Honorários Administradora', orc: 45600, real: 45600 },
    { id: 7, cat: 'Seguro Predial Obrigatório', orc: 22200, real: 21800 },
    { id: 8, cat: 'Manutenções Gerais & Obras', orc: 30000, real: 34500 }
  ]);

  const { success, info, warning } = useToast();

  const condo = useAppStore(state => state.condo);
  const receivables = useAppStore(state => state.receivables);
  const payables = useAppStore(state => state.payables);
  const fines = useAppStore(state => state.fines);
  const residents = useAppStore(state => state.residents);
  const suppliers = useAppStore(state => state.suppliers);
  const addReceivable = useAppStore(state => state.addReceivable);
  const updateReceivableStatus = useAppStore(state => state.updateReceivableStatus);
  const addPayable = useAppStore(state => state.addPayable);
  const updatePayableStatus = useAppStore(state => state.updatePayableStatus);
  const addFine = useAppStore(state => state.addFine);
  const updateFineStatus = useAppStore(state => state.updateFineStatus);
  const logAudit = useAppStore(state => state.logAudit);

  // Escalonamento automático de penalidade ao alterar unidade da multa
  const handleSelectFineUnit = (unit: string) => {
    setFineUnit(unit);
    const r = residents.find(res => res.unit === unit);
    if (r) setFineResident(r.name);

    // Contagem de sanções prévias da unidade para sugerir escala
    const unitFines = fines.filter(f => f.unit === unit);
    if (unitFines.length === 0) {
      setFineLevel('1ª Advertência');
      setFineAmount('0');
    } else if (unitFines.length === 1) {
      setFineLevel('2ª Advertência');
      setFineAmount('0');
    } else {
      setFineLevel('Multa');
      setFineAmount('400.00');
    }
  };

  // Filter Receivables
  const filteredReceivables = useMemo(() => {
    return receivables.filter(r => {
      const matchesSearch =
        r.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resident.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesMonth = !monthFilter || r.ref === monthFilter;
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [receivables, searchQuery, statusFilter, monthFilter]);

  // Filter Payables
  const filteredPayables = useMemo(() => {
    return payables.filter(p => {
      const matchesSearch =
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payables, searchQuery, statusFilter]);

  // Filter Fines
  const filteredFines = useMemo(() => {
    return fines.filter(f => {
      return (
        f.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.residentName || f.resident || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.violation || f.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [fines, searchQuery]);

  // Paged collections
  const pagedReceivables = filteredReceivables.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pagedPayables = filteredPayables.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Totais
  const totalReceivables = receivables.reduce((acc, r) => acc + r.amount, 0);
  const totalReceived = receivables.filter(r => r.status === 'Pago').reduce((acc, r) => acc + r.amount, 0);
  const totalPending = receivables.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + r.amount, 0);
  const totalOverdue = receivables.filter(r => r.status === 'Vencido').reduce((acc, r) => acc + r.amount, 0);

  // Extrato Consolidado
  const statementEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      date: string;
      desc: string;
      type: 'Entrada' | 'Saída';
      amount: number;
    }> = [];

    receivables
      .filter(r => r.status === 'Pago')
      .forEach(r => {
        entries.push({
          id: `rec_${r.id}`,
          date: r.paidAt || r.due,
          desc: `Recebimento Taxa - Unidade ${r.unit} (${r.resident})`,
          type: 'Entrada',
          amount: r.amount
        });
      });

    payables
      .filter(p => p.status === 'Pago')
      .forEach(p => {
        entries.push({
          id: `pay_${p.id}`,
          date: p.due,
          desc: `Pagto ${p.supplier} (${p.category})`,
          type: 'Saída',
          amount: -p.amount
        });
      });

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let runningBalance = 38500;
    return entries.map(entry => {
      runningBalance += entry.amount;
      return {
        ...entry,
        balance: runningBalance
      };
    });
  }, [receivables, payables]);

  const totalStatementIn = statementEntries
    .filter(e => e.amount > 0)
    .reduce((acc, e) => acc + e.amount, 0);

  const totalStatementOut = Math.abs(
    statementEntries
      .filter(e => e.amount < 0)
      .reduce((acc, e) => acc + e.amount, 0)
  );

  const consolidatedAccountBalance =
    statementEntries.length > 0 ? statementEntries[0].balance : 38500;

  // Handlers Recebíveis
  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(recAmount);
    if (isNaN(val) || val <= 0) {
      warning('Informe um valor numérico válido.');
      return;
    }

    const resObj = residents.find(r => r.unit === recUnit);
    const resName = recResident || (resObj ? resObj.name : `Morador ${recUnit}`);

    addReceivable({
      unit: recUnit,
      resident: resName,
      type: recType,
      ref: recDue.substring(0, 7),
      due: recDue,
      amount: val,
      status: 'Pendente',
      paidAt: null,
      method: null
    });

    success(`Boleto gerado com sucesso para a Unidade ${recUnit}!`);
    setIsReceivableModalOpen(false);
  };

  const handleOpenPayModal = (r: Receivable) => {
    setSelectedReceivable(r);
    setPayDate(new Date().toISOString().substring(0, 10));
    setPayMethod('Pix');
    setPayObs('');
    setIsPayActionModalOpen(true);
  };

  const handleConfirmManualPay = () => {
    if (!selectedReceivable) return;
    updateReceivableStatus(selectedReceivable.id, 'Pago', payMethod);
    logAudit('Baixa de Pagamento Realizada', 'Financeiro', {
      unit: selectedReceivable.unit,
      amount: selectedReceivable.amount,
      method: payMethod,
      obs: payObs
    });
    success(`Pagamento da Unidade ${selectedReceivable.unit} liquidado com sucesso!`);
    setIsPayActionModalOpen(false);
  };

  const handleOpenBoleto = (r: Receivable) => {
    setSelectedReceivable(r);
    setIsBoletoModalOpen(true);
  };

  const handleOpenAgreement = (r: Receivable) => {
    setSelectedReceivable(r);
    setAgreeVal(r.amount.toFixed(2));
    setAgreeInstallments('1');
    setAgreeDue(new Date().toISOString().substring(0, 10));
    setIsAgreementModalOpen(true);
  };

  const handleSaveAgreement = () => {
    if (!selectedReceivable) return;
    logAudit('Acordo de Cobrança Registrado', 'Financeiro', {
      unit: selectedReceivable.unit,
      originalAmount: selectedReceivable.amount,
      agreedAmount: parseFloat(agreeVal) || selectedReceivable.amount,
      installments: agreeInstallments
    });
    success(`Termo de acordo registrado com sucesso para a unidade ${selectedReceivable.unit}!`);
    setIsAgreementModalOpen(false);
  };

  const handleOpenInadimplentesModal = () => {
    const overdueList = receivables.filter(r => r.status === 'Vencido');
    setSelectedInadIds(overdueList.map(r => r.id));
    setIsInadimplentesModalOpen(true);
  };

  const handleSendMassInad = () => {
    setIsSendingInad(true);
    setTimeout(() => {
      setIsSendingInad(false);
      logAudit('Disparo de Cobrança em Massa', 'Financeiro', {
        count: selectedInadIds.length
      });
      success(`Notificações enviadas para ${selectedInadIds.length} condôminos via WhatsApp e E-mail!`);
      setIsInadimplentesModalOpen(false);
    }, 1000);
  };

  const exportReceivablesCSV = () => {
    let csv = 'ID,Unidade,Morador,Tipo,Referencia,Vencimento,Valor,Status\n';
    receivables.forEach(r => {
      csv += `"${r.id}","${r.unit}","${r.resident}","${r.type}","${r.ref}","${r.due}","${r.amount}","${r.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub_contas_receber_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    info('Arquivo CSV baixado com sucesso!');
  };

  const exportStatementCSV = () => {
    let csv = 'Data,Descricao,Tipo,Valor,SaldoAcumulado\n';
    statementEntries.forEach(e => {
      csv += `"${e.date}","${e.desc}","${e.type}","${e.amount}","${e.balance}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub_extrato_bancario_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    info('Extrato bancário baixado em CSV!');
  };

  const copyPix = (r: Receivable) => {
    const pixCopy = `00020126580014br.gov.bcb.pix0136condohub-palmeiras-${r.id}520400005303986540${r.amount.toFixed(2)}5802BR5925CondoHub Gestao Predial6009Sao Paulo62070503***6304`;
    navigator.clipboard?.writeText(pixCopy);
    info(`Código Pix Copia e Cola da Unidade ${r.unit} copiado!`);
  };

  const sendWhatsAppCob = (r: Receivable) => {
    const text = encodeURIComponent(
      `Olá ${r.resident}, lembramos que a taxa condominial da unidade ${r.unit} referente a ${r.ref} no valor de ${security.maskMoney(r.amount)} possui vencimento em ${r.due}. Utilize nossa chave Pix para pagamento.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Handlers Despesas (Contas a Pagar)
  const handleAddPayable = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(payAmount);
    if (!paySupplier || isNaN(val) || val <= 0) {
      warning('Preencha os campos obrigatórios da despesa.');
      return;
    }

    // Fluxo de alçada de aprovação por valor:
    // <= R$ 500: auto-aprovado
    // > R$ 500: requer aprovação do síndico
    let status: 'Pendente' | 'Em aprovação' = 'Pendente';
    let approvedBy: string | null = null;
    if (val <= 500) {
      status = 'Pendente';
      approvedBy = 'Síndico (Auto <= R$500)';
    } else {
      status = 'Em aprovação';
    }

    addPayable({
      supplier: paySupplier,
      cnpj: payCnpj || '00.000.000/0001-00',
      category: payCategory,
      description: payDesc || payCategory,
      due: payDue,
      amount: val,
      status: status,
      approvedBy: approvedBy,
      costCenter: payCostCenter
    });

    success(
      val <= 500
        ? 'Despesa cadastrada e auto-aprovada com sucesso!'
        : 'Despesa cadastrada e enviada para aprovação do Síndico!'
    );
    setIsPayableModalOpen(false);
  };

  const handleApprovePayable = (p: Payable) => {
    updatePayableStatus(p.id, 'Pendente', 'Carlos Mendonça (Síndico)');
    logAudit('Aprovação de Despesa', 'Financeiro', { id: p.id, supplier: p.supplier, amount: p.amount });
    success(`Despesa de ${p.supplier} aprovada para liquidação!`);
  };

  const handlePayPayable = (p: Payable) => {
    updatePayableStatus(p.id, 'Pago');
    logAudit('Liquidação de Fornecedor', 'Financeiro', { id: p.id, supplier: p.supplier, amount: p.amount });
    success(`Pagamento de ${security.maskMoney(p.amount)} para ${p.supplier} registrado!`);
  };

  const handleViewPayable = (p: Payable) => {
    setSelectedPayable(p);
    setIsViewPayableModalOpen(true);
  };

  // Handlers Multas & Advertências
  const handleAddFine = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(fineAmount) || 0;
    const resObj = residents.find(r => r.unit === fineUnit);
    const resName = fineResident || (resObj ? resObj.name : `Morador ${fineUnit}`);

    addFine({
      unit: fineUnit,
      residentName: resName,
      violation: fineViolation,
      level: fineLevel,
      amount: val,
      date: new Date().toISOString().substring(0, 10),
      status: 'Notificado',
      description: fineDesc || fineViolation
    });

    success(
      fineLevel === 'Multa'
        ? `Multa de ${security.maskMoney(val)} aplicada e lançada nas contas a receber da Unidade ${fineUnit}!`
        : `${fineLevel} registrada com sucesso para a Unidade ${fineUnit}!`
    );
    setIsFineModalOpen(false);
  };

  // Totais do Orçamento
  const totalOrcado = budgetCategories.reduce((acc, c) => acc + c.orc, 0);
  const totalRealizado = budgetCategories.reduce((acc, c) => acc + c.real, 0);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO SUPERIOR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
            Gestão Financeira
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            Arrecadação, controle de boletos, despesas, livro razão e sanções regimentais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              handleSelectFineUnit('A101');
              setIsFineModalOpen(true);
            }}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <AlertTriangle size={14} className="text-amber-500" /> Notificação / Multa
          </button>
          <button
            onClick={() => setIsPayableModalOpen(true)}
            className="btn btn-sm btn-outline flex items-center gap-1.5"
          >
            <Receipt size={14} /> Nova Despesa
          </button>
          <button
            onClick={() => setIsReceivableModalOpen(true)}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Emitir Boleto
          </button>
        </div>
      </div>

      {/* KPI RESUMO FINANCEIRO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Emitido
          </span>
          <div className="text-2xl font-black text-[var(--color-text)] mt-1">
            {security.maskMoney(totalReceivables)}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">{receivables.length} cobranças no ciclo</span>
        </div>

        <div className="stat-card">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Total Recebido
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {security.maskMoney(totalReceived)}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Liquidados via Pix/Boleto</span>
        </div>

        <div className="stat-card">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Pendente no Prazo
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {security.maskMoney(totalPending)}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Aguardando vencimento</span>
        </div>

        <div className="stat-card">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Em Atraso / Inadimplência
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {security.maskMoney(totalOverdue)}
          </div>
          <span className="text-xs text-rose-500 font-medium">Requer régua de cobrança</span>
        </div>
      </div>

      {/* NAVEGAÇÃO DE 5 ABAS */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => { setActiveTab('receivables'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'receivables'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <ArrowDownLeft size={16} /> Contas a Receber
        </button>

        <button
          onClick={() => { setActiveTab('payables'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'payables'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <ArrowUpRight size={16} /> Contas a Pagar
        </button>

        <button
          onClick={() => { setActiveTab('statement'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'statement'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <List size={16} /> Extrato Bancário
        </button>

        <button
          onClick={() => { setActiveTab('budget'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'budget'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <PieChart size={16} /> Orçamento Anual
        </button>

        <button
          onClick={() => { setActiveTab('fines'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'fines'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <AlertTriangle size={16} /> Multas & Advertências ({fines.length})
        </button>
      </div>

      {/* FILTROS E BUSCA (PARA RECEBER, PAGAR E MULTAS) */}
      {(activeTab === 'receivables' || activeTab === 'payables' || activeTab === 'fines') && (
        <div className="card p-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                className="form-control pl-9 text-xs"
                placeholder="Buscar por unidade, morador ou fornecedor..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab === 'receivables' && (
                <>
                  <select
                    className="form-control text-xs"
                    value={monthFilter}
                    onChange={e => { setMonthFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas Competências</option>
                    <option value="2026-09">2026-09 (Setembro)</option>
                    <option value="2026-08">2026-08 (Agosto)</option>
                    <option value="2026-07">2026-07 (Julho)</option>
                  </select>

                  <button
                    onClick={exportReceivablesCSV}
                    className="btn btn-sm btn-outline text-xs flex items-center gap-1 shrink-0"
                    title="Exportar CSV de Recebíveis"
                  >
                    <Download size={13} /> CSV
                  </button>

                  <button
                    onClick={handleOpenInadimplentesModal}
                    className="btn btn-sm btn-outline text-xs flex items-center gap-1 shrink-0 text-rose-600 border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Cobrar Inadimplentes em Massa"
                  >
                    <Send size={13} /> Cobrar Inadimplentes
                  </button>
                </>
              )}

              {activeTab !== 'fines' && (
                <select
                  className="form-control text-xs"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">Todos os Status</option>
                  {activeTab === 'receivables' ? (
                    <>
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Vencido">Vencido</option>
                    </>
                  ) : (
                    <>
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Em aprovação">Em aprovação</option>
                      <option value="Cancelado">Cancelado</option>
                    </>
                  )}
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 1: CONTAS A RECEBER */}
      {activeTab === 'receivables' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Morador</th>
                  <th>Tipo / Ref</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {pagedReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma cobrança encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  pagedReceivables.map(r => (
                    <tr key={r.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{r.unit}</td>
                      <td className="text-xs">{r.resident}</td>
                      <td className="text-xs">
                        <span className="font-medium text-[var(--color-text)] block">{r.type}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">Ref: {r.ref}</span>
                      </td>
                      <td className="text-xs">
                        {r.due}
                        {r.paidAt && (
                          <span className="text-[11px] text-emerald-600 block font-medium">
                            Pago em {r.paidAt} ({r.method || 'Pix'})
                          </span>
                        )}
                      </td>
                      <td className="font-bold text-sm text-[var(--color-text)]">
                        {security.maskMoney(r.amount)}
                      </td>
                      <td>
                        <Badge
                          variant={
                            r.status === 'Pago'
                              ? 'success'
                              : r.status === 'Vencido'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {r.status !== 'Pago' ? (
                            <>
                              <button
                                onClick={() => handleOpenPayModal(r)}
                                className="btn btn-sm btn-outline text-xs py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                title="Baixa manual / Marcar como Pago"
                              >
                                <CheckCircle size={13} /> Pagar
                              </button>
                              <button
                                onClick={() => handleOpenBoleto(r)}
                                className="btn btn-sm btn-outline text-xs py-1"
                                title="Visualizar e Imprimir Boleto"
                              >
                                <Printer size={13} /> Boleto
                              </button>
                              <button
                                onClick={() => handleOpenAgreement(r)}
                                className="btn btn-sm btn-outline text-xs py-1"
                                title="Registrar Acordo de Cobrança"
                              >
                                <FileText size={13} />
                              </button>
                              <button
                                onClick={() => copyPix(r)}
                                className="btn btn-sm btn-outline text-xs py-1"
                                title="Copiar Chave Pix"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => sendWhatsAppCob(r)}
                                className="btn btn-sm btn-outline text-xs py-1 text-emerald-600"
                                title="Cobrança via WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-[var(--color-text-muted)] italic flex items-center gap-1">
                                <CheckCircle size={13} className="text-emerald-500" /> Liquidado
                              </span>
                              <button
                                onClick={() => handleOpenBoleto(r)}
                                className="btn btn-sm btn-outline text-xs py-1"
                                title="Ver Comprovante / Boleto"
                              >
                                <Printer size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredReceivables.length / pageSize))}
            onPageChange={setCurrentPage}
            totalItems={filteredReceivables.length}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* ABA 2: CONTAS A PAGAR */}
      {activeTab === 'payables' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fornecedor / CNPJ</th>
                  <th>Categoria / Centro de Custo</th>
                  <th>Descrição</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagedPayables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma conta a pagar encontrada.
                    </td>
                  </tr>
                ) : (
                  pagedPayables.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold text-xs text-[var(--color-text)]">{p.supplier}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{p.cnpj}</div>
                      </td>
                      <td className="text-xs">
                        <span className="font-medium text-[var(--color-text)] block">{p.category}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{p.costCenter}</span>
                      </td>
                      <td className="text-xs text-[var(--color-text-muted)] max-w-xs truncate">
                        {p.description}
                      </td>
                      <td className="text-xs">{p.due}</td>
                      <td className="font-bold text-sm text-[var(--color-text)]">
                        {security.maskMoney(p.amount)}
                      </td>
                      <td>
                        <Badge
                          variant={
                            p.status === 'Pago'
                              ? 'success'
                              : p.status === 'Cancelado'
                              ? 'danger'
                              : p.status === 'Em aprovação'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {p.status === 'Em aprovação' && (
                            <button
                              onClick={() => handleApprovePayable(p)}
                              className="btn btn-sm btn-primary text-xs py-1"
                              title="Aprovação Síndico/Conselho"
                            >
                              <Check size={12} /> Aprovar
                            </button>
                          )}
                          {p.status === 'Pendente' && (
                            <button
                              onClick={() => handlePayPayable(p)}
                              className="btn btn-sm btn-outline text-xs py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              title="Registrar Pagamento / Quitação"
                            >
                              <CheckCircle size={12} /> Liquidar
                            </button>
                          )}
                          <button
                            onClick={() => handleViewPayable(p)}
                            className="btn btn-sm btn-outline text-xs py-1"
                            title="Ver detalhes da despesa"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredPayables.length / pageSize))}
            onPageChange={setCurrentPage}
            totalItems={filteredPayables.length}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* ABA 3: EXTRATO BANCÁRIO & LIVRO RAZÃO */}
      {activeTab === 'statement' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Total Entradas (Realizadas)
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                + {security.maskMoney(totalStatementIn)}
              </div>
            </div>

            <div className="card p-4">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Total Saídas (Pagas)
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                - {security.maskMoney(totalStatementOut)}
              </div>
            </div>

            <div className="card p-4">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Saldo Consolidado em Conta
              </span>
              <div className="text-2xl font-black text-[var(--color-primary)] mt-1">
                {security.maskMoney(consolidatedAccountBalance)}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <h3 className="card-title text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <List size={16} /> Livro Razão e Extrato Bancário em Tempo Real
              </h3>
              <button
                onClick={exportStatementCSV}
                className="btn btn-sm btn-outline text-xs flex items-center gap-1.5"
              >
                <Download size={13} /> Exportar Extrato CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição do Lançamento</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {statementEntries.map(entry => (
                    <tr key={entry.id}>
                      <td className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="text-xs font-medium text-[var(--color-text)]">
                        {entry.desc}
                      </td>
                      <td>
                        <Badge variant={entry.type === 'Entrada' ? 'success' : 'danger'}>
                          {entry.type}
                        </Badge>
                      </td>
                      <td
                        className={`text-xs font-bold ${
                          entry.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {entry.amount > 0 ? '+' : ''} {security.maskMoney(entry.amount)}
                      </td>
                      <td className="text-xs font-bold text-[var(--color-text)]">
                        {security.maskMoney(entry.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: ORÇAMENTO ANUAL */}
      {activeTab === 'budget' && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <PieChart size={16} /> Comparativo Orçado vs Realizado (Exercício 2026)
            </h3>
            <button
              onClick={() => setIsBudgetEditModalOpen(true)}
              className="btn btn-sm btn-outline text-xs flex items-center gap-1.5"
            >
              <Edit2 size={13} /> Editar Orçamento
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Centro de Custo / Categoria</th>
                  <th>Orçado Anual</th>
                  <th>Realizado Anual</th>
                  <th>Desvio R$</th>
                  <th>Desvio %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetCategories.map(c => {
                  const diff = c.real - c.orc;
                  const perc = ((diff / c.orc) * 100).toFixed(1);
                  const isOver = diff > 0;
                  return (
                    <tr
                      key={c.id}
                      className={
                        Math.abs(Number(perc)) > 10
                          ? isOver
                            ? 'bg-rose-50/50 dark:bg-rose-950/20'
                            : 'bg-emerald-50/50 dark:bg-emerald-950/20'
                          : ''
                      }
                    >
                      <td className="font-semibold text-xs text-[var(--color-text)]">{c.cat}</td>
                      <td className="text-xs">{security.maskMoney(c.orc)}</td>
                      <td className="text-xs font-bold text-[var(--color-text)]">
                        {security.maskMoney(c.real)}
                      </td>
                      <td
                        className={`text-xs font-semibold ${
                          isOver ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOver ? '+' : ''}
                        {security.maskMoney(diff)}
                      </td>
                      <td className="text-xs font-semibold">{perc}%</td>
                      <td>
                        <Badge variant={isOver ? (Number(perc) > 10 ? 'danger' : 'warning') : 'success'}>
                          {isOver ? 'Acima do Orçado' : 'Dentro do Orçado'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[var(--color-bg)] font-bold text-xs">
                  <td>TOTAIS GERAIS</td>
                  <td>{security.maskMoney(totalOrcado)}</td>
                  <td>{security.maskMoney(totalRealizado)}</td>
                  <td className={totalRealizado > totalOrcado ? 'text-rose-600' : 'text-emerald-600'}>
                    {totalRealizado > totalOrcado ? '+' : ''}
                    {security.maskMoney(totalRealizado - totalOrcado)}
                  </td>
                  <td>{(((totalRealizado - totalOrcado) / totalOrcado) * 100).toFixed(1)}%</td>
                  <td>
                    <Badge variant={totalRealizado > totalOrcado ? 'danger' : 'success'}>
                      {totalRealizado > totalOrcado ? 'Déficit Orçamentário' : 'Superávit'}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: MULTAS & ADVERTÊNCIAS */}
      {activeTab === 'fines' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Infrator / Notificado</th>
                  <th>Infração Regimental</th>
                  <th>Graduação</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Nenhuma infração registrada no regimento interno.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map(f => (
                    <tr key={f.id}>
                      <td className="font-bold text-sm text-[var(--color-text)]">{f.unit}</td>
                      <td className="text-xs">{f.residentName}</td>
                      <td className="text-xs">
                        <span className="font-semibold block text-[var(--color-text)]">{f.violation}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{f.description}</span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            f.level === 'Multa'
                              ? 'danger'
                              : f.level === '2ª Advertência'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {f.level}
                        </Badge>
                      </td>
                      <td className="font-bold text-xs">
                        {f.amount && f.amount > 0 ? security.maskMoney(f.amount) : 'Sem valor pecuniário'}
                      </td>
                      <td className="text-xs text-[var(--color-text-muted)]">{f.date}</td>
                      <td>
                        <Badge variant={f.status === 'Pago' ? 'success' : 'neutral'}>
                          {f.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {f.status !== 'Pago' && f.amount && f.amount > 0 && (
                            <button
                              onClick={() => {
                                updateFineStatus(f.id, 'Pago');
                                success('Multa liquidada com sucesso!');
                              }}
                              className="btn btn-sm btn-outline text-xs py-1 text-emerald-600"
                            >
                              Baixar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const text = encodeURIComponent(
                                `NOTIFICAÇÃO CONDOMINIAL - Residencial das Palmeiras.\nUnidade: ${f.unit}\nInfração: ${f.violation} (${f.level}).\nFavor comparecer à administração ou regularizar a conduta regimental.`
                              );
                              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                            }}
                            className="btn btn-sm btn-outline text-xs py-1 text-emerald-600"
                            title="Enviar Notificação WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </button>
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

      {/* MODAL 1: EMITIR NOVO BOLETO */}
      <Modal
        isOpen={isReceivableModalOpen}
        onClose={() => setIsReceivableModalOpen(false)}
        title="Emitir Novo Boleto de Cobrança"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsReceivableModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleAddReceivable}>
              Emitir e Notificar Morador
            </button>
          </>
        }
      >
        <form onSubmit={handleAddReceivable} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Unidade Devedora</label>
              <select
                className="form-control text-xs"
                value={recUnit}
                onChange={e => {
                  setRecUnit(e.target.value);
                  const r = residents.find(res => res.unit === e.target.value);
                  if (r) setRecResident(r.name);
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
              <label className="form-label text-xs">Nome do Morador</label>
              <input
                type="text"
                className="form-control text-xs"
                value={recResident}
                onChange={e => setRecResident(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Tipo de Cobrança</label>
            <select
              className="form-control text-xs"
              value={recType}
              onChange={e => setRecType(e.target.value)}
            >
              <option value="Taxa Condominial Ordinária">Taxa Condominial Ordinária</option>
              <option value="Fundo de Reserva">Fundo de Reserva</option>
              <option value="Taxa Extra / Obras">Taxa Extra / Obras</option>
              <option value="Taxa de Espaço Comum">Taxa de Espaço Comum</option>
              <option value="Multa Regimental">Multa Regimental</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Data de Vencimento</label>
              <input
                type="date"
                className="form-control text-xs"
                value={recDue}
                onChange={e => setRecDue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-control text-xs"
                value={recAmount}
                onChange={e => setRecAmount(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: REGISTRAR BAIXA DE PAGAMENTO */}
      <Modal
        isOpen={isPayActionModalOpen}
        onClose={() => setIsPayActionModalOpen(false)}
        title="Registrar Baixa de Pagamento"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPayActionModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleConfirmManualPay}>
              Confirmar Baixa
            </button>
          </>
        }
      >
        {selectedReceivable && (
          <div className="space-y-3.5 text-xs">
            <div className="form-group">
              <label className="form-label">Unidade / Morador</label>
              <input
                type="text"
                className="form-control"
                value={`${selectedReceivable.unit} - ${selectedReceivable.resident}`}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valor do Boleto</label>
              <input
                type="text"
                className="form-control"
                value={security.maskMoney(selectedReceivable.amount)}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Data do Pagamento</label>
                <input
                  type="date"
                  className="form-control"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Forma de Liquidação</label>
                <select
                  className="form-control"
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                >
                  <option value="Pix">Pix Instantâneo</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="TED">Transferência TED</option>
                  <option value="Dinheiro">Dinheiro em Espécie</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Observações / Autenticação Bancária</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Código de transação bancária..."
                value={payObs}
                onChange={e => setPayObs(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: 2ª VIA DE BOLETO BANCÁRIO */}
      <Modal
        isOpen={isBoletoModalOpen}
        onClose={() => setIsBoletoModalOpen(false)}
        title={`2ª Via de Boleto Bancário — Unidade ${selectedReceivable?.unit}`}
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsBoletoModalOpen(false)}>
              Fechar
            </button>
            <button className="btn btn-primary flex items-center gap-1.5" onClick={() => window.print()}>
              <Printer size={14} /> Imprimir Boleto
            </button>
          </>
        }
      >
        {selectedReceivable && (
          <div className="bg-white text-slate-900 p-4 border border-slate-300 rounded font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">{condo?.name || 'Condomínio'}</h2>
                <p className="text-[10px] text-slate-600">
                  CNPJ: {condo?.cnpj || ''} • {condo?.address || ''}, {condo?.city || ''}-{condo?.state || ''}
                </p>
              </div>
              <div className="text-right">
                <b className="text-sm font-bold text-slate-900">BANCO ITAÚ 341-7</b>
                <p className="text-[10px] text-slate-600">34191.09008 00000.123456 78900.123456 1 95000000080000</p>
              </div>
            </div>

            <div className="grid grid-cols-3 border border-slate-900">
              <div className="col-span-2 p-2 border-r border-slate-900">
                <span className="text-[10px] text-slate-500 block">Pagador</span>
                <b className="text-xs">{selectedReceivable.resident}</b> — Unidade: <b>{selectedReceivable.unit}</b>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-500 block">Vencimento</span>
                <b className="text-xs text-rose-600">{selectedReceivable.due}</b>
              </div>
            </div>

            <div className="grid grid-cols-3 border border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="text-[10px] text-slate-500 block">Descrição</span>
                <span>{selectedReceivable.type}</span>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="text-[10px] text-slate-500 block">Referência</span>
                <span>{selectedReceivable.ref}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-500 block">Valor do Documento</span>
                <b className="text-xs">{security.maskMoney(selectedReceivable.amount)}</b>
              </div>
            </div>

            <div className="border border-slate-900 p-2.5 bg-slate-50 text-[11px] leading-relaxed">
              <span className="font-bold text-[10px] block mb-1">INSTRUÇÕES DE COBRANÇA AO SACADO / CAIXA:</span>
              <p>• Cota Condominial Ordinária mensal referente à unidade {selectedReceivable.unit}.</p>
              <p className="font-semibold text-slate-900">
                • ÁGUA E ESGOTO: O consumo coletivo de água e esgoto do condomínio está 100% incluso nesta taxa condominial (sem cobrança adicional de hidrômetro individual).
              </p>
              <p>• Após o vencimento, cobrar multa de 2% e juros moratórios de 1% ao mês.</p>
            </div>

            <div className="border border-dashed border-slate-400 p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">CÓDIGO DE BARRAS FEBRABAN</p>
              <div className="text-2xl tracking-widest font-bold select-none text-slate-800">
                ||| | |||| || |||||| | |||| ||| ||||||| ||| ||
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Linha digitável: 34191.09008 00000.123456 78900.123456 1 95000000080000</p>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: REGISTRAR ACORDO */}
      <Modal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        title={`Termo de Acordo de Débito — Unidade ${selectedReceivable?.unit}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsAgreementModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSaveAgreement}>
              Salvar Acordo
            </button>
          </>
        }
      >
        {selectedReceivable && (
          <div className="space-y-3.5 text-xs">
            <p className="text-[var(--color-text-muted)]">
              Negociação de quitação de pendências da unidade <b>{selectedReceivable.unit}</b> ({selectedReceivable.resident}).
            </p>
            <div className="form-group">
              <label className="form-label">Valor Original</label>
              <input
                type="text"
                className="form-control"
                value={security.maskMoney(selectedReceivable.amount)}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valor Acordado (com juros/desconto)</label>
              <input
                type="text"
                className="form-control"
                value={agreeVal}
                onChange={e => setAgreeVal(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Parcelamento</label>
                <select
                  className="form-control"
                  value={agreeInstallments}
                  onChange={e => setAgreeInstallments(e.target.value)}
                >
                  <option value="1">1x À vista</option>
                  <option value="2">2x Mensais</option>
                  <option value="3">3x Mensais</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">1º Vencimento</label>
                <input
                  type="date"
                  className="form-control"
                  value={agreeDue}
                  onChange={e => setAgreeDue(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 5: COBRANÇA EM MASSA DE INADIMPLENTES */}
      <Modal
        isOpen={isInadimplentesModalOpen}
        onClose={() => setIsInadimplentesModalOpen(false)}
        title="Régua de Cobrança em Massa"
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsInadimplentesModalOpen(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-danger flex items-center gap-1.5"
              onClick={handleSendMassInad}
              disabled={isSendingInad || selectedInadIds.length === 0}
            >
              <Send size={14} />
              {isSendingInad ? 'Disparando...' : `Disparar Cobrança (${selectedInadIds.length})`}
            </button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
            <span className="font-semibold block">Total em Atraso Selecionado:</span>
            <span className="text-lg font-black text-rose-600 block mt-0.5">
              {security.maskMoney(
                receivables
                  .filter(r => selectedInadIds.includes(r.id))
                  .reduce((acc, r) => acc + r.amount, 0)
              )}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {selectedInadIds.length} cobrança(s) selecionada(s) para régua automática via WhatsApp e E-mail.
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto border border-[var(--color-border)] rounded-lg">
            <table className="table text-xs">
              <thead>
                <tr>
                  <th style={{ width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedInadIds.length > 0 &&
                        selectedInadIds.length === receivables.filter(r => r.status === 'Vencido').length
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedInadIds(receivables.filter(r => r.status === 'Vencido').map(r => r.id));
                        } else {
                          setSelectedInadIds([]);
                        }
                      }}
                    />
                  </th>
                  <th>Unidade</th>
                  <th>Morador</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {receivables
                  .filter(r => r.status === 'Vencido')
                  .map(r => (
                    <tr key={r.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedInadIds.includes(r.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedInadIds(prev => [...prev, r.id]);
                            } else {
                              setSelectedInadIds(prev => prev.filter(id => id !== r.id));
                            }
                          }}
                        />
                      </td>
                      <td className="font-bold">{r.unit}</td>
                      <td>{r.resident}</td>
                      <td>{r.due}</td>
                      <td className="font-semibold">{security.maskMoney(r.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: CADASTRAR NOVA DESPESA */}
      <Modal
        isOpen={isPayableModalOpen}
        onClose={() => setIsPayableModalOpen(false)}
        title="Cadastrar Nova Conta a Pagar"
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPayableModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleAddPayable}>
              Salvar Despesa
            </button>
          </>
        }
      >
        <form onSubmit={handleAddPayable} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Fornecedor / Razão Social</label>
              <input
                type="text"
                className="form-control text-xs"
                list="suppliers-list"
                value={paySupplier}
                onChange={e => setPaySupplier(e.target.value)}
                placeholder="Ex: Elevadores Atlas Schindler"
                required
              />
              <datalist id="suppliers-list">
                {suppliers.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">CNPJ do Fornecedor</label>
              <input
                type="text"
                className="form-control text-xs"
                value={payCnpj}
                onChange={e => setPayCnpj(security.maskCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Categoria</label>
              <select
                className="form-control text-xs"
                value={payCategory}
                onChange={e => setPayCategory(e.target.value)}
              >
                <option value="Manutenção">Manutenção</option>
                <option value="Segurança">Segurança</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Administração">Administração</option>
                <option value="Jurídico">Jurídico</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Centro de Custo</label>
              <select
                className="form-control text-xs"
                value={payCostCenter}
                onChange={e => setPayCostCenter(e.target.value)}
              >
                <option value="Manutenção Geral">Manutenção Geral</option>
                <option value="Segurança">Segurança</option>
                <option value="Limpeza & Conservação">Limpeza & Conservação</option>
                <option value="Administração">Administração</option>
                <option value="Utilidades">Utilidades (Água / Luz)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Descrição Detalhada do Serviço</label>
            <input
              type="text"
              className="form-control text-xs"
              value={payDesc}
              onChange={e => setPayDesc(e.target.value)}
              placeholder="Ex: NF 1042 - Manutenção preventiva mensal dos elevadores"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Data de Vencimento</label>
              <input
                type="date"
                className="form-control text-xs"
                value={payDue}
                onChange={e => setPayDue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-control text-xs"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
            <span className="font-semibold block text-[var(--color-text)]">Regra de Alçada de Aprovação:</span>
            <span>
              Valores até R$ 500,00 são auto-aprovados para pagamento. Valores superiores a R$ 500,00 entram em fila de autorização pelo Síndico.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL 7: DETALHES DA CONTA A PAGAR */}
      <Modal
        isOpen={isViewPayableModalOpen}
        onClose={() => setIsViewPayableModalOpen(false)}
        title="Detalhes da Conta a Pagar"
        footer={
          <button className="btn btn-primary" onClick={() => setIsViewPayableModalOpen(false)}>
            Fechar
          </button>
        }
      >
        {selectedPayable && (
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[var(--color-text-muted)] block">Fornecedor:</span>
                <b className="text-sm">{selectedPayable.supplier}</b>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">CNPJ / CPF:</span>
                <b>{selectedPayable.cnpj}</b>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[var(--color-text-muted)] block">Categoria:</span>
                <span>{selectedPayable.category}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Centro de Custo:</span>
                <span>{selectedPayable.costCenter}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[var(--color-text-muted)] block">Vencimento:</span>
                <span>{selectedPayable.due}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Valor:</span>
                <b className="text-sm text-[var(--color-primary)]">
                  {security.maskMoney(selectedPayable.amount)}
                </b>
              </div>
            </div>

            <div>
              <span className="text-[var(--color-text-muted)] block">Aprovado Por:</span>
              <span className="font-medium text-emerald-600">
                {selectedPayable.approvedBy || 'Pendente de aprovação formal'}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block mb-0.5">Descrição:</span>
              <p className="text-[var(--color-text)] leading-relaxed">{selectedPayable.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 8: APLICAR NOTIFICAÇÃO / MULTA REGIMENTAL */}
      <Modal
        isOpen={isFineModalOpen}
        onClose={() => setIsFineModalOpen(false)}
        title="Aplicar Notificação / Multa Regimental"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsFineModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={handleAddFine}>
              Registrar Sanção
            </button>
          </>
        }
      >
        <form onSubmit={handleAddFine} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Unidade Infratora</label>
              <select
                className="form-control text-xs"
                value={fineUnit}
                onChange={e => handleSelectFineUnit(e.target.value)}
              >
                {residents.map(res => (
                  <option key={res.id} value={res.unit}>
                    {res.unit} - {res.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Graduação da Sanção</label>
              <select
                className="form-control text-xs"
                value={fineLevel}
                onChange={e => {
                  const val = e.target.value as '1ª Advertência' | '2ª Advertência' | 'Multa';
                  setFineLevel(val);
                  if (val === 'Multa') setFineAmount('400.00');
                  else setFineAmount('0');
                }}
              >
                <option value="1ª Advertência">1ª Advertência Formal (R$ 0,00)</option>
                <option value="2ª Advertência">2ª Advertência / Reincidência (R$ 0,00)</option>
                <option value="Multa">Multa Pecuniária (R$)</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300">
            <span>
              💡 <b>Escalonamento Regimental:</b> Esta unidade possui{' '}
              <b>{fines.filter(f => f.unit === fineUnit).length} infração(ões) prévia(s)</b> registrada(s). O sistema pré-selecionou a graduação correspondente. Ao aplicar Multa, a taxa é automaticamente integrada ao módulo de Contas a Receber.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Tipo de Infração Regimental</label>
            <select
              className="form-control text-xs"
              value={fineViolation}
              onChange={e => setFineViolation(e.target.value)}
            >
              <option value="Barulho Excessivo / Lei do Silêncio">Barulho Excessivo / Lei do Silêncio</option>
              <option value="Vaga de Garagem Bloqueada / Estacionamento Indevido">Vaga de Garagem Bloqueada</option>
              <option value="Animal sem Guia / Sujeira nas Áreas Comuns">Animal sem Guia / Sujeira em Área Comum</option>
              <option value="Descarte Irregular de Entulho">Descarte Irregular de Entulho / Lixo</option>
              <option value="Uso Indevido de Área Comum">Uso Indevido de Área Comum</option>
            </select>
          </div>

          {fineLevel === 'Multa' && (
            <div className="form-group">
              <label className="form-label text-xs">Valor da Multa (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-control text-xs"
                value={fineAmount}
                onChange={e => setFineAmount(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label text-xs">Detalhamento dos Fatos</label>
            <textarea
              className="form-control text-xs"
              rows={3}
              placeholder="Descreva a ocorrência que motivou a aplicação da penalidade regimental..."
              value={fineDesc}
              onChange={e => setFineDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 9: EDITAR ORÇAMENTO ANUAL */}
      <Modal
        isOpen={isBudgetEditModalOpen}
        onClose={() => setIsBudgetEditModalOpen(false)}
        title="Edição das Previsões Orçamentárias (2026)"
        size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsBudgetEditModalOpen(false)}>
              Fechar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                logAudit('Revisão Orçamentária Anual', 'Financeiro', { totalOrcado });
                success('Orçamento anual atualizado com sucesso!');
                setIsBudgetEditModalOpen(false);
              }}
            >
              Salvar Alterações
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[var(--color-text-muted)]">
            Ajuste a dotação orçamentária anual prevista para cada centro de custo aprovado em assembleia geral:
          </p>
          <div className="divide-y divide-[var(--color-border)] max-h-80 overflow-y-auto pr-1">
            {budgetCategories.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                <span className="font-semibold text-xs text-[var(--color-text)] flex-1">{item.cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--color-text-muted)]">Orçado (R$):</span>
                  <input
                    type="number"
                    step="100"
                    className="form-control text-xs w-28 text-right"
                    value={item.orc}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setBudgetCategories(prev =>
                        prev.map(c => (c.id === item.id ? { ...c, orc: val } : c))
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
