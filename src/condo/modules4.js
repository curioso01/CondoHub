// MODULOS 4: PORTAL DO MORADOR, RELATÓRIOS E CONFIGURAÇÕES / AUDITORIA

window.Modules = window.Modules || {};

window.Modules.residents_portal = {
  currentTab: 'apartamento',

  switchTab(tab) {
    this.currentTab = tab;
    const content = document.getElementById('content-area');
    if (content) {
      this.render(content, tab);
    }
  },

  render(container, sub = null) {
    if (sub) this.currentTab = sub;
    const user = window.Auth.checkSession();
    const unitId = user?.unitId || 'A101';
    const condo = window.Storage.get('condo') || {};
    const receivables = (window.Storage.get('receivables') || []).filter(r => r.unit === unitId);
    const reservations = (window.Storage.get('reservations') || []).filter(r => r.unit === unitId);
    const packages = (window.Storage.get('packages') || []).filter(p => p.unit === unitId);
    const announcements = (window.Storage.get('announcements') || []).slice(0, 4);
    const openPackages = packages.filter(p => p.status === 'Aguardando Retirada');
    const residentObj = (window.Storage.get('residents') || []).find(r => r.unit === unitId) || {
      name: user?.name || 'Ana Paula Ramos',
      email: user?.email || 'morador@condohub.com',
      phone: '(11) 98765-4321',
      unit: unitId,
      block: 'A',
      type: 'proprietario',
      vehicles: [{ plate: 'ABC-1234', model: 'Honda Civic', color: 'Prata', spot: '01' }]
    };

    container.innerHTML = `
      <!-- TABS DO PORTAL DO MORADOR -->
      <div class="tabs-nav" style="margin-bottom:20px;">
        <button class="tab-btn ${this.currentTab === 'apartamento' ? 'active' : ''}" onclick="Modules.residents_portal.switchTab('apartamento')">
          ${window.UI.icon('home', 16)} Meu Apartamento
        </button>
        <button class="tab-btn ${this.currentTab === 'financeiro' ? 'active' : ''}" onclick="Modules.residents_portal.switchTab('financeiro')">
          ${window.UI.icon('dollar-sign', 16)} Financeiro & Boletos
        </button>
        <button class="tab-btn ${this.currentTab === 'reservas' ? 'active' : ''}" onclick="Router.navigate('reservations')">
          ${window.UI.icon('calendar', 16)} Reservas
        </button>
        <button class="tab-btn ${this.currentTab === 'ocorrencias' ? 'active' : ''}" onclick="Router.navigate('occurrences')">
          ${window.UI.icon('message-square', 16)} Ocorrências
        </button>
        <button class="tab-btn ${this.currentTab === 'documentos' ? 'active' : ''}" onclick="Modules.residents_portal.switchTab('documentos')">
          ${window.UI.icon('file-text', 16)} Documentos Públicos
        </button>
        <button class="tab-btn ${this.currentTab === 'perfil' ? 'active' : ''}" onclick="Modules.residents_portal.switchTab('perfil')">
          ${window.UI.icon('user', 16)} Meu Perfil
        </button>
      </div>

      <div id="portal-tab-content"></div>
    `;

    const el = document.getElementById('portal-tab-content');
    if (!el) return;

    if (this.currentTab === 'apartamento') {
      this.renderApartamento(el, user, unitId, condo, residentObj, receivables, openPackages, announcements);
    } else if (this.currentTab === 'financeiro') {
      this.renderFinanceiro(el, unitId, receivables);
    } else if (this.currentTab === 'documentos') {
      this.renderDocumentos(el);
    } else if (this.currentTab === 'perfil') {
      this.renderPerfil(el, user, residentObj);
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderApartamento(el, user, unitId, condo, resident, receivables, openPackages, announcements) {
    const nextDue = receivables.find(r => r.status !== 'Pago') || receivables[0] || { ref: '2026-09', amount: 800, due: '2026-09-10', status: 'Pendente' };

    el.innerHTML = `
      <!-- BOAS-VINDAS MORADOR -->
      <div class="card" style="background:linear-gradient(135deg, #1E429F 0%, #1A56DB 100%); color:#FFFFFF; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span style="font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:0.8;">Portal do Condômino • Residencial</span>
            <h2 style="font-size:24px; font-weight:700; margin-top:4px;">Olá, ${window.Security.sanitize(user?.name || resident.name)}!</h2>
            <p style="font-size:13px; opacity:0.9; margin-top:4px;">
              Apartamento <b>${unitId}</b> • ${condo.name || 'Residencial das Palmeiras'} • Status: <span class="badge badge-success">Regular</span>
            </p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="Router.navigate('reservations')">
              ${window.UI.icon('calendar', 14)} Reservar Espaço
            </button>
            <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.15); color:#fff; border-color:rgba(255,255,255,0.3);" onclick="Router.navigate('occurrences')">
              ${window.UI.icon('message-square', 14)} Nova Ocorrência
            </button>
          </div>
        </div>
      </div>

      <!-- ALERTA DE ENCOMENDAS PENDENTES -->
      ${openPackages.length ? `
        <div class="card card-package-alert">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="color:#D97706;">${window.UI.icon('package', 24)}</span>
              <div>
                <h4 style="font-size:14px; font-weight:700;">Você tem ${openPackages.length} encomenda(s) aguardando retirada na portaria!</h4>
                <p style="font-size:12px;">Apresente seu documento na guarita para retirar.</p>
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="Router.navigate('access', 'encomendas')">
              Ver Detalhes
            </button>
          </div>
        </div>
      ` : ''}

      <!-- CARDS ESTRUTURAIS: UNIDADE, MORADOR, PRÓXIMA COBRANÇA -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;" class="grid-3">
        <!-- DADOS DA UNIDADE -->
        <div class="card" style="margin-bottom:0;">
          <h4 style="font-size:14px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            ${window.UI.icon('home', 16)} Dados da Unidade
          </h4>
          <div style="font-size:13px; line-height:1.8;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Unidade / Bloco:</span>
              <b>${unitId} (Bloco ${resident.block || 'A'})</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Área Privativa:</span>
              <b>78,50 m²</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Fração Ideal:</span>
              <b>0.020833 (1/48)</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Vaga(s) Garagem:</span>
              <b>Vaga 01 (Subsolo 1)</b>
            </div>
          </div>
        </div>

        <!-- DADOS DO TITULAR -->
        <div class="card" style="margin-bottom:0;">
          <h4 style="font-size:14px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            ${window.UI.icon('user-check', 16)} Titular Cadastrado
          </h4>
          <div style="font-size:13px; line-height:1.8;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Nome:</span>
              <b>${window.Security.sanitize(resident.name)}</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Vínculo:</span>
              <span class="badge badge-info">${resident.type === 'proprietario' ? 'Proprietário' : 'Inquilino'}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">Contato:</span>
              <span>${resident.phone}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-muted);">E-mail:</span>
              <span style="font-size:12px;">${resident.email}</span>
            </div>
          </div>
        </div>

        <!-- PRÓXIMA COBRANÇA -->
        <div class="card" style="margin-bottom:0; border-left:4px solid var(--color-primary);">
          <h4 style="font-size:14px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            ${window.UI.icon('receipt', 16)} Próxima Cobrança
          </h4>
          <div>
            <span style="font-size:12px; color:var(--color-text-muted);">Taxa Condominial Ordinária</span>
            <h3 style="font-size:24px; font-weight:700; color:var(--color-primary); margin:4px 0;">
              ${window.Security.maskMoney(nextDue.amount)}
            </h3>
            <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:8px;">
              Vencimento: <b>${nextDue.due}</b> (${window.UI.badge(nextDue.status)})
            </p>
            <div style="font-size:11px; color:#03543F; background:#DEF7EC; border:1px solid #BCF0DA; padding:4px 8px; border-radius:4px; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              ${window.UI.icon('droplet', 13)}
              <span><b>Água & Esgoto Inclusos</b> na taxa mensal</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="Modules.residents_portal.openPixModal('${nextDue.id}')">
                Pagar com Pix
              </button>
              <button class="btn btn-outline btn-sm" onclick="Modules.financial.openBoletoModal('${nextDue.id}')">
                Boleto
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ATALHOS RÁPIDOS -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:24px;" class="grid-4">
        <div class="card" style="margin-bottom:0; text-align:center; cursor:pointer;" onclick="Modules.residents_portal.openPixModal('${receivables[0]?.id}')">
          <div style="width:44px; height:44px; border-radius:50%; background:#E1EFFE; color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
            ${window.UI.icon('dollar-sign', 20)}
          </div>
          <h4 style="font-size:13px; font-weight:700;">2ª Via Boleto / Pix</h4>
          <p style="font-size:11px; color:var(--color-text-muted);">Pagamento instantâneo</p>
        </div>

        <div class="card" style="margin-bottom:0; text-align:center; cursor:pointer;" onclick="Modules.residents_portal.modalAutorizarVisitante()">
          <div style="width:44px; height:44px; border-radius:50%; background:#DEF7EC; color:var(--color-secondary); display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
            ${window.UI.icon('user-plus', 20)}
          </div>
          <h4 style="font-size:13px; font-weight:700;">Liberar Visitante</h4>
          <p style="font-size:11px; color:var(--color-text-muted);">Aviso prévio à portaria</p>
        </div>

        <div class="card" style="margin-bottom:0; text-align:center; cursor:pointer;" onclick="Router.navigate('reservations')">
          <div style="width:44px; height:44px; border-radius:50%; background:#FEF08A; color:#B45309; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
            ${window.UI.icon('calendar', 20)}
          </div>
          <h4 style="font-size:13px; font-weight:700;">Minhas Reservas</h4>
          <p style="font-size:11px; color:var(--color-text-muted);">Salão, churrasqueira, etc.</p>
        </div>

        <div class="card" style="margin-bottom:0; text-align:center; cursor:pointer;" onclick="Router.navigate('assemblies')">
          <div style="width:44px; height:44px; border-radius:50%; background:#F3E8FF; color:#7E3AF2; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
            ${window.UI.icon('vote', 20)}
          </div>
          <h4 style="font-size:13px; font-weight:700;">Votações & Assembleias</h4>
          <p style="font-size:11px; color:var(--color-text-muted);">Participe das decisões</p>
        </div>
      </div>

      <!-- VEÍCULOS AUTORIZADOS -->
      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('car', 18)} Veículos Cadastrados na Vaga</h3>
          <button class="btn btn-outline btn-sm" onclick="Modules.residents_portal.modalEditarVeiculo('${unitId}')">
            ${window.UI.icon('plus', 14)} Gerenciar Veículo
          </button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Modelo / Marca</th>
                <th>Cor</th>
                <th>Vaga Alocada</th>
                <th>Status</th>
                <th class="no-sort">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${(resident.vehicles || []).map(v => `
                <tr>
                  <td><b>${v.plate}</b></td>
                  <td>${v.model}</td>
                  <td>${v.color}</td>
                  <td>Vaga ${v.spot}</td>
                  <td><span class="badge badge-success">Autorizado</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="Modules.residents_portal.modalEditarVeiculo('${unitId}')">Editar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- COMUNICADOS RECENTES -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${window.UI.icon('bell', 18)} Mural de Avisos da Administração</h3>
          <button class="btn btn-sm btn-outline" onclick="Router.navigate('communications')">Ver mural completo</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${announcements.map(a => `
            <div style="padding:12px; border:1px solid var(--color-border); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge badge-info">${a.category}</span>
                <b style="margin-left:8px; font-size:14px;">${window.Security.sanitize(a.title)}</b>
                <p style="font-size:12px; color:var(--color-text-muted); margin-top:2px;">${window.Security.sanitize(a.content.substring(0, 100))}...</p>
              </div>
              <button class="btn btn-sm btn-outline" onclick="Modules.communications.viewContent('${a.id}')">Ler</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderFinanceiro(el, unitId, receivables) {
    const overdueTotal = receivables.filter(r => r.status === 'Vencido').reduce((acc, r) => acc + r.amount, 0);

    el.innerHTML = `
      ${overdueTotal > 0 ? `
        <div class="card card-debt-alert">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h4 style="font-size:15px; font-weight:700;">Saldo Devedor Pendente: ${window.Security.maskMoney(overdueTotal)}</h4>
              <p style="font-size:12px;">Existem cotas vencidas para a sua unidade. Evite juros e protestos realizando a quitação via Pix.</p>
            </div>
            <button class="btn btn-danger btn-sm" onclick="Modules.residents_portal.openPixModal('${receivables.find(r => r.status === 'Vencido')?.id}')">
              Pagar Pendências com Pix
            </button>
          </div>
        </div>
      ` : `
        <div class="card card-paid-alert">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background:#31C48D; color:#fff; display:flex; align-items:center; justify-content:center;">
              ${window.UI.icon('check', 20)}
            </div>
            <div>
              <h4 style="font-size:14px; font-weight:700;">Parabéns! Sua unidade está 100% adimplente.</h4>
              <p style="font-size:12px;">Nenhum débito pendente para a unidade ${unitId}.</p>
            </div>
          </div>
        </div>
      `}

      <div class="card-water-info">
        <div style="width:32px; height:32px; border-radius:50%; background:#22C55E; color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${window.UI.icon('droplet', 18)}
        </div>
        <div style="font-size:12px; line-height:1.5;">
          <b>Consumo Coletivo de Água Inclusa:</b> O consumo de água e esgoto do condomínio já está <b>100% incluso na sua taxa condominial ordinária</b>. Não há hidrômetro individual ou cobrança adicional separada.
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('receipt', 18)} Histórico de Cobranças da Unidade ${unitId}</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Referência</th>
                <th>Descrição / Tipo</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${receivables.map(r => `
                <tr>
                  <td><b>${r.ref}</b></td>
                  <td>${r.type}</td>
                  <td>${r.due}</td>
                  <td><b>${window.Security.maskMoney(r.amount)}</b></td>
                  <td>${window.UI.badge(r.status)}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      ${r.status !== 'Pago' ? `
                        <button class="btn btn-sm btn-secondary" onclick="Modules.residents_portal.openPixModal('${r.id}')">
                          Pagar Pix
                        </button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline" onclick="Modules.financial.openBoletoModal('${r.id}')">
                        2ª Via Boleto
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderDocumentos(el) {
    const docs = [
      { name: 'Convenção Condominial Oficial', category: 'Convenção', date: '2020-05-10', type: 'PDF' },
      { name: 'Regulamento Interno Atualizado 2026', category: 'Regulamento Interno', date: '2026-03-22', type: 'PDF' },
      { name: 'Apólice de Seguro Predial 2026/2027', category: 'Seguro', date: '2026-04-01', type: 'PDF' },
      { name: 'Alvará do Corpo de Bombeiros (AVCB)', category: 'Alvará', date: '2026-06-12', type: 'PDF' },
      { name: 'Ata da Assembleia Geral Ordinária (AGO 2026)', category: 'Atas', date: '2026-03-20', type: 'PDF' }
    ];

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">
          ${window.UI.icon('folder', 18)} Biblioteca de Documentos Públicos do Condomínio
        </h3>
        <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:20px;">
          Acesse normas internas, atas registradas e certidões oficiais disponíveis a todos os condôminos.
        </p>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Data Registro</th>
                <th>Formato</th>
                <th class="no-sort">Download</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map(d => `
                <tr>
                  <td><b>${d.name}</b></td>
                  <td><span class="badge badge-info">${d.category}</span></td>
                  <td>${d.date}</td>
                  <td><span class="badge badge-muted">${d.type}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="window.UI.toast('Download do documento iniciado: ${d.name}', 'info')">
                      ${window.UI.icon('download', 14)} Baixar
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderPerfil(el, user, resident) {
    el.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;" class="grid-2">
        <!-- DADOS CADASTRAIS -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:16px;">
            ${window.UI.icon('user', 18)} Meus Dados de Contato
          </h3>
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" id="prof-name" class="form-control" value="${window.Security.sanitize(resident.name)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefone / WhatsApp</label>
            <input type="text" id="prof-phone" class="form-control" value="${resident.phone}" oninput="this.value = window.Security.maskPhone(this.value)" />
          </div>
          <div class="form-group">
            <label class="form-label">E-mail Cadastrado</label>
            <input type="email" id="prof-email" class="form-control" value="${resident.email}" />
          </div>
          <button class="btn btn-primary" onclick="Modules.residents_portal.salvarPerfil()">
            Salvar Alterações
          </button>
        </div>

        <!-- ALTERAÇÃO DE SENHA -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:16px;">
            ${window.UI.icon('lock', 18)} Alterar Senha de Acesso
          </h3>
          <div class="form-group">
            <label class="form-label">Senha Atual</label>
            <input type="password" id="pwd-current" class="form-control" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">Nova Senha Segura</label>
            <input type="password" id="pwd-new" class="form-control" placeholder="Mínimo 8 caracteres" oninput="Modules.residents_portal.updatePwdStrength(this.value)" />
            <div id="pwd-strength-container" style="margin-top:6px;"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar Nova Senha</label>
            <input type="password" id="pwd-confirm" class="form-control" placeholder="Repita a nova senha" />
          </div>
          <button class="btn btn-secondary" onclick="Modules.residents_portal.alterarSenha()">
            Atualizar Senha
          </button>
        </div>
      </div>
    `;
  },

  updatePwdStrength(pwd) {
    const el = document.getElementById('pwd-strength-container');
    if (el) {
      el.innerHTML = window.Security.passwordStrengthBar(pwd);
    }
  },

  salvarPerfil() {
    const name = document.getElementById('prof-name').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();
    const email = document.getElementById('prof-email').value.trim();

    if (!name || !email) {
      window.UI.toast('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }

    const session = window.Storage.get('session');
    if (session && session.user) {
      session.user.name = name;
      session.user.email = email;
      window.Storage.set('session', session);
    }

    window.Audit.log('Atualização de Dados do Perfil', { name, email }, 'Perfil');
    window.UI.toast('Dados de perfil atualizados com sucesso!', 'success');
  },

  alterarSenha() {
    const cur = document.getElementById('pwd-current').value;
    const pwd = document.getElementById('pwd-new').value;
    const conf = document.getElementById('pwd-confirm').value;

    if (!cur) {
      window.UI.toast('Informe a senha atual.', 'warning');
      return;
    }

    const val = window.Security.validatePassword(pwd);
    if (!val.valid) {
      window.UI.toast('A nova senha não atende aos requisitos mínimos de segurança.', 'warning');
      return;
    }

    if (pwd !== conf) {
      window.UI.toast('A confirmação da senha não coincide com a nova senha.', 'warning');
      return;
    }

    window.Audit.log('Alteração de Senha', {}, 'Segurança');
    window.UI.toast('Senha alterada com sucesso!', 'success');
    document.getElementById('pwd-current').value = '';
    document.getElementById('pwd-new').value = '';
    document.getElementById('pwd-confirm').value = '';
  },

  modalEditarVeiculo(unitId) {
    const residents = window.Storage.get('residents') || [];
    const r = residents.find(item => item.unit === unitId) || residents[0];
    const v = (r && r.vehicles && r.vehicles[0]) || { plate: 'ABC-1234', model: 'Honda Civic', color: 'Prata', spot: '01' };

    const content = `
      <div class="form-group">
        <label class="form-label">Placa do Veículo</label>
        <input type="text" id="veh-plate" class="form-control" value="${v.plate}" oninput="this.value = window.Security.maskPlate(this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Modelo / Marca</label>
          <input type="text" id="veh-model" class="form-control" value="${v.model}" />
        </div>
        <div class="form-group">
          <label class="form-label">Cor</label>
          <input type="text" id="veh-color" class="form-control" value="${v.color}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Número da Vaga</label>
        <input type="text" id="veh-spot" class="form-control" value="${v.spot}" />
      </div>
    `;

    window.UI.modal({
      title: 'Gerenciar Veículo Autorizado',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Salvar Veículo',
          className: 'btn-primary',
          onClick: (close) => {
            const plate = document.getElementById('veh-plate').value.trim();
            const model = document.getElementById('veh-model').value.trim();
            const color = document.getElementById('veh-color').value.trim();
            const spot = document.getElementById('veh-spot').value.trim();

            if (!plate) {
              window.UI.toast('Informe a placa do veículo.', 'warning');
              return;
            }

            if (r) {
              r.vehicles = [{ plate, model, color, spot }];
              window.Storage.set('residents', residents);
            }

            window.Audit.log('Atualização de Veículo da Unidade', { unitId, plate }, 'Portaria');
            window.UI.toast('Veículo atualizado com sucesso!', 'success');
            close();
            Modules.residents_portal.switchTab('apartamento');
          }
        }
      ]
    });
  },

  openPixModal(id) {
    const item = (window.Storage.get('receivables') || []).find(r => r.id === id) || { amount: 800, unit: 'A101' };
    const pixCode = '00020126580014br.gov.bcb.pix0136condohub-palmeiras-pix@banco.com520400005303986540' + item.amount.toFixed(2) + '5802BR5925CONDOMINIO PALMEIRAS6009SAO PAULO62070503***6304ABCD';

    const content = `
      <div style="text-align:center; padding:10px;">
        <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:12px;">
          Escaneie o QR Code abaixo com o app do seu banco para pagar instantaneamente a cota da unidade <b>${item.unit}</b>.
        </p>

        <!-- QR CODE SVG REAL INLINE -->
        <div style="width:200px; height:200px; background:#fff; border:2px solid var(--color-border); border-radius:12px; margin:0 auto 16px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px;">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="white"/>
            <!-- Top Left Finder -->
            <rect x="5" y="5" width="26" height="26" fill="black"/>
            <rect x="8" y="8" width="20" height="20" fill="white"/>
            <rect x="11" y="11" width="14" height="14" fill="black"/>
            <!-- Top Right Finder -->
            <rect x="69" y="5" width="26" height="26" fill="black"/>
            <rect x="72" y="8" width="20" height="20" fill="white"/>
            <rect x="75" y="11" width="14" height="14" fill="black"/>
            <!-- Bottom Left Finder -->
            <rect x="5" y="69" width="26" height="26" fill="black"/>
            <rect x="8" y="72" width="20" height="20" fill="white"/>
            <rect x="11" y="75" width="14" height="14" fill="black"/>
            <!-- Decorative Data Bits -->
            <rect x="36" y="8" width="6" height="6" fill="black"/>
            <rect x="46" y="8" width="6" height="6" fill="black"/>
            <rect x="56" y="14" width="6" height="6" fill="black"/>
            <rect x="36" y="24" width="6" height="6" fill="black"/>
            <rect x="46" y="24" width="6" height="6" fill="black"/>
            <rect x="56" y="24" width="6" height="6" fill="black"/>
            <rect x="8" y="36" width="6" height="6" fill="black"/>
            <rect x="20" y="36" width="6" height="6" fill="black"/>
            <rect x="36" y="36" width="14" height="14" fill="black"/>
            <rect x="56" y="36" width="6" height="6" fill="black"/>
            <rect x="68" y="36" width="12" height="6" fill="black"/>
            <rect x="86" y="36" width="6" height="6" fill="black"/>
            <rect x="8" y="48" width="12" height="6" fill="black"/>
            <rect x="26" y="48" width="6" height="6" fill="black"/>
            <rect x="36" y="56" width="8" height="8" fill="black"/>
            <rect x="48" y="50" width="8" height="8" fill="black"/>
            <rect x="62" y="48" width="14" height="6" fill="black"/>
            <rect x="82" y="48" width="10" height="6" fill="black"/>
            <rect x="8" y="60" width="6" height="6" fill="black"/>
            <rect x="20" y="60" width="6" height="6" fill="black"/>
            <rect x="68" y="60" width="6" height="14" fill="black"/>
            <rect x="80" y="60" width="12" height="6" fill="black"/>
            <rect x="36" y="70" width="10" height="6" fill="black"/>
            <rect x="52" y="70" width="6" height="10" fill="black"/>
            <rect x="76" y="72" width="6" height="6" fill="black"/>
            <rect x="86" y="72" width="6" height="14" fill="black"/>
            <rect x="36" y="84" width="6" height="8" fill="black"/>
            <rect x="46" y="84" width="14" height="6" fill="black"/>
            <rect x="66" y="84" width="14" height="8" fill="black"/>
          </svg>
          <span style="font-size:10px; color:#1A56DB; margin-top:6px; font-weight:700;">PIX BANCO CENTRAL</span>
        </div>

        <h3 style="font-size:22px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">
          ${window.Security.maskMoney(item.amount)}
        </h3>

        <div class="form-group" style="text-align:left;">
          <label class="form-label">Pix Copia e Cola:</label>
          <div style="display:flex; gap:8px;">
            <input type="text" id="pix-copy-input" class="form-control" value="${pixCode}" readonly style="font-size:11px; font-family:monospace;" />
            <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${pixCode}'); window.UI.toast('Código Pix copiado para a área de transferência!', 'success');">
              Copiar
            </button>
          </div>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Pagamento Instantâneo por Pix',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Fechar', className: 'btn-outline' },
        {
          label: 'Já realizei o pagamento',
          className: 'btn-primary',
          onClick: (close) => {
            window.UI.toast('Comprovante enviado para conciliação bancária automática.', 'info');
            close();
          }
        }
      ]
    });
  },

  modalAutorizarVisitante() {
    const user = window.Auth.checkSession();

    const content = `
      <div class="form-group">
        <label class="form-label">Nome Completo do Convidado</label>
        <input type="text" id="m-vis-name" class="form-control" placeholder="Ex: Lucas Guimarães" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Documento (CPF ou RG)</label>
          <input type="text" id="m-vis-doc" class="form-control" placeholder="000.000.000-00" />
        </div>
        <div class="form-group">
          <label class="form-label">Data Prevista da Visita</label>
          <input type="date" id="m-vis-date" class="form-control" value="${new Date().toISOString().substring(0, 10)}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Placa do Veículo (Opcional)</label>
        <input type="text" id="m-vis-plate" class="form-control" placeholder="ABC-1234" oninput="this.value = window.Security.maskPlate(this.value)" />
      </div>
    `;

    window.UI.modal({
      title: 'Pré-Autorizar Acesso na Portaria',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Gerar Convite & Notificar Portaria',
          className: 'btn-primary',
          onClick: (close) => {
            const name = document.getElementById('m-vis-name').value.trim();
            const doc = document.getElementById('m-vis-doc').value.trim();
            const date = document.getElementById('m-vis-date').value;
            const plate = document.getElementById('m-vis-plate').value.trim();

            if (!name) {
              window.UI.toast('Nome do visitante é obrigatório.', 'warning');
              return;
            }

            const visitors = window.Storage.get('visitors') || [];
            visitors.unshift({
              id: 'vis_' + Date.now(),
              name: name,
              docType: 'CPF',
              doc: doc || 'Pré-liberado',
              unit: user?.unitId || 'A101',
              reason: 'Visita Autorizada pelo Morador',
              entryTime: `${date} (Pré-autorizado)`,
              exitTime: null,
              hasVehicle: !!plate,
              plate: plate || null,
              model: null,
              color: null,
              status: 'Pré-liberado'
            });
            window.Storage.set('visitors', visitors);

            window.Audit.log('Pré-Autorização de Visitante', { name, unit: user?.unitId }, 'Portaria');
            window.UI.toast(`Acesso pré-liberado na portaria para ${name}!`, 'success');
            close();
          }
        }
      ]
    });
  }
};

window.Modules.portal = window.Modules.residents_portal;

window.Modules.reports = {
  render(container) {
    const condo = window.Storage.get('condo') || {};
    const months = window.Storage.get('financial_months') || [];

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('file-text', 20)} Prestação de Contas & Balancete Oficial</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">Demonstrativo Financeiro Consolidado e Balancetes Mensais do Síndico.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            ${window.UI.icon('printer', 14)} Imprimir Balancete
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.UI.toast('Relatório oficial PDF gerado e enviado aos conselheiros!', 'success')">
            ${window.UI.icon('download', 14)} Exportar Dossiê Completo
          </button>
        </div>
      </div>

      <!-- BALANCETE FORMAL -->
      <div class="card" style="background:#FFF; color:#000; padding:24px;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h2 style="font-size:18px; margin:0;">${condo.name}</h2>
            <p style="font-size:12px; margin:2px 0 0;">CNPJ: ${condo.cnpj} • ${condo.address}, ${condo.city}/${condo.state}</p>
          </div>
          <div style="text-align:right;">
            <b style="font-size:16px;">BALANCETE MENSAL</b><br>
            <span style="font-size:12px;">Competência: Setembro / 2026</span>
          </div>
        </div>

        <!-- CONCILIAÇÃO BANCÁRIA -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;" class="grid-2">
          <!-- RECEITAS -->
          <div>
            <h4 style="font-size:14px; border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:8px;">1. RECEITAS ARRECADADAS</h4>
            <div style="font-size:12px; line-height:1.8;">
              <div style="display:flex; justify-content:space-between;">
                <span>Taxas Condominiais Ordinárias (44 unidades)</span>
                <b>R$ 35.200,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Fundo de Reserva (5%)</span>
                <b>R$ 1.760,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Locação de Salão de Festas & Espaço Gourmet</span>
                <b>R$ 1.400,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Juros e Multas por Atraso Recebidos</span>
                <b>R$ 420,00</b>
              </div>
              <div style="display:flex; justify-content:space-between; border-top:1px solid #000; margin-top:8px; padding-top:4px; font-weight:700;">
                <span>TOTAL DAS RECEITAS (A)</span>
                <span style="color:#0E9F6E;">R$ 38.780,00</span>
              </div>
            </div>
          </div>

          <!-- DESPESAS -->
          <div>
            <h4 style="font-size:14px; border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:8px;">2. DESPESAS OPERACIONAIS LIQUIDADAS</h4>
            <div style="font-size:12px; line-height:1.8;">
              <div style="display:flex; justify-content:space-between;">
                <span>Pessoal e Encargos (Zelador / Folha)</span>
                <b>R$ 12.400,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Contrato Manutenção Elevadores (Otis)</span>
                <b>R$ 2.800,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Consumo de Energia Elétrica (Enel)</span>
                <b>R$ 3.450,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Consumo de Água & Esgoto (Sabesp)</span>
                <b>R$ 2.100,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Administradora & Honorários Contábeis</span>
                <b>R$ 3.800,00</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Segurança Eletrônica & Portaria Remota</span>
                <b>R$ 4.500,00</b>
              </div>
              <div style="display:flex; justify-content:space-between; border-top:1px solid #000; margin-top:8px; padding-top:4px; font-weight:700;">
                <span>TOTAL DAS DESPESAS (B)</span>
                <span style="color:#E02424;">R$ 29.050,00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RESULTADO -->
        <div style="background:#F8FAFC; border:1px solid #CBD5E1; padding:12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
          <div>
            <b style="font-size:14px;">SUPERÁVIT OPERACIONAL DO MÊS (A - B)</b><br>
            <span style="font-size:12px; color:#475569;">Saldo remetido para a Conta Corrente e Fundo de Reserva</span>
          </div>
          <h3 style="font-size:22px; color:#0E9F6E; margin:0;">+ R$ 9.730,00</h3>
        </div>

        <!-- PARECER DO CONSELHO FISCAL -->
        <div style="border-top:2px solid #000; padding-top:16px;">
          <h4 style="font-size:13px; text-transform:uppercase;">Parecer Conclusivo do Conselho Fiscal:</h4>
          <p style="font-size:12px; line-height:1.6; text-align:justify; color:#334155;">
            Os membros do Conselho Fiscal do Residencial das Palmeiras, no cumprimento de suas atribuições estatutárias, examinaram as contas, livros, extratos bancários e notas fiscais comprobatórias do mês de Setembro/2026 e recomendam a <b>APROVAÇÃO SEM RESSALVAS</b> das contas prestadas pela administração.
          </p>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-top:40px; text-align:center; font-size:11px;">
            <div>
              <div style="border-top:1px solid #000; width:80%; margin:0 auto 4px;"></div>
              <b>Carlos Mendonça</b><br>Síndico Geral
            </div>
            <div>
              <div style="border-top:1px solid #000; width:80%; margin:0 auto 4px;"></div>
              <b>Roberto Campos</b><br>Presidente do Conselho Fiscal
            </div>
            <div>
              <div style="border-top:1px solid #000; width:80%; margin:0 auto 4px;"></div>
              <b>Juliana Costa</b><br>Membro do Conselho Fiscal
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
};

window.Modules.settings = {
  currentTab: 'usuarios',

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    this.renderTabContent();
  },

  render(container, sub = null) {
    if (sub) this.currentTab = sub;

    container.innerHTML = `
      <div class="tabs-nav" style="margin-bottom:20px;">
        <button class="tab-btn ${this.currentTab === 'condominio' ? 'active' : ''}" onclick="Modules.settings.switchTab('condominio')">
          ${window.UI.icon('building-2', 16)} Dados do Condomínio
        </button>
        <button class="tab-btn ${this.currentTab === 'usuarios' ? 'active' : ''}" onclick="Modules.settings.switchTab('usuarios')">
          ${window.UI.icon('users', 16)} Usuários & Permissões
        </button>
        <button class="tab-btn ${this.currentTab === 'notificacoes' ? 'active' : ''}" onclick="Modules.settings.switchTab('notificacoes')">
          ${window.UI.icon('bell', 16)} Notificações
        </button>
        <button class="tab-btn ${this.currentTab === 'planos' ? 'active' : ''}" onclick="Modules.settings.switchTab('planos')">
          ${window.UI.icon('credit-card', 16)} Planos & Assinatura
        </button>
        <button class="tab-btn ${this.currentTab === 'integracoes' ? 'active' : ''}" onclick="Modules.settings.switchTab('integracoes')">
          ${window.UI.icon('plug', 16)} Integrações
        </button>
        <button class="tab-btn ${this.currentTab === 'auditoria' ? 'active' : ''}" onclick="Modules.settings.switchTab('auditoria')">
          ${window.UI.icon('shield-check', 16)} Logs de Auditoria
        </button>
        <button class="tab-btn ${this.currentTab === 'backup' ? 'active' : ''}" onclick="Modules.settings.switchTab('backup')">
          ${window.UI.icon('database', 16)} Backup & Reset
        </button>
      </div>

      <div id="settings-tab-content"></div>
    `;

    this.renderTabContent();
  },

  renderTabContent() {
    const el = document.getElementById('settings-tab-content');
    if (!el) return;

    if (this.currentTab === 'condominio') this.renderCondoRedirect(el);
    else if (this.currentTab === 'usuarios') this.renderUsers(el);
    else if (this.currentTab === 'notificacoes') this.renderNotifications(el);
    else if (this.currentTab === 'planos') this.renderPlans(el);
    else if (this.currentTab === 'integracoes') this.renderIntegrations(el);
    else if (this.currentTab === 'auditoria') this.renderAudit(el);
    else if (this.currentTab === 'backup') this.renderBackup(el);

    if (window.lucide) window.lucide.createIcons();
  },

  // 1. REDIRECIONAMENTO DADOS DO CONDOMÍNIO
  renderCondoRedirect(el) {
    el.innerHTML = `
      <div class="card" style="text-align:center; padding:40px 20px;">
        <div style="width:56px; height:56px; border-radius:50%; background:#E1EFFE; color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          ${window.UI.icon('building-2', 28)}
        </div>
        <h3 style="font-size:18px; font-weight:700; margin-bottom:8px;">Cadastro dos Dados Mestres do Condomínio</h3>
        <p style="font-size:13px; color:var(--color-text-muted); max-width:500px; margin:0 auto 20px;">
          Os dados fiscais, endereço, CNPJ, corpo diretivo e contas bancárias são gerenciados na seção dedicada de Cadastro Geral.
        </p>
        <button class="btn btn-primary" onclick="Router.navigate('registry', 'condo')">
          Acessar Dados do Condomínio em Cadastro
        </button>
      </div>
    `;
  },

  // 2. USUÁRIOS E PERMISSÕES
  renderUsers(el) {
    const users = window.Storage.get('users') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('users', 18)} Usuários e Níveis de Acesso (RBAC)</h3>
          <button class="btn btn-primary btn-sm" onclick="Modules.settings.modalNovoUsuario()">
            ${window.UI.icon('plus', 14)} Novo Usuário
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Perfil de Acesso</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Último Acesso</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="avatar" style="width:28px; height:28px; font-size:11px;">${u.name.substring(0, 2).toUpperCase()}</div>
                      <b>${window.Security.sanitize(u.name)}</b>
                    </div>
                  </td>
                  <td>${u.email}</td>
                  <td><span class="badge badge-info">${u.role}</span></td>
                  <td>${u.unitId || 'Geral'}</td>
                  <td>${window.UI.badge(u.status === 'ativo' ? 'Ativo' : 'Inativo')}</td>
                  <td style="font-size:12px; color:var(--color-text-muted);">Hoje às 08:30 (189.120.45.12)</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn btn-sm btn-outline" onclick="Modules.settings.resetPassword('${u.id}')">
                        Redefinir
                      </button>
                      <button class="btn btn-sm btn-outline" style="color:var(--color-danger);" onclick="Modules.settings.excluirUsuario('${u.id}')">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  resetPassword(id) {
    window.UI.confirm('Deseja gerar uma nova senha temporária para este usuário?', () => {
      window.Audit.log('Redefinição de Senha de Usuário', { userId: id }, 'Segurança');
      window.UI.toast('Senha temporária enviada por e-mail com sucesso!', 'success');
    });
  },

  excluirUsuario(id) {
    window.UI.confirmDestruct('Esta ação revogará permanentemente o acesso do usuário.', () => {
      let users = window.Storage.get('users') || [];
      users = users.filter(u => u.id !== id);
      window.Storage.set('users', users);
      window.Audit.log('Exclusão de Usuário', { userId: id }, 'Segurança');
      window.UI.toast('Usuário removido com sucesso!', 'success');
      this.renderUsers(document.getElementById('settings-tab-content'));
    });
  },

  modalNovoUsuario() {
    const content = `
      <div class="form-group">
        <label class="form-label">Nome Completo</label>
        <input type="text" id="usr-name" class="form-control" placeholder="Nome do usuário" />
      </div>
      <div class="form-group">
        <label class="form-label">E-mail de Acesso</label>
        <input type="email" id="usr-email" class="form-control" placeholder="usuario@condohub.com" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Perfil de Acesso</label>
          <select id="usr-role" class="form-control">
            <option value="MORADOR">Morador</option>
            <option value="PORTEIRO">Portaria</option>
            <option value="CONSELHEIRO">Conselheiro Fiscal</option>
            <option value="SINDICO">Síndico Geral</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unidade (se Morador)</label>
          <input type="text" id="usr-unit" class="form-control" placeholder="Ex: B204" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Senha Provisória</label>
        <input type="password" id="usr-pwd" class="form-control" value="Condo@2024" />
      </div>
    `;

    window.UI.modal({
      title: 'Cadastrar Novo Usuário',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Criar & Enviar Convite',
          className: 'btn-primary',
          onClick: (close) => {
            const name = document.getElementById('usr-name').value.trim();
            const email = document.getElementById('usr-email').value.trim();
            const role = document.getElementById('usr-role').value;
            const unit = document.getElementById('usr-unit').value.trim();

            if (!name || !email) {
              window.UI.toast('Preencha nome e e-mail.', 'warning');
              return;
            }

            const users = window.Storage.get('users') || [];
            users.push({
              id: 'usr_' + Date.now(),
              name: name,
              email: email,
              role: role,
              unitId: unit || null,
              status: 'ativo'
            });
            window.Storage.set('users', users);
            window.Audit.log('Criação de Usuário', { name, role }, 'Segurança');
            window.UI.toast('Usuário criado e convite simulado enviado por e-mail!', 'success');
            close();
            Modules.settings.renderUsers(document.getElementById('settings-tab-content'));
          }
        }
      ]
    });
  },

  // 3. NOTIFICAÇÕES
  renderNotifications(el) {
    const config = window.Storage.get('notification_prefs') || {
      'boleto_gerado': { email: true, push: true, whatsapp: false },
      'boleto_vencido': { email: true, push: false, whatsapp: true },
      'nova_ocorrencia': { email: true, push: true, whatsapp: false },
      'assembleia_convocada': { email: true, push: false, whatsapp: true },
      'reserva_confirmada': { email: true, push: true, whatsapp: false },
      'comunicado_urgente': { email: true, push: true, whatsapp: true },
      'encomenda_chegou': { email: false, push: true, whatsapp: true },
      'visita_chegou': { email: false, push: true, whatsapp: true }
    };

    const events = [
      { id: 'boleto_gerado', label: 'Novo boleto de cota condominial gerado' },
      { id: 'boleto_vencido', label: 'Alerta de cota vencida e atraso' },
      { id: 'nova_ocorrencia', label: 'Nova ocorrência ou resposta do síndico' },
      { id: 'assembleia_convocada', label: 'Assembleia convocada com edital' },
      { id: 'reserva_confirmada', label: 'Reserva de área comum aprovada' },
      { id: 'comunicado_urgente', label: 'Comunicado com prioridade urgente' },
      { id: 'encomenda_chegou', label: 'Encomenda recebida na portaria' },
      { id: 'visita_chegou', label: 'Visitante ou prestador anunciado na portaria' }
    ];

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title" style="margin-bottom:8px;">
          ${window.UI.icon('bell', 18)} Central de Regras de Notificações
        </h3>
        <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:20px;">
          Defina quais canais automáticos serão acionados para cada evento do condomínio.
        </p>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Evento do Sistema</th>
                <th style="text-align:center;">E-mail</th>
                <th style="text-align:center;">Push no App</th>
                <th style="text-align:center;">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(ev => {
                const p = config[ev.id] || { email: true, push: true, whatsapp: false };
                return `
                  <tr>
                    <td><b>${ev.label}</b></td>
                    <td style="text-align:center;">
                      <input type="checkbox" ${p.email ? 'checked' : ''} onchange="Modules.settings.toggleNotif('${ev.id}', 'email', this.checked)" />
                    </td>
                    <td style="text-align:center;">
                      <input type="checkbox" ${p.push ? 'checked' : ''} onchange="Modules.settings.toggleNotif('${ev.id}', 'push', this.checked)" />
                    </td>
                    <td style="text-align:center;">
                      <input type="checkbox" ${p.whatsapp ? 'checked' : ''} onchange="Modules.settings.toggleNotif('${ev.id}', 'whatsapp', this.checked)" />
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="background:var(--color-bg); padding:12px; border-radius:8px; border:1px solid var(--color-border); margin-top:20px; font-size:12px; color:var(--color-text-muted);">
          ℹ️ <b>Observação:</b> O envio de notificações por WhatsApp requer que a integração esteja conectada na aba <b>Integrações</b>.
        </div>
      </div>
    `;
  },

  toggleNotif(eventId, channel, checked) {
    const config = window.Storage.get('notification_prefs') || {};
    if (!config[eventId]) config[eventId] = {};
    config[eventId][channel] = checked;
    window.Storage.set('notification_prefs', config);
    window.UI.toast(`Preferência de notificação salva (${channel}).`, 'success');
  },

  // 4. PLANOS E ASSINATURA
  renderPlans(el) {
    const condo = window.Storage.get('condo') || {};
    const currentPlan = condo.plan || 'Profissional';

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('credit-card', 20)} Planos & Assinatura CondoHub</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">Transparência total para seu condomínio com escala sob demanda.</p>
        </div>
        <span class="badge badge-success" style="font-size:13px; padding:6px 14px;">
          Plano Ativo: <b>${currentPlan}</b>
        </span>
      </div>

      <!-- CARDS DE PLANOS -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:30px;" class="grid-3">
        <!-- BÁSICO -->
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; position:relative;">
          <div>
            <h4 style="font-size:18px; font-weight:700;">Básico</h4>
            <p style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">Para condomínios de pequeno porte</p>
            <div style="margin:20px 0;">
              <span style="font-size:32px; font-weight:800; color:var(--color-text);">R$ 99</span>
              <span style="color:var(--color-text-muted); font-size:13px;"> / mês</span>
            </div>
            <ul style="font-size:13px; line-height:2; list-style:none; padding:0;">
              <li>✓ Até 50 unidades autônomas</li>
              <li>✓ Financeiro, Comunicados, Ocorrências</li>
              <li>✓ 1 usuário administrador</li>
              <li>✓ Suporte padrão por e-mail</li>
              <li style="color:var(--color-text-muted); text-decoration:line-through;">Assembleias com votação digital</li>
              <li style="color:var(--color-text-muted); text-decoration:line-through;">Portaria e controle de acesso</li>
            </ul>
          </div>
          <button class="btn btn-outline" style="width:100%; margin-top:20px;" onclick="Modules.settings.modalUpgrade('Básico', 99)">
            Selecionar Básico
          </button>
        </div>

        <!-- PROFISSIONAL (DESTAQUE) -->
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border:2px solid var(--color-primary); position:relative; box-shadow:0 8px 24px rgba(26,86,219,0.12);">
          <div style="position:absolute; top:-12px; right:20px; background:var(--color-primary); color:#fff; font-size:11px; font-weight:700; padding:4px 12px; border-radius:999px;">
            RECOMENDADO
          </div>
          <div>
            <h4 style="font-size:18px; font-weight:700; color:var(--color-primary);">Profissional</h4>
            <p style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">A gestão completa e sem limites</p>
            <div style="margin:20px 0;">
              <span style="font-size:32px; font-weight:800; color:var(--color-primary);">R$ 199</span>
              <span style="color:var(--color-text-muted); font-size:13px;"> / mês</span>
            </div>
            <ul style="font-size:13px; line-height:2; list-style:none; padding:0;">
              <li>✓ Até 200 unidades autônomas</li>
              <li>✓ <b>Todos os 11 módulos inclusos</b></li>
              <li>✓ Portal do Morador completo com Pix</li>
              <li>✓ Assembleias Digitais com Atas</li>
              <li>✓ 10 usuários administrativos</li>
              <li>✓ Suporte prioritário via WhatsApp</li>
            </ul>
          </div>
          <button class="btn btn-primary" style="width:100%; margin-top:20px;" disabled>
            Plano Ativo no Condomínio
          </button>
        </div>

        <!-- ENTERPRISE -->
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h4 style="font-size:18px; font-weight:700;">Enterprise</h4>
            <p style="font-size:12px; color:var(--color-text-muted); margin-top:4px;">Grandes complexos e administradoras</p>
            <div style="margin:20px 0;">
              <span style="font-size:32px; font-weight:800; color:var(--color-text);">Sob Consulta</span>
            </div>
            <ul style="font-size:13px; line-height:2; list-style:none; padding:0;">
              <li>✓ Unidades ilimitadas</li>
              <li>✓ Múltiplos condomínios unificados</li>
              <li>✓ API aberta & Webhooks</li>
              <li>✓ Usuários e logins ilimitados</li>
              <li>✓ Suporte 24/7 com SLA dedicado</li>
              <li>✓ White-label e treinamento incluso</li>
            </ul>
          </div>
          <button class="btn btn-outline" style="width:100%; margin-top:20px;" onclick="Modules.settings.modalUpgrade('Enterprise', 'Personalizado')">
            Falar com Consultor
          </button>
        </div>
      </div>

      <!-- PROVA SOCIAL -->
      <div class="card" style="text-align:center; background:var(--color-bg);">
        <p style="font-size:12px; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
          Mais de 500 condomínios e administradoras confiam no CondoHub no Brasil
        </p>
        <div style="display:flex; justify-content:center; gap:32px; flex-wrap:wrap; font-weight:700; font-size:16px; color:var(--color-text-muted); opacity:0.8;">
          <span>ADMICON</span>
          <span>HABITA PLUS</span>
          <span>SÍNDICO EXPRESS</span>
          <span>CONDO PRIME</span>
          <span>PREDIAL BRASIL</span>
        </div>
      </div>
    `;
  },

  modalUpgrade(planName, price) {
    const content = `
      <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:16px;">
        Você está contratando o <b>Plano ${planName}</b> para o Residencial das Palmeiras.
      </p>
      <div class="form-group">
        <label class="form-label">Número do Cartão de Crédito</label>
        <input type="text" class="form-control" placeholder="0000 0000 0000 0000" value="4532 8910 2341 5567" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Validade</label>
          <input type="text" class="form-control" placeholder="MM/AA" value="12/28" />
        </div>
        <div class="form-group">
          <label class="form-label">CVV</label>
          <input type="text" class="form-control" placeholder="123" value="890" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nome Impresso no Cartão</label>
        <input type="text" class="form-control" value="CONDOMINIO RES DAS PALMEIRAS" />
      </div>
    `;

    window.UI.modal({
      title: `Contratar Plano ${planName}`,
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Confirmar Assinatura',
          className: 'btn-primary',
          onClick: (close) => {
            const condo = window.Storage.get('condo') || {};
            condo.plan = planName;
            window.Storage.set('condo', condo);
            window.Audit.log('Upgrade de Plano', { plan: planName }, 'Financeiro');
            window.UI.toast(`Plano atualizado com sucesso para ${planName}! (simulação)`, 'success');
            close();
            Modules.settings.renderPlans(document.getElementById('settings-tab-content'));
          }
        }
      ]
    });
  },

  // 5. INTEGRAÇÕES
  renderIntegrations(el) {
    const integrations = [
      { id: 'pix', name: 'Pix Banco Central', desc: 'Recebimento instantâneo e conciliação de cotas', status: 'Desconectado', icon: 'zap' },
      { id: 'asaas', name: 'Asaas Bank', desc: 'Emissão automática de boletos com registro bancário', status: 'Desconectado', icon: 'file-text' },
      { id: 'whatsapp', name: 'WhatsApp Business API', desc: 'Disparo de comunicados urgentes e boletos por mensagem', status: 'Desconectado', icon: 'message-circle' },
      { id: 'pagarme', name: 'Pagar.me Gateway', desc: 'Processamento de cartões de crédito para taxas de áreas', status: 'Desconectado', icon: 'credit-card' },
      { id: 'contaazul', name: 'Conta Azul', desc: 'Sincronização contábil de livro caixa e DRE', status: 'Desconectado', icon: 'pie-chart' },
      { id: 'google_cal', name: 'Google Calendar', desc: 'Sincronização de assembleias e manutenções preventivas', status: 'Conectado (demo)', icon: 'calendar' }
    ];

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title" style="margin-bottom:8px;">
          ${window.UI.icon('plug', 18)} Conexões e APIs Externas
        </h3>
        <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:20px;">
          Conecte o CondoHub aos seus sistemas de pagamento bancário, contabilidade e mensageria.
        </p>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px;" class="grid-2">
          ${integrations.map(item => `
            <div style="border:1px solid var(--color-border); border-radius:8px; padding:16px; display:flex; justify-content:space-between; align-items:center; background:var(--color-surface);">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; border-radius:8px; background:var(--color-bg); display:flex; align-items:center; justify-content:center; color:var(--color-primary);">
                  ${window.UI.icon(item.icon, 20)}
                </div>
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <b style="font-size:14px;">${item.name}</b>
                    <span class="badge ${item.status.includes('Conectado') ? 'badge-success' : 'badge-muted'}">${item.status}</span>
                  </div>
                  <p style="font-size:12px; color:var(--color-text-muted); margin-top:2px;">${item.desc}</p>
                </div>
              </div>
              <button class="btn btn-sm ${item.status.includes('Conectado') ? 'btn-outline' : 'btn-primary'}" onclick="Modules.settings.modalIntegracao('${item.id}', '${item.name}')">
                ${item.status.includes('Conectado') ? 'Configurar' : 'Conectar'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  modalIntegracao(id, name) {
    const content = `
      <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:16px;">
        Insira as credenciais de API fornecidas pelo provedor <b>${name}</b> (Ambiente de Produção ou Sandbox).
      </p>
      <div class="form-group">
        <label class="form-label">Chave de API / Token de Acesso</label>
        <input type="password" class="form-control" value="api_live_condohub_demo_token_xyz" />
      </div>
      <div class="form-group">
        <label class="form-label">Identificador do Cliente (Client ID)</label>
        <input type="text" class="form-control" value="client_condohub_palmeiras" />
      </div>
      <span class="badge badge-info">Ambiente: Sandbox / Simulado</span>
    `;

    window.UI.modal({
      title: `Configurar Integração ${name}`,
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Testar e Salvar Conexão',
          className: 'btn-primary',
          onClick: (close) => {
            window.Audit.log('Configuração de Integração Externa', { service: name }, 'Integração');
            window.UI.toast(`Integração com ${name} configurada com sucesso! (Modo Sandbox)`, 'success');
            close();
          }
        }
      ]
    });
  },

  // 6. LOGS DE AUDITORIA
  renderAudit(el) {
    const logs = window.Audit.getLogs();

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 class="card-title">${window.UI.icon('shield-check', 18)} Trilha de Auditoria Imutável (Audit Trail)</h3>
            <p style="font-size:12px; color:var(--color-text-muted);">Registro de não-repúdio de todas as ações executadas no sistema.</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Modules.settings.exportAuditCSV()">
            ${window.UI.icon('download', 14)} Exportar Logs (CSV)
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Módulo</th>
                <th>Ação Executada</th>
                <th>Detalhes / Metadados</th>
                <th>IP Simulado</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td style="white-space:nowrap; font-size:12px;">${l.timestamp}</td>
                  <td><b>${window.Security.sanitize(l.userName)}</b></td>
                  <td><span class="badge badge-muted">${l.role}</span></td>
                  <td>${window.Security.sanitize(l.module)}</td>
                  <td><b>${window.Security.sanitize(l.action)}</b></td>
                  <td style="font-size:12px; color:var(--color-text-muted);">${window.Security.sanitize(l.details)}</td>
                  <td style="font-size:11px; font-family:monospace;">${l.ip || '189.120.45.12'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  exportAuditCSV() {
    const logs = window.Audit.getLogs();
    let csv = 'Data/Hora,Usuario,Perfil,Modulo,Acao,Detalhes,IP\n';
    logs.forEach(l => {
      csv += `"${l.timestamp}","${l.userName}","${l.role}","${l.module}","${l.action}","${(l.details || '').replace(/"/g, '""')}","${l.ip || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub_auditoria_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    window.UI.toast('Exportação dos logs de auditoria concluída!', 'info');
  },

  // 7. BACKUP, RESTAURAÇÃO E RESET
  renderBackup(el) {
    el.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;" class="grid-2">
        <div class="card" style="margin-bottom:0;">
          <h3 class="card-title" style="margin-bottom:12px;">
            ${window.UI.icon('download', 18)} Exportar Backup Completo dos Dados
          </h3>
          <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:16px;">
            Gera um arquivo JSON estruturado contendo todas as 48 unidades, moradores, lançamentos financeiros, atas de assembleias e ocorrências.
          </p>
          <button class="btn btn-primary" onclick="Modules.settings.exportBackup()">
            Fazer Download do Backup (JSON)
          </button>
        </div>

        <div class="card" style="margin-bottom:0;">
          <h3 class="card-title" style="margin-bottom:12px;">
            ${window.UI.icon('upload', 18)} Restaurar Backup de Dados
          </h3>
          <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:16px;">
            Restaura o estado do banco de dados a partir de um arquivo JSON previamente exportado.
          </p>
          <input type="file" id="backup-file-input" class="form-control" accept=".json" style="margin-bottom:12px;" />
          <button class="btn btn-outline" onclick="Modules.settings.importBackup()">
            Restaurar Arquivo Selecionado
          </button>
        </div>
      </div>

      <div class="card" style="border:1px solid #FCA5A5; background:#FEF2F2;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:15px; font-weight:700; color:#991B1B;">Restaurar Dados Padrão de Demonstração (Seed Reset)</h4>
            <p style="font-size:12px; color:#991B1B; margin-top:2px;">
              Limpa todas as alterações e recarrega os dados completos da semente com 48 unidades, assembleias, fornecedores e lançamentos.
            </p>
          </div>
          <button class="btn btn-danger" onclick="Modules.settings.resetToSeed()">
            Resetar para Dados Iniciais
          </button>
        </div>
      </div>
    `;
  },

  exportBackup() {
    const keys = [
      'condo', 'units', 'residents', 'suppliers', 'maintenance_orders',
      'preventive_maintenance', 'financial_months', 'receivables', 'payables',
      'assemblies', 'votings', 'common_areas', 'reservations', 'visitors',
      'packages', 'occurrences', 'announcements', 'documents', 'users', 'audit_logs'
    ];
    const data = {};
    keys.forEach(k => {
      data[k] = window.Storage.get(k);
    });

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub_backup_full_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    window.UI.toast('Backup gerado e baixado com sucesso!', 'success');
  },

  importBackup() {
    const fileInput = document.getElementById('backup-file-input');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      window.UI.toast('Selecione um arquivo .json para restaurar.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(k => {
          window.Storage.set(k, data[k]);
        });
        window.Audit.log('Restauração de Backup Completo', {}, 'Sistema');
        window.UI.toast('Banco de dados restaurado com sucesso! Recarregando tela...', 'success');
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        window.UI.toast('Erro ao processar arquivo JSON de backup.', 'error');
      }
    };
    reader.readAsText(fileInput.files[0]);
  },

  resetToSeed() {
    window.UI.confirm('Tem certeza que deseja restaurar os dados iniciais? Todas as edições não exportadas serão perdidas.', () => {
      window.Storage.clear();
      window.Storage.seed();
      window.UI.toast('Dados redefinidos com sucesso para a semente inicial!', 'success');
      setTimeout(() => location.reload(), 800);
    });
  }
};
