// DADOS MOCK E SEED DO CONDOHUB
window.CondoSeed = {
  condo: {
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
  },

  residents: [
    { id: 'r1', name: 'Ana Paula Ramos', cpf: '123.456.789-09', unit: 'A101', block: 'A', type: 'proprietario', phone: '(11) 98765-4321', email: 'morador@condohub.com', vehicles: [{ plate: 'ABC-1234', model: 'Honda Civic', color: 'Prata', spot: '01' }], status: 'ativo' },
    { id: 'r2', name: 'Carlos Mendonça', cpf: '234.567.890-12', unit: 'B204', block: 'B', type: 'proprietario', phone: '(11) 99123-4567', email: 'sindico@condohub.com', vehicles: [{ plate: 'BRA-2E19', model: 'Toyota Corolla', color: 'Preto', spot: '14' }], status: 'ativo' },
    { id: 'r3', name: 'Marcos Vinicius Souza', cpf: '345.678.901-23', unit: 'A102', block: 'A', type: 'inquilino', phone: '(11) 97111-2233', email: 'marcos.souza@gmail.com', vehicles: [{ plate: 'XYZ-9876', model: 'VW Golf', color: 'Branco', spot: '02' }], status: 'ativo' },
    { id: 'r4', name: 'Juliana Castro Alencar', cpf: '456.789.012-34', unit: 'A201', block: 'A', type: 'proprietario', phone: '(11) 98222-3344', email: 'juliana.castro@outlook.com', vehicles: [{ plate: 'KLE-5544', model: 'Jeep Compass', color: 'Cinza', spot: '03' }], status: 'ativo' },
    { id: 'r5', name: 'Fernando Henrique Lima', cpf: '567.890.123-45', unit: 'A202', block: 'A', type: 'proprietario', phone: '(11) 98333-4455', email: 'fernando.lima@uol.com.br', vehicles: [{ plate: 'RTY-3322', model: 'Hyundai HB20', color: 'Vermelho', spot: '04' }], status: 'inadimplente' },
    { id: 'r6', name: 'Mariana Duarte Costa', cpf: '678.901.234-56', unit: 'A301', block: 'A', type: 'inquilino', phone: '(11) 98444-5566', email: 'mariana.costa@gmail.com', vehicles: [], status: 'ativo' },
    { id: 'r7', name: 'Rodrigo Albuquerque', cpf: '789.012.345-67', unit: 'A302', block: 'A', type: 'proprietario', phone: '(11) 98555-6677', email: 'rodrigo.alb@terra.com.br', vehicles: [{ plate: 'FGH-4411', model: 'Chevrolet Onix', color: 'Azul', spot: '05' }], status: 'ativo' },
    { id: 'r8', name: 'Beatriz Martins Fonseca', cpf: '890.123.456-78', unit: 'B101', block: 'B', type: 'proprietario', phone: '(11) 98666-7788', email: 'beatriz.fonseca@gmail.com', vehicles: [{ plate: 'MNO-7788', model: 'Nissan Kicks', color: 'Branco', spot: '11' }], status: 'ativo' },
    { id: 'r9', name: 'Lucas Gabriel Pereira', cpf: '901.234.567-89', unit: 'B102', block: 'B', type: 'inquilino', phone: '(11) 98777-8899', email: 'lucas.pereira@hotmail.com', vehicles: [{ plate: 'PQR-9900', model: 'Fiat Pulse', color: 'Cinza', spot: '12' }], status: 'inadimplente' },
    { id: 'r10', name: 'Camila Rossi Ferreira', cpf: '012.345.678-90', unit: 'B201', block: 'B', type: 'proprietario', phone: '(11) 98888-9900', email: 'camila.rossi@gmail.com', vehicles: [{ plate: 'UVX-1122', model: 'Renault Duster', color: 'Verde', spot: '13' }], status: 'ativo' },
    { id: 'r11', name: 'Eduardo Silveira Santos', cpf: '112.233.445-56', unit: 'C101', block: 'C', type: 'proprietario', phone: '(11) 97999-0011', email: 'eduardo.santos@gmail.com', vehicles: [{ plate: 'ABC-5678', model: 'Toyota Yaris', color: 'Prata', spot: '21' }], status: 'ativo' },
    { id: 'r12', name: 'Patricia Antunes Gomes', cpf: '223.344.556-67', unit: 'C102', block: 'C', type: 'inquilino', phone: '(11) 97888-1122', email: 'patricia.antunes@yahoo.com', vehicles: [], status: 'ativo' },
    { id: 'r13', name: 'Marcelo Barbosa Prado', cpf: '334.455.667-78', unit: 'C201', block: 'C', type: 'proprietario', phone: '(11) 97777-2233', email: 'marcelo.prado@gmail.com', vehicles: [{ plate: 'DEF-3456', model: 'Ford Ecosport', color: 'Preto', spot: '22' }], status: 'ativo' },
    { id: 'r14', name: 'Gabriela Meireles Dias', cpf: '445.566.778-89', unit: 'C202', block: 'C', type: 'proprietario', phone: '(11) 97666-3344', email: 'gabriela.dias@gmail.com', vehicles: [{ plate: 'GHI-7890', model: 'Peugeot 208', color: 'Branco', spot: '23' }], status: 'inadimplente' },
    { id: 'r15', name: 'Thiago Faria Monteiro', cpf: '556.677.889-90', unit: 'D101', block: 'D', type: 'proprietario', phone: '(11) 97555-4455', email: 'thiago.monteiro@uol.com.br', vehicles: [{ plate: 'JKL-1234', model: 'BMW 320i', color: 'Preto', spot: '31' }], status: 'ativo' },
    { id: 'r16', name: 'Larissa Vasconcelos', cpf: '667.788.990-01', unit: 'D102', block: 'D', type: 'inquilino', phone: '(11) 97444-5566', email: 'larissa.v@gmail.com', vehicles: [{ plate: 'MNO-5678', model: 'Honda HR-V', color: 'Cinza', spot: '32' }], status: 'ativo' },
    { id: 'r17', name: 'Renato Guimarães', cpf: '778.899.001-12', unit: 'D201', block: 'D', type: 'proprietario', phone: '(11) 97333-6677', email: 'renato.g@gmail.com', vehicles: [{ plate: 'PQR-9012', model: 'Audi Q3', color: 'Branco', spot: '33' }], status: 'ativo' },
    { id: 'r18', name: 'Helena Carvalho Ribeiro', cpf: '889.900.112-23', unit: 'D202', block: 'D', type: 'proprietario', phone: '(11) 97222-7788', email: 'helena.ribeiro@terra.com.br', vehicles: [{ plate: 'STU-3456', model: 'Volvo XC40', color: 'Prata', spot: '34' }], status: 'ativo' },
    { id: 'r19', name: 'Gustavo Henrique Borges', cpf: '990.011.223-34', unit: 'B301', block: 'B', type: 'inquilino', phone: '(11) 97111-8899', email: 'gustavo.borges@gmail.com', vehicles: [], status: 'ativo' },
    { id: 'r20', name: 'Vanessa Pires Moreira', cpf: '001.122.334-45', unit: 'C301', block: 'C', type: 'proprietario', phone: '(11) 97000-9900', email: 'vanessa.pires@gmail.com', vehicles: [{ plate: 'VWX-7890', model: 'Chery Tiggo 5x', color: 'Azul', spot: '24' }], status: 'ativo' }
  ],

  financial_months: [
    { month: '2026-01', revenue: 38400, expenses: 31200, balance: 7200 },
    { month: '2026-02', revenue: 37800, expenses: 29800, balance: 8000 },
    { month: '2026-03', revenue: 38400, expenses: 34500, balance: 3900 },
    { month: '2026-04', revenue: 39200, expenses: 32100, balance: 7100 },
    { month: '2026-05', revenue: 38400, expenses: 30400, balance: 8000 },
    { month: '2026-06', revenue: 37600, expenses: 33800, balance: 3800 },
    { month: '2026-07', revenue: 38400, expenses: 31900, balance: 6500 },
    { month: '2026-08', revenue: 38400, expenses: 29500, balance: 8900 },
    { month: '2026-09', revenue: 39000, expenses: 32700, balance: 6300 },
    { month: '2026-10', revenue: 38400, expenses: 35200, balance: 3200 },
    { month: '2026-11', revenue: 38400, expenses: 30900, balance: 7500 },
    { month: '2026-12', revenue: 39600, expenses: 33400, balance: 6200 }
  ],

  receivables: [
    { id: 'rcv1', unit: 'A101', resident: 'Ana Paula Ramos', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-08', method: 'Pix' },
    { id: 'rcv2', unit: 'B204', resident: 'Carlos Mendonça', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-09', method: 'Boleto' },
    { id: 'rcv3', unit: 'A102', resident: 'Marcos Vinicius Souza', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-10', method: 'Pix' },
    { id: 'rcv4', unit: 'A201', resident: 'Juliana Castro Alencar', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-07', method: 'Pix' },
    { id: 'rcv5', unit: 'A202', resident: 'Fernando Henrique Lima', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Vencido', paidAt: null, method: null },
    { id: 'rcv6', unit: 'A202', resident: 'Fernando Henrique Lima', type: 'Taxa Condominial', ref: '2026-08', due: '2026-08-10', amount: 800, status: 'Vencido', paidAt: null, method: null },
    { id: 'rcv7', unit: 'A301', resident: 'Mariana Duarte Costa', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-10', method: 'Boleto' },
    { id: 'rcv8', unit: 'A302', resident: 'Rodrigo Albuquerque', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-05', method: 'Pix' },
    { id: 'rcv9', unit: 'B101', resident: 'Beatriz Martins Fonseca', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-09', method: 'Pix' },
    { id: 'rcv10', unit: 'B102', resident: 'Lucas Gabriel Pereira', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Vencido', paidAt: null, method: null },
    { id: 'rcv11', unit: 'B201', resident: 'Camila Rossi Ferreira', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-10', method: 'Pix' },
    { id: 'rcv12', unit: 'C101', resident: 'Eduardo Silveira Santos', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-08', method: 'TED' },
    { id: 'rcv13', unit: 'C102', resident: 'Patricia Antunes Gomes', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-10', method: 'Boleto' },
    { id: 'rcv14', unit: 'C201', resident: 'Marcelo Barbosa Prado', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-09', method: 'Pix' },
    { id: 'rcv15', unit: 'C202', resident: 'Gabriela Meireles Dias', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Vencido', paidAt: null, method: null },
    { id: 'rcv16', unit: 'D101', resident: 'Thiago Faria Monteiro', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-04', method: 'Pix' },
    { id: 'rcv17', unit: 'D102', resident: 'Larissa Vasconcelos', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-08', method: 'Boleto' },
    { id: 'rcv18', unit: 'D201', resident: 'Renato Guimarães', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-10', method: 'Pix' },
    { id: 'rcv19', unit: 'D202', resident: 'Helena Carvalho Ribeiro', type: 'Taxa Condominial', ref: '2026-09', due: '2026-09-10', amount: 800, status: 'Pago', paidAt: '2026-09-06', method: 'Pix' },
    { id: 'rcv20', unit: 'A101', resident: 'Ana Paula Ramos', type: 'Reserva Espaço Gourmet', ref: '2026-09', due: '2026-09-15', amount: 150, status: 'Pago', paidAt: '2026-09-14', method: 'Pix' },
    { id: 'rcv21', unit: 'B204', resident: 'Carlos Mendonça', type: 'Reserva Salão de Festas', ref: '2026-09', due: '2026-09-20', amount: 200, status: 'Pago', paidAt: '2026-09-18', method: 'Pix' },
    { id: 'rcv22', unit: 'A101', resident: 'Ana Paula Ramos', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv23', unit: 'B204', resident: 'Carlos Mendonça', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv24', unit: 'A102', resident: 'Marcos Vinicius Souza', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv25', unit: 'A201', resident: 'Juliana Castro Alencar', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv26', unit: 'A202', resident: 'Fernando Henrique Lima', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv27', unit: 'B101', resident: 'Beatriz Martins Fonseca', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv28', unit: 'C101', resident: 'Eduardo Silveira Santos', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv29', unit: 'D101', resident: 'Thiago Faria Monteiro', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null },
    { id: 'rcv30', unit: 'D201', resident: 'Renato Guimarães', type: 'Taxa Condominial', ref: '2026-10', due: '2026-10-10', amount: 800, status: 'Pendente', paidAt: null, method: null }
  ],

  payables: [
    { id: 'pay1', supplier: 'Elevadores TechLift', cnpj: '11.222.333/0001-44', category: 'Manutenção', description: 'Manutenção preventiva mensal elevadores', due: '2026-09-15', amount: 2800, status: 'Pago', approvedBy: 'Carlos Mendonça', costCenter: 'Manutenção Geral' },
    { id: 'pay2', supplier: 'Segurança VigiaSeg Ltda', cnpj: '22.333.444/0001-55', category: 'Segurança', description: 'Serviço de monitoramento 24h e CFTV', due: '2026-09-18', amount: 4500, status: 'Pago', approvedBy: 'Conselho Consultivo', costCenter: 'Segurança' },
    { id: 'pay3', supplier: 'Limpeza BrilhoTotal', cnpj: '33.444.556/0001-66', category: 'Limpeza', description: 'Contrato de terceirização equipe de limpeza', due: '2026-09-20', amount: 6200, status: 'Pago', approvedBy: 'Conselho Consultivo', costCenter: 'Limpeza & Conservação' },
    { id: 'pay4', supplier: 'Enel Distribuição SP', cnpj: '61.695.227/0001-93', category: 'Administração', description: 'Energia elétrica áreas comuns', due: '2026-09-22', amount: 3450, status: 'Pago', approvedBy: 'Carlos Mendonça', costCenter: 'Utilidades' },
    { id: 'pay5', supplier: 'Sabesp SP', cnpj: '43.776.517/0001-80', category: 'Administração', description: 'Fornecimento água e esgoto áreas comuns', due: '2026-09-23', amount: 2100, status: 'Pago', approvedBy: 'Carlos Mendonça', costCenter: 'Utilidades' },
    { id: 'pay6', supplier: 'Admicon Administradora', cnpj: '44.555.667/0001-77', category: 'Administração', description: 'Honorários de gestão condominial mensal', due: '2026-09-28', amount: 3800, status: 'Pago', approvedBy: 'Conselho Consultivo', costCenter: 'Administração' },
    { id: 'pay7', supplier: 'Jardins & Flores Paisagismo', cnpj: '55.666.778/0001-88', category: 'Manutenção', description: 'Poda e manutenção de jardins e canteiros', due: '2026-09-30', amount: 1200, status: 'Pago', approvedBy: 'Carlos Mendonça', costCenter: 'Conservação' },
    { id: 'pay8', supplier: 'Porto Seguro Cia de Seguros', cnpj: '61.198.164/0001-60', category: 'Administração', description: 'Seguro predial obrigatório parcela 10/12', due: '2026-10-05', amount: 1850, status: 'Pendente', approvedBy: 'Carlos Mendonça', costCenter: 'Seguros' },
    { id: 'pay9', supplier: 'Dedetizadora Escudo', cnpj: '66.777.889/0001-99', category: 'Limpeza', description: 'Dedetização e desratização semestral áreas comuns', due: '2026-10-08', amount: 950, status: 'Pendente', approvedBy: 'Carlos Mendonça', costCenter: 'Limpeza & Conservação' },
    { id: 'pay10', supplier: 'EletroServ Manutenção', cnpj: '77.888.990/0001-10', category: 'Manutenção', description: 'Troca de luminárias LED garagem e blocos', due: '2026-10-12', amount: 480, status: 'Pendente', approvedBy: null, costCenter: 'Manutenção Geral' },
    { id: 'pay11', supplier: 'Portões Automáticos Rossi', cnpj: '88.999.001/0001-21', category: 'Manutenção', description: 'Troca de cremalheira e motor portão social', due: '2026-10-15', amount: 2400, status: 'Em aprovação', approvedBy: null, costCenter: 'Manutenção Geral' },
    { id: 'pay12', supplier: 'Advocacia Condominial Silva', cnpj: '99.000.112/0001-32', category: 'Jurídico', description: 'Assessoria jurídica cobrança judicial inadimplentes', due: '2026-10-18', amount: 1500, status: 'Em aprovação', approvedBy: null, costCenter: 'Jurídico' },
    { id: 'pay13', supplier: 'TechPiscina Manutenções', cnpj: '10.111.222/0001-43', category: 'Manutenção', description: 'Produtos químicos e revisão bomba piscina', due: '2026-10-20', amount: 750, status: 'Pendente', approvedBy: null, costCenter: 'Manutenção Geral' },
    { id: 'pay14', supplier: 'Bombas Dágua Forte', cnpj: '21.222.333/0001-54', category: 'Manutenção', description: 'Revisão preventiva das bombas de recalque', due: '2026-10-22', amount: 1300, status: 'Em aprovação', approvedBy: null, costCenter: 'Manutenção Geral' }
  ],

  maintenance_orders: [
    { id: 'OS-001', title: 'Troca do cabo de tração Elevador B', area: 'elevador', priority: 'Urgente', supplier: 'Elevadores TechLift', estimatedAmount: 3200, estimatedDate: '2026-09-25', column: 'em_execucao', photos: [], timeline: [{ date: '2026-09-18', user: 'Carlos Mendonça', note: 'OS criada após laudo da manutenção' }] },
    { id: 'OS-002', title: 'Vazamento na casa de bombas subsolo', area: 'hidraulica', priority: 'Alta', supplier: 'Bombas Dágua Forte', estimatedAmount: 1100, estimatedDate: '2026-09-22', column: 'aprovada', photos: [], timeline: [{ date: '2026-09-19', user: 'Roberto Silva', note: 'Vazamento identificado pela portaria' }] },
    { id: 'OS-003', title: 'Pintura dos corredores Bloco C', area: 'fachada', priority: 'Media', supplier: 'Pinturas Silva & Filhos', estimatedAmount: 4500, estimatedDate: '2026-10-05', column: 'em_analise', photos: [], timeline: [{ date: '2026-09-15', user: 'Carlos Mendonça', note: 'Orçamento solicitado' }] },
    { id: 'OS-004', title: 'Substituição sensor de barreira portão', area: 'portao', priority: 'Alta', supplier: 'Portões Automáticos Rossi', estimatedAmount: 650, estimatedDate: '2026-09-18', column: 'concluida', photos: [], timeline: [{ date: '2026-09-10', user: 'Carlos Mendonça', note: 'Finalizado com teste operacional' }] },
    { id: 'OS-005', title: 'Reparo no revestimento da piscina', area: 'piscina', priority: 'Baixa', supplier: 'TechPiscina Manutenções', estimatedAmount: 850, estimatedDate: '2026-10-15', column: 'aberta', photos: [], timeline: [{ date: '2026-09-16', user: 'Ana Paula Ramos', note: 'Solicitado via ocorrência' }] },
    { id: 'OS-006', title: 'Troca de lâmpadas queimadas quadra', area: 'eletrica', priority: 'Baixa', supplier: 'EletroServ Manutenção', estimatedAmount: 320, estimatedDate: '2026-09-23', column: 'aberta', photos: [], timeline: [{ date: '2026-09-19', user: 'Roberto Silva', note: 'Lâmpadas identificadas na ronda noturna' }] },
    { id: 'OS-007', title: 'Manutenção esteira 02 da academia', area: 'academia', priority: 'Media', supplier: 'Fitness Tech Equipamentos', estimatedAmount: 780, estimatedDate: '2026-09-28', column: 'em_analise', photos: [], timeline: [{ date: '2026-09-17', user: 'Carlos Mendonça', note: 'Aguardando peças de reposição' }] },
    { id: 'OS-008', title: 'Poda preventiva de galhos árvore Bloco A', area: 'jardim', priority: 'Media', supplier: 'Jardins & Flores Paisagismo', estimatedAmount: 900, estimatedDate: '2026-09-26', column: 'aprovada', photos: [], timeline: [{ date: '2026-09-14', user: 'Carlos Mendonça', note: 'Aprovado pelo conselho' }] },
    { id: 'OS-009', title: 'Instalação de espelho de segurança rampa', area: 'portao', priority: 'Baixa', supplier: 'Vidraçaria Cristal', estimatedAmount: 350, estimatedDate: '2026-09-12', column: 'concluida', photos: [], timeline: [{ date: '2026-09-08', user: 'Carlos Mendonça', note: 'Instalação concluída com sucesso' }] },
    { id: 'OS-010', title: 'Reforma do telhado da churrasqueira', area: 'fachada', priority: 'Baixa', supplier: 'Telhados & Cia', estimatedAmount: 2200, estimatedDate: '2026-08-30', column: 'cancelada', photos: [], timeline: [{ date: '2026-08-20', user: 'Carlos Mendonça', note: 'Cancelada por prioridade na casa de bombas' }] }
  ],

  preventive_maintenance: [
    { id: 'pm1', equipment: 'Elevadores dos Blocos A, B, C, D', frequency: 'Mensal', lastDate: '2026-08-15', nextDate: '2026-09-25', supplier: 'Elevadores TechLift', status: 'Em dia' },
    { id: 'pm2', equipment: 'Extintores e Mangueiras de Incêndio', frequency: 'Semestral', lastDate: '2026-03-10', nextDate: '2026-09-28', supplier: 'ExtinChamas SP', status: 'Proximo' },
    { id: 'pm3', equipment: 'Bombas de Recalque e Drenagem', frequency: 'Trimestral', lastDate: '2026-06-12', nextDate: '2026-09-26', supplier: 'Bombas Dágua Forte', status: 'Proximo' },
    { id: 'pm4', equipment: 'Para-raios (SPDA) e Laudo Técnico', frequency: 'Anual', lastDate: '2025-08-20', nextDate: '2026-08-20', supplier: 'Engenharia SPDA Brasil', status: 'Vencido' },
    { id: 'pm5', equipment: 'Dedetização e Desratização Geral', frequency: 'Trimestral', lastDate: '2026-06-05', nextDate: '2026-09-24', supplier: 'Dedetizadora Escudo', status: 'Proximo' },
    { id: 'pm6', equipment: 'Portões Automáticos de Veículos', frequency: 'Bimestral', lastDate: '2026-07-15', nextDate: '2026-09-22', supplier: 'Portões Automáticos Rossi', status: 'Em dia' }
  ],

  suppliers: [
    { id: 'sup1', name: 'Elevadores TechLift Ltda', cnpj: '11.222.333/0001-44', specialty: ['Elevadores', 'Manutenção'], contact: 'Eng. Renato Paiva', email: 'contato@techlift.com.br', phone: '(11) 3322-1100', rating: 5, ordersCount: 14, status: 'ativo' },
    { id: 'sup2', name: 'Segurança VigiaSeg Ltda', cnpj: '22.333.444/0001-55', specialty: ['Segurança', 'CFTV', 'Portaria'], contact: 'Marcos Silveira', email: 'comercial@vigiaseg.com.br', phone: '(11) 3455-6677', rating: 4, ordersCount: 8, status: 'ativo' },
    { id: 'sup3', name: 'Limpeza BrilhoTotal', cnpj: '33.444.556/0001-66', specialty: ['Limpeza', 'Conservação'], contact: 'Dona Maria Oliveira', email: 'adm@brilhototal.com.br', phone: '(11) 98111-2233', rating: 5, ordersCount: 12, status: 'ativo' },
    { id: 'sup4', name: 'Portões Automáticos Rossi', cnpj: '88.999.001/0001-21', specialty: ['Portões', 'Serralheria'], contact: 'Fábio Rossi', email: 'rossi.portoes@gmail.com', phone: '(11) 97444-1122', rating: 4, ordersCount: 6, status: 'ativo' },
    { id: 'sup5', name: 'Bombas Dágua Forte', cnpj: '21.222.333/0001-54', specialty: ['Hidráulica', 'Bombas'], contact: 'Valter Sanches', email: 'valter@bombasforte.com.br', phone: '(11) 3888-9900', rating: 5, ordersCount: 9, status: 'ativo' },
    { id: 'sup6', name: 'Jardins & Flores Paisagismo', cnpj: '55.666.778/0001-88', specialty: ['Jardinagem', 'Paisagismo'], contact: 'Claudia Bueno', email: 'bueno.paisagismo@gmail.com', phone: '(11) 98777-6655', rating: 4, ordersCount: 11, status: 'ativo' },
    { id: 'sup7', name: 'Dedetizadora Escudo', cnpj: '66.777.889/0001-99', specialty: ['Dedetização', 'Controle de Pragas'], contact: 'Ricardo Mendes', email: 'escudo.dedetiza@uol.com.br', phone: '(11) 3222-4455', rating: 5, ordersCount: 4, status: 'ativo' },
    { id: 'sup8', name: 'EletroServ Manutenção Elétrica', cnpj: '77.888.990/0001-10', specialty: ['Elétrica', 'Iluminação'], contact: 'Claudio Antunes', email: 'claudio@eletroserv.com.br', phone: '(11) 99333-2211', rating: 4, ordersCount: 7, status: 'ativo' }
  ],

  assemblies: [
    {
      id: 'as1',
      title: 'Assembleia Geral Ordinária (AGO 2026)',
      type: 'Ordinária',
      date: '2026-03-20',
      time: '19:30',
      endTime: '21:45',
      location: 'Híbrida (Salão de Festas + Google Meet)',
      quorum: 'Maioria simples (50%+1)',
      status: 'Realizada',
      agenda: [
        { id: 1, title: 'Prestação de contas do exercício 2025', description: 'Apresentação detalhada pelo síndico e administradora', type: 'aprovação' },
        { id: 2, title: 'Aprovação da previsão orçamentária 2026', description: 'Reajuste da taxa condominial em 5,8%', type: 'votação' },
        { id: 3, title: 'Eleição de Síndico e Conselho Consultivo', description: 'Mandato bianual 2026-2028', type: 'votação' }
      ],
      minutes: {
        attendeesCount: 38,
        absentCount: 10,
        proxiesCount: 6,
        text: 'Aos vinte dias do mês de março de dois mil e vinte e seis, reuniu-se a Assembleia Geral Ordinária. O Síndico Carlos Mendonça abriu a sessão saudando os presentes. Foram apresentadas as contas com parecer favorável do Conselho Fiscal.',
        itemsDeliberation: [
          { item: 1, text: 'Contas aprovadas por unanimidade dos presentes.', votesFavor: 38, votesAgainst: 0, votesAbstain: 0 },
          { item: 2, text: 'Previsão orçamentária aprovada com taxa reajustada para R$ 800,00.', votesFavor: 34, votesAgainst: 3, votesAbstain: 1 },
          { item: 3, text: 'Reeleição do Síndico Carlos Mendonça e conselheiros eleitos.', votesFavor: 36, votesAgainst: 1, votesAbstain: 1 }
        ],
        signatures: [
          { name: 'Carlos Mendonça', role: 'Síndico', date: '2026-03-21' },
          { name: 'Ana Paula Ramos', role: 'Presidente da Mesa', date: '2026-03-21' },
          { name: 'Beatriz Martins Fonseca', role: 'Secretária', date: '2026-03-21' }
        ],
        isFinalized: true
      }
    },
    {
      id: 'as2',
      title: 'Assembleia Geral Extraordinária - Reforma da Portaria',
      type: 'Extraordinária',
      date: '2026-07-14',
      time: '20:00',
      endTime: '22:00',
      location: 'Presencial (Salão de Festas)',
      quorum: '2/3 dos condôminos (32 unidades)',
      status: 'Realizada',
      agenda: [
        { id: 1, title: 'Apresentação de projetos para modernização da portaria', description: 'Três empresas apresentaram propostas técnicas', type: 'informativo' },
        { id: 2, title: 'Aprovação de taxa extra de modernização', description: '5 parcelas de R$ 150 por unidade', type: 'votação' }
      ],
      minutes: {
        attendeesCount: 35,
        absentCount: 13,
        proxiesCount: 8,
        text: 'Reunião extraordinária para deliberar sobre a segurança e modernização do controle de acesso.',
        itemsDeliberation: [
          { item: 1, text: 'Apresentados projetos da VigiaSeg e PortTech.', votesFavor: 35, votesAgainst: 0, votesAbstain: 0 },
          { item: 2, text: 'Aprovada taxa extra de 5 parcelas de R$ 150.', votesFavor: 33, votesAgainst: 2, votesAbstain: 0 }
        ],
        signatures: [
          { name: 'Carlos Mendonça', role: 'Síndico', date: '2026-07-15' },
          { name: 'Eduardo Silveira Santos', role: 'Conselheiro', date: '2026-07-15' }
        ],
        isFinalized: true
      }
    },
    {
      id: 'as3',
      title: 'Assembleia Geral Extraordinária (AGE) - Convocação',
      type: 'Extraordinária',
      date: '2026-10-15',
      time: '19:30',
      endTime: '22:00',
      location: 'Híbrida (Salão de Festas e Link Online)',
      quorum: 'Maioria simples (50%+1)',
      status: 'Futura',
      agenda: [
        { id: 1, title: 'Prestação de contas do 1º semestre de 2026', description: 'Relatório financeiro auditado e balancetes', type: 'aprovação' },
        { id: 2, title: 'Previsão orçamentária e fundo de reserva', description: 'Definição da cota condominial do próximo período', type: 'votação' },
        { id: 3, title: 'Implantação de placas solares nas áreas comuns', description: 'Estudo de viabilidade com payback de 36 meses', type: 'votação' }
      ],
      minutes: null
    }
  ],

  votings: [
    {
      id: 'vote1',
      title: 'Aprovação da Instalação de Energia Solar nas Áreas Comuns',
      description: 'Projeto para redução de até 85% na conta de luz dos blocos e garagens. Investimento com retorno estimado em 3 anos.',
      startDate: '2026-09-01 08:00',
      endDate: '2026-09-30 23:59',
      status: 'Aberta',
      type: 'fraction',
      options: [
        { id: 'opt1', text: 'Sim, aprovar projeto solar', votesCount: 28, fractionPercent: 58.3 },
        { id: 'opt2', text: 'Não, manter modelo atual', votesCount: 6, fractionPercent: 12.5 },
        { id: 'opt3', text: 'Abster-se', votesCount: 2, fractionPercent: 4.2 }
      ],
      userVotes: {
        'A101': 'opt1',
        'B204': 'opt1',
        'A201': 'opt1',
        'C101': 'opt2'
      }
    },
    {
      id: 'vote2',
      title: 'Horário de Silêncio nos Fins de Semana',
      description: 'Proposta para estender horário de silêncio matinal aos domingos das 08h para as 09h.',
      startDate: '2026-08-01 08:00',
      endDate: '2026-08-15 23:59',
      status: 'Encerrada',
      type: 'unit',
      options: [
        { id: 'opt1', text: 'Aprovar silêncio até 09h aos domingos', votesCount: 31, fractionPercent: 64.5 },
        { id: 'opt2', text: 'Manter silêncio até 08h', votesCount: 11, fractionPercent: 22.9 },
        { id: 'opt3', text: 'Abstenção', votesCount: 3, fractionPercent: 6.25 }
      ],
      userVotes: {}
    }
  ],

  announcements: [
    { id: 'com1', title: 'Limpeza semestral das Caixas dÁgua', category: 'Manutenção', target: 'Todos', date: '2026-09-18', expires: '2026-09-25', pinned: true, urgent: false, views: 42, content: 'Informamos que nos dias 24 e 25 de setembro será realizada a lavagem e higienização das caixas dágua. Solicitamos que façam reserva de água necessária, pois o fornecimento será interrompido das 08h às 17h.' },
    { id: 'com2', title: 'ALERTA URGENTE: Manutenção Emergencial no Portão de Veículos', category: 'Urgente', target: 'Todos', date: '2026-09-19', expires: '2026-09-22', pinned: true, urgent: true, views: 56, content: 'Houve rompimento do cabo de aço do portão de saída de veículos. A entrada e saída temporariamente ocorrerão pelo mesmo portão principal com auxílio da equipe de portaria. Atenção redobrada!' },
    { id: 'com3', title: 'Regulamento de Uso da Piscina e Atestados Médicos', category: 'Regulamento', target: 'Todos', date: '2026-09-10', expires: null, pinned: false, urgent: false, views: 88, content: 'Lembramos a todos os moradores que para utilização das piscinas é obrigatório o envio ou apresentação na portaria do atestado médico dermatológico atualizado. Crianças desacompanhadas não são permitidas.' },
    { id: 'com4', title: 'Convocação AGE 2026 - Salvem a Data', category: 'Convocação', target: 'Apenas Proprietários', date: '2026-09-15', expires: '2026-10-16', pinned: false, urgent: false, views: 34, content: 'Convidamos todos os proprietários a participarem da Assembleia Geral agendada para 15 de outubro. O edital formal com itens da pauta já está disponível na aba Assembleias.' },
    { id: 'com5', title: 'Coleta Seletiva de Lixo: Novos Coletores Instalados', category: 'Informativo', target: 'Todos', date: '2026-09-05', expires: null, pinned: false, urgent: false, views: 64, content: 'Foram instaladas novas lixeiras coloridas em cada andar para papel, plástico, vidro e orgânico. Contamos com a colaboração de todos para a correta separação.' },
    { id: 'com6', title: 'Atualização Cadastral de Veículos e Pets', category: 'Informativo', target: 'Todos', date: '2026-08-20', expires: null, pinned: false, urgent: false, views: 79, content: 'Solicitamos aos condôminos que atualizem os dados de seus veículos e animais de estimação no aplicativo para melhor controle e segurança na portaria.' },
    { id: 'com7', title: 'Novo Procedimento de Recebimento de Encomendas', category: 'Regulamento', target: 'Todos', date: '2026-08-10', expires: null, pinned: false, urgent: false, views: 95, content: 'A portaria passará a registrar todas as encomendas com código de rastreio interno. Moradores receberão notificação automática no app quando sua caixa chegar.' }
  ],

  visitors: [
    { id: 'vis1', name: 'Julio Cesar Alvarenga', docType: 'CPF', doc: '123.987.456-11', unit: 'A101', reason: 'Visita Pessoal', entryTime: '2026-09-20 14:20', exitTime: null, hasVehicle: true, plate: 'FED-4433', model: 'Fiat Argo', color: 'Prata', photo: null, status: 'Dentro' },
    { id: 'vis2', name: 'Entregador iFood (Marcos)', docType: 'RG', doc: '44.555.666-X', unit: 'B204', reason: 'Entrega', entryTime: '2026-09-20 15:10', exitTime: '2026-09-20 15:22', hasVehicle: false, plate: null, model: null, color: null, photo: null, status: 'Saiu' },
    { id: 'vis3', name: 'Claudio Antunes (EletroServ)', docType: 'CPF', doc: '777.888.999-00', unit: 'C101', reason: 'Prestador de Serviço', entryTime: '2026-09-20 13:00', exitTime: null, hasVehicle: true, plate: 'EVP-8822', model: 'Fiorino', color: 'Branco', photo: null, status: 'Dentro' },
    { id: 'vis4', name: 'Fernanda Martins', docType: 'CPF', doc: '555.666.777-88', unit: 'D201', reason: 'Visita Pessoal', entryTime: '2026-09-20 11:30', exitTime: '2026-09-20 14:05', hasVehicle: false, plate: null, model: null, color: null, photo: null, status: 'Saiu' },
    { id: 'vis5', name: 'Tecnico Enel - Gabriel Rocha', docType: 'RG', doc: '33.222.111-9', unit: 'Área Comum', reason: 'Prestador de Serviço', entryTime: '2026-09-20 10:15', exitTime: '2026-09-20 11:45', hasVehicle: true, plate: 'ENL-1010', model: 'Strada', color: 'Branco', photo: null, status: 'Saiu' },
    { id: 'vis6', name: 'Carla Vasconcellos', docType: 'CPF', doc: '888.999.000-11', unit: 'A201', reason: 'Visita Pessoal', entryTime: '2026-09-20 15:30', exitTime: null, hasVehicle: false, plate: null, model: null, color: null, photo: null, status: 'Dentro' }
  ],

  packages: [
    { id: 'pkg1', resident: 'Ana Paula Ramos', unit: 'A101', type: 'Mercado Livre / Caixa Média', volumes: 2, receivedAt: '2026-09-20 11:00', status: 'Aguardando Retirada', pickedAt: null, pickedBy: null },
    { id: 'pkg2', resident: 'Carlos Mendonça', unit: 'B204', type: 'Correios / Sedex Documento', volumes: 1, receivedAt: '2026-09-20 09:30', status: 'Retirado', pickedAt: '2026-09-20 12:15', pickedBy: 'Carlos Mendonça' },
    { id: 'pkg3', resident: 'Eduardo Silveira Santos', unit: 'C101', type: 'Amazon / Caixa Grande', volumes: 1, receivedAt: '2026-09-19 16:45', status: 'Aguardando Retirada', pickedAt: null, pickedBy: null },
    { id: 'pkg4', resident: 'Juliana Castro Alencar', unit: 'A201', type: 'Magazine Luiza / Encomenda', volumes: 1, receivedAt: '2026-09-19 14:10', status: 'Retirado', pickedAt: '2026-09-19 18:20', pickedBy: 'Juliana Castro' }
  ],

  common_areas: [
    { id: 'area1', name: 'Salão de Festas', description: 'Espaço completo com ar-condicionado, mesas para 60 pessoas e cozinha de apoio.', capacity: 60, fee: 200, minIntervalHours: 4, autoApprove: false, rules: 'Música até às 22h. Devolução com limpeza realizada ou contratação de taxa de limpeza.', active: true, color: '#1A56DB' },
    { id: 'area2', name: 'Espaço Gourmet & Churrasqueira', description: 'Churrasqueira a carvão, forno de pizza e bancada com chopeira.', capacity: 30, fee: 150, minIntervalHours: 3, autoApprove: true, rules: 'Uso das 10h às 22h. Limpeza das grelhas obrigatória.', active: true, color: '#0E9F6E' },
    { id: 'area3', name: 'Piscina Adulto & Infantil', description: 'Área com espreguiçadeiras e quiosque de apoio.', capacity: 40, fee: 0, minIntervalHours: 0, autoApprove: true, rules: 'Obrigatório atestado médico e ducha prévia. Proibido garrafas de vidro.', active: true, color: '#0694A2' },
    { id: 'area4', name: 'Quadra Poliesportiva', description: 'Piso emborrachado com iluminação LED para futebol, vôlei e basquete.', capacity: 20, fee: 0, minIntervalHours: 1, autoApprove: true, rules: 'Uso de calçados apropriados. Horário até às 21h.', active: true, color: '#D97706' },
    { id: 'area5', name: 'Academia Fitness', description: 'Equipamentos modernos de musculação e esteiras ergométricas.', capacity: 15, fee: 0, minIntervalHours: 0, autoApprove: true, rules: 'Higienizar aparelhos após uso com álcool 70%.', active: true, color: '#7E3AF2' },
    { id: 'area6', name: 'Espaço Coworking', description: 'Salas com wi-fi fibra óptica, mesas individuais e cabine para reuniões.', capacity: 12, fee: 0, minIntervalHours: 2, autoApprove: true, rules: 'Ambiente silencioso. Proibido consumo de alimentos gordurosos.', active: true, color: '#E02424' }
  ],

  reservations: [
    { id: 'res1', areaId: 'area1', areaName: 'Salão de Festas', date: '2026-09-26', timeSlot: '18:00 às 23:00', guestsCount: 45, resident: 'Ana Paula Ramos', unit: 'A101', status: 'Confirmada', fee: 200, notes: 'Aniversário infantil familiar' },
    { id: 'res2', areaId: 'area2', areaName: 'Espaço Gourmet & Churrasqueira', date: '2026-09-27', timeSlot: '11:00 às 17:00', guestsCount: 20, resident: 'Eduardo Silveira Santos', unit: 'C101', status: 'Confirmada', fee: 150, notes: 'Almoço em família' },
    { id: 'res3', areaId: 'area1', areaName: 'Salão de Festas', date: '2026-10-03', timeSlot: '19:00 às 23:30', guestsCount: 50, resident: 'Carlos Mendonça', unit: 'B204', status: 'Aguardando aprovação', fee: 200, notes: 'Comemoração de formatura' },
    { id: 'res4', areaId: 'area4', areaName: 'Quadra Poliesportiva', date: '2026-09-22', timeSlot: '19:00 às 21:00', guestsCount: 10, resident: 'Marcos Vinicius Souza', unit: 'A102', status: 'Confirmada', fee: 0, notes: 'Jogo de futsal' },
    { id: 'res5', areaId: 'area2', areaName: 'Espaço Gourmet & Churrasqueira', date: '2026-09-12', timeSlot: '12:00 às 18:00', guestsCount: 25, resident: 'Beatriz Martins Fonseca', unit: 'B101', status: 'Concluída', fee: 150, notes: 'Churrasco em família' },
    { id: 'res6', areaId: 'area1', areaName: 'Salão de Festas', date: '2026-09-05', timeSlot: '18:00 às 23:00', guestsCount: 30, resident: 'Rodrigo Albuquerque', unit: 'A302', status: 'Cancelada', fee: 0, notes: 'Cancelado pelo morador com antecedência' }
  ],

  occurrences: [
    {
      id: 'occ1',
      category: 'Barulho',
      title: 'Som alto na madrugada de sexta-feira',
      location: 'Bloco A - 2º andar',
      offendingUnit: 'A202',
      complainingUnit: 'A101',
      resident: 'Ana Paula Ramos',
      date: '2026-09-19 01:30',
      description: 'Música eletrônica e conversas em tom excessivamente alto perduraram até quase 3h da manhã, infringindo a lei do silêncio e o regulamento interno.',
      priority: 'Alta',
      isAnonymous: false,
      status: 'Em análise',
      slaHoursLeft: 36,
      slaStatus: 'ok',
      photos: [],
      timeline: [
        { date: '2026-09-19 08:30', user: 'Ana Paula Ramos', text: 'Ocorrência registrada no portal', isInternal: false },
        { date: '2026-09-19 10:15', user: 'Carlos Mendonça', text: 'Recebido pelo Síndico. Notificação amigável enviada à unidade A202.', isInternal: false }
      ]
    },
    {
      id: 'occ2',
      category: 'Estacionamento',
      title: 'Veículo estacionado na vaga de terceiro',
      location: 'Subsolo 1 - Vaga 04',
      offendingUnit: 'B102',
      complainingUnit: 'A202',
      resident: 'Fernando Henrique Lima',
      date: '2026-09-18 19:40',
      description: 'O veículo Fiat Pulse estacionou incorretamente na vaga demarcada 04, impedindo o titular de guardar seu automóvel ao retornar do trabalho.',
      priority: 'Media',
      isAnonymous: false,
      status: 'Resolvida',
      slaHoursLeft: 0,
      slaStatus: 'ok',
      photos: [],
      resolutionNotes: 'Portaria acionou o proprietário que prontamente manobrou o veículo.',
      timeline: [
        { date: '2026-09-18 19:45', user: 'Fernando Henrique Lima', text: 'Ocorrência aberta com foto da vaga', isInternal: false },
        { date: '2026-09-18 20:10', user: 'Roberto Silva', text: 'Porteiro contatou o morador da B102 que regularizou a vaga.', isInternal: false },
        { date: '2026-09-18 20:30', user: 'Carlos Mendonça', text: 'Status alterado para Resolvida.', isInternal: true }
      ]
    },
    {
      id: 'occ3',
      category: 'Segurança',
      title: 'Porta corta-fogo travada aberta com calço de madeira',
      location: 'Bloco B - 3º andar',
      offendingUnit: null,
      complainingUnit: 'B301',
      resident: 'Gustavo Henrique Borges',
      date: '2026-09-17 11:00',
      description: 'Porta corta-fogo estava calçada com madeira, o que coloca em risco todo o edifício em caso de incêndio e desobedece as normas do corpo de bombeiros.',
      priority: 'Urgente',
      isAnonymous: false,
      status: 'Em providência',
      slaHoursLeft: 12,
      slaStatus: 'warning',
      photos: [],
      timeline: [
        { date: '2026-09-17 11:15', user: 'Gustavo Henrique Borges', text: 'Aviso urgente enviado.', isInternal: false },
        { date: '2026-09-17 11:40', user: 'Roberto Silva', text: 'Calço removido pela zeladoria. Monitoramento checando câmeras.', isInternal: false }
      ]
    },
    {
      id: 'occ4',
      category: 'Animais',
      title: 'Cão passeando sem coleira nas áreas comuns',
      location: 'Jardins e hall de entrada',
      offendingUnit: 'C202',
      complainingUnit: 'C102',
      resident: 'Patricia Antunes Gomes',
      date: '2026-09-15 16:30',
      description: 'Cachorro de médio porte circulava solto na área do parquinho onde havia crianças brincando.',
      priority: 'Media',
      isAnonymous: true,
      status: 'Resolvida',
      slaHoursLeft: 0,
      slaStatus: 'ok',
      photos: [],
      resolutionNotes: 'Notificação formal enviada com base no Artigo 14 da Convenção.',
      timeline: [
        { date: '2026-09-15 17:00', user: 'Anônimo', text: 'Ocorrência registrada de forma anônima.', isInternal: false },
        { date: '2026-09-16 09:00', user: 'Carlos Mendonça', text: 'Notificação emitida pela administradora e entregue ao tutor.', isInternal: false }
      ]
    }
  ],

  units: Array.from({ length: 48 }, (_, i) => {
    const blockIndex = Math.floor(i / 12);
    const block = ['A', 'B', 'C', 'D'][blockIndex];
    const unitNum = (Math.floor((i % 12) / 2) + 1) * 100 + ((i % 2) + 1);
    const unitCode = `${block}${unitNum}`;
    const spot = (i + 1).toString().padStart(2, '0');
    return {
      id: `u_${unitCode}`,
      unit: unitCode,
      block: block,
      area: 84.5,
      fraction: 0.020833,
      spots: [spot],
      ownerName: `Proprietário Unidade ${unitCode}`,
      ownerCpf: '111.222.333-44',
      ownerPhone: '(11) 98000-0000',
      ownerEmail: `owner.${unitCode.toLowerCase()}@condohub.com`,
      tenantName: (i % 3 === 0) ? `Inquilino Unidade ${unitCode}` : null,
      tenantPhone: (i % 3 === 0) ? '(11) 97000-0000' : null,
      status: (i % 7 === 0) ? 'Em Reforma' : (i % 11 === 0 ? 'Vaga' : 'Ocupada')
    };
  }),

  documents: [
    { id: 'doc1', title: 'Convenção de Condomínio Registrada', category: 'Convenção', uploadDate: '2022-04-10', expiresDate: null, status: 'Válido', isPublic: true, filename: 'convencao_palmeiras_registrada.pdf', size: '3.4 MB' },
    { id: 'doc2', title: 'Regulamento Interno Atualizado 2026', category: 'Regulamento Interno', uploadDate: '2026-03-22', expiresDate: null, status: 'Válido', isPublic: true, filename: 'regulamento_interno_2026.pdf', size: '1.8 MB' },
    { id: 'doc3', title: 'Apólice de Seguro Predial Porto Seguro', category: 'Seguro', uploadDate: '2026-04-01', expiresDate: '2027-04-01', status: 'Válido', isPublic: true, filename: 'apolice_porto_seguro_2026.pdf', size: '2.1 MB' },
    { id: 'doc4', title: 'Auto de Vistoria do Corpo de Bombeiros (AVCB)', category: 'Alvará', uploadDate: '2026-06-15', expiresDate: '2029-06-15', status: 'Válido', isPublic: true, filename: 'avcb_bombeiros_valido.pdf', size: '890 KB' },
    { id: 'doc5', title: 'Contrato de Manutenção Elevadores TechLift', category: 'Contrato', uploadDate: '2026-01-01', expiresDate: '2027-01-01', status: 'Válido', isPublic: false, filename: 'contrato_techlift_elevadores.pdf', size: '1.2 MB' }
  ],

  notifications_settings: [
    { event: 'Novo boleto gerado', email: true, push: true, whatsapp: false },
    { event: 'Boleto vencido / Cobrança', email: true, push: false, whatsapp: true },
    { event: 'Nova ocorrência registrada', email: true, push: true, whatsapp: false },
    { event: 'Assembleia convocada / Edital', email: true, push: false, whatsapp: true },
    { event: 'Reserva confirmada ou cancelada', email: true, push: true, whatsapp: false },
    { event: 'Novo comunicado urgente', email: true, push: true, whatsapp: true },
    { event: 'Nova encomenda na portaria', email: false, push: true, whatsapp: true },
    { event: 'Visitante autorizado na portaria', email: false, push: true, whatsapp: false }
  ],

  integrations: [
    { id: 'pix', name: 'Pix Banco Central', desc: 'Recebimento instantâneo via Pix com conciliação automática', status: 'Desconectado', key: null },
    { id: 'asaas', name: 'Asaas Pagamentos', desc: 'Emissão de boletos registrados e split de pagamentos', status: 'Desconectado', key: null },
    { id: 'whatsapp', name: 'WhatsApp Business Cloud', desc: 'Envio automático de avisos, cobranças e boletos em PDF', status: 'Desconectado', key: null },
    { id: 'pagarme', name: 'Pagar.me Gateway', desc: 'Processamento de cartões de crédito para taxas e reservas', status: 'Desconectado', key: null },
    { id: 'contaazul', name: 'Conta Azul ERP', desc: 'Sincronização contábil de contas a pagar e plano de contas', status: 'Desconectado', key: null },
    { id: 'gcalendar', name: 'Google Calendar Sync', desc: 'Sincronização de assembleias e manutenções na agenda', status: 'Conectado (Demo)', key: 'demo_oauth_token_gcal' }
  ],

  audit_logs: [
    { id: 'log1', timestamp: '2026-09-20 15:30:12', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Portaria', action: 'Registro de Entrada', details: 'Visitante Carla Vasconcellos para A201', ip: '189.120.45.12' },
    { id: 'log2', timestamp: '2026-09-20 14:22:04', userId: 'u3', userName: 'Roberto Silva', role: 'PORTEIRO', module: 'Portaria', action: 'Registro de Entrada', details: 'Visitante Julio Cesar para A101 (veículo FED-4433)', ip: '189.120.45.12' },
    { id: 'log3', timestamp: '2026-09-20 11:05:40', userId: 'u3', userName: 'Roberto Silva', role: 'PORTEIRO', module: 'Encomendas', action: 'Recebimento de Pacote', details: '2 volumes Mercado Livre para Ana Paula Ramos (A101)', ip: '189.120.45.12' },
    { id: 'log4', timestamp: '2026-09-20 10:15:33', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Ocorrências', action: 'Atualização de Status', details: 'Ocorrência #occ1 alterada para Em Análise', ip: '189.120.45.12' },
    { id: 'log5', timestamp: '2026-09-20 08:30:19', userId: 'u2', userName: 'Ana Paula Ramos', role: 'MORADOR', module: 'Ocorrências', action: 'Abertura de Ocorrência', details: 'Registrou ocorrência de Barulho contra A202', ip: '177.18.230.98' },
    { id: 'log6', timestamp: '2026-09-19 17:40:02', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Financeiro', action: 'Baixa de Pagamento', details: 'Boleto ref 2026-09 unidade A101 marcado como Pago via Pix', ip: '189.120.45.12' },
    { id: 'log7', timestamp: '2026-09-19 16:10:55', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Comunicados', action: 'Publicação Urgente', details: 'Publicou comunicado de Manutenção Emergencial no Portão', ip: '189.120.45.12' },
    { id: 'log8', timestamp: '2026-09-18 20:30:11', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Ocorrências', action: 'Finalização de Ocorrência', details: 'Ocorrência #occ2 marcada como Resolvida', ip: '189.120.45.12' },
    { id: 'log9', timestamp: '2026-09-15 18:00:44', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Assembleias', action: 'Criação de Convocação', details: 'Publicou edital para AGE agendada para 15/10/2026', ip: '189.120.45.12' },
    { id: 'log10', timestamp: '2026-09-01 09:00:15', userId: 'u1', userName: 'Carlos Mendonça', role: 'SINDICO', module: 'Assembleias', action: 'Abertura de Votação', details: 'Iniciou votação online sobre Projeto de Energia Solar', ip: '189.120.45.12' }
  ]
};
