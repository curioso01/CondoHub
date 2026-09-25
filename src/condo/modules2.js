// MODULOS 2: MANUTENÇÃO, ASSEMBLEIAS E COMUNICADOS

window.Modules = window.Modules || {};

window.Modules.maintenance = {
  currentTab: 'kanban',

  render(container, sub = null) {
    if (sub) this.currentTab = sub;

    container.innerHTML = `
      <div class="tabs-nav">
        <button class="tab-btn ${this.currentTab === 'kanban' ? 'active' : ''}" onclick="Modules.maintenance.switchTab('kanban')">
          ${window.UI.icon('columns', 16)} Ordens de Serviço (Kanban)
        </button>
        <button class="tab-btn ${this.currentTab === 'preventiva' ? 'active' : ''}" onclick="Modules.maintenance.switchTab('preventiva')">
          ${window.UI.icon('shield-alert', 16)} Manutenção Preventiva
        </button>
        <button class="tab-btn ${this.currentTab === 'fornecedores' ? 'active' : ''}" onclick="Modules.maintenance.switchTab('fornecedores')">
          ${window.UI.icon('truck', 16)} Fornecedores Cadastrados
        </button>
      </div>

      <div id="maintenance-tab-content"></div>
    `;

    this.renderTabContent();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    this.renderTabContent();
  },

  renderTabContent() {
    const el = document.getElementById('maintenance-tab-content');
    if (!el) return;
    if (this.currentTab === 'kanban') this.renderKanban(el);
    else if (this.currentTab === 'preventiva') this.renderPreventive(el);
    else if (this.currentTab === 'fornecedores') this.renderSuppliers(el);
  },

  // 1. KANBAN OS
  renderKanban(el) {
    const orders = window.Storage.get('maintenance_orders') || [];

    const columns = [
      { id: 'aberta', title: 'Aberta', color: '#64748B' },
      { id: 'em_analise', title: 'Em Análise', color: '#F59E0B' },
      { id: 'aprovada', title: 'Aprovada', color: '#0E9F6E' },
      { id: 'em_execucao', title: 'Em Execução', color: '#1A56DB' },
      { id: 'concluida', title: 'Concluída', color: '#059669' },
      { id: 'cancelada', title: 'Cancelada', color: '#94A3B8' }
    ];

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 class="card-title">${window.UI.icon('columns', 18)} Fluxo de Ordens de Serviço (Kanban)</h3>
        <button class="btn btn-primary btn-sm" onclick="Modules.maintenance.modalNovaOS()">
          ${window.UI.icon('plus', 14)} Nova Ordem de Serviço
        </button>
      </div>

      <div class="kanban-board">
        ${columns.map(col => {
          const colCards = orders.filter(o => o.column === col.id);
          return `
            <div class="kanban-column" id="kanban-col-${col.id}" 
                 ondragover="event.preventDefault(); this.classList.add('drag-over')" 
                 ondragleave="this.classList.remove('drag-over')" 
                 ondrop="Modules.maintenance.handleDrop(event, '${col.id}')">
              <div class="kanban-col-header" style="border-top:3px solid ${col.color};">
                <span>${col.title}</span>
                <span class="badge badge-muted">${colCards.length}</span>
              </div>
              <div class="kanban-cards-area">
                ${colCards.map(c => `
                  <div class="kanban-card" id="card-${c.id}" draggable="true" 
                       ondragstart="Modules.maintenance.handleDragStart(event, '${c.id}')"
                       onclick="Modules.maintenance.openDetailsModal('${c.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <b style="font-size:12px; color:var(--color-primary);">${c.id}</b>
                      ${window.UI.badge(c.priority)}
                    </div>
                    <h4 style="font-size:13px; font-weight:600; margin-bottom:6px;">${window.Security.sanitize(c.title)}</h4>
                    <p style="font-size:11px; color:var(--color-text-muted); margin-bottom:8px;">
                      <b>Área:</b> ${c.area} | <b>Resp:</b> ${c.supplier || 'A definir'}
                    </p>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; border-top:1px solid var(--color-border); padding-top:6px;">
                      <span style="font-weight:600; color:var(--color-text);">${window.Security.maskMoney(c.estimatedAmount)}</span>
                      <span style="color:var(--color-text-muted);">${c.estimatedDate}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.target.classList.add('dragging');
  },

  handleDrop(e, targetColumnId) {
    e.preventDefault();
    document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const orders = window.Storage.get('maintenance_orders') || [];
    const item = orders.find(o => o.id === id);
    if (item && item.column !== targetColumnId) {
      item.column = targetColumnId;
      item.timeline = item.timeline || [];
      item.timeline.push({
        date: new Date().toISOString().substring(0, 10),
        user: window.Auth.checkSession()?.name || 'Síndico',
        note: `Status alterado para ${targetColumnId}`
      });
      window.Storage.set('maintenance_orders', orders);
      window.Audit.log('Movimentação de OS no Kanban', { id, column: targetColumnId }, 'Manutenção');
      this.renderKanban(document.getElementById('maintenance-tab-content'));
    }
  },

  modalNovaOS() {
    const suppliers = window.Storage.get('suppliers') || [];

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Área / Equipamento</label>
          <select id="os-area" class="form-control">
            <option value="elevador">Elevadores</option>
            <option value="hidraulica">Hidráulica / Bombas</option>
            <option value="eletrica">Elétrica / Iluminação</option>
            <option value="portao">Portões e Acesso</option>
            <option value="piscina">Piscina</option>
            <option value="fachada">Fachada / Pintura</option>
            <option value="jardim">Jardinagem</option>
            <option value="academia">Academia</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridade</label>
          <select id="os-priority" class="form-control">
            <option value="Baixa">Baixa</option>
            <option value="Media" selected>Média</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Título da Ordem de Serviço</label>
        <input type="text" id="os-title" class="form-control" placeholder="Ex: Substituição da válvula da bomba 02" />
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Fornecedor Responsável</label>
          <input type="text" id="os-sup" class="form-control" list="sup-os-list" placeholder="Nome do fornecedor" />
          <datalist id="sup-os-list">
            ${suppliers.map(s => `<option value="${s.name}">`).join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">Valor Estimado (R$)</label>
          <input type="number" id="os-amount" class="form-control" placeholder="0.00" step="0.01" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Previsão de Conclusão</label>
        <input type="date" id="os-date" class="form-control" />
      </div>

      <div class="form-group">
        <label class="form-label">Fotos do Local / Ocorrência</label>
        <input type="file" id="os-files" class="form-control" multiple accept="image/*" />
      </div>
    `;

    window.UI.modal({
      title: 'Cadastrar Nova Ordem de Serviço',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Criar Ordem de Serviço',
          className: 'btn-primary',
          onClick: (close) => {
            const area = document.getElementById('os-area').value;
            const priority = document.getElementById('os-priority').value;
            const title = document.getElementById('os-title').value.trim();
            const supplier = document.getElementById('os-sup').value.trim();
            const amount = parseFloat(document.getElementById('os-amount').value) || 0;
            const date = document.getElementById('os-date').value;

            if (!title) {
              window.UI.toast('Título da OS é obrigatório.', 'warning');
              return;
            }

            const orders = window.Storage.get('maintenance_orders') || [];
            const newId = `OS-0${orders.length + 1}`.replace(/OS-0(\d{3})/, 'OS-$1');
            const newOrder = {
              id: newId,
              title: title,
              area: area,
              priority: priority,
              supplier: supplier || 'A definir',
              estimatedAmount: amount,
              estimatedDate: date || new Date().toISOString().substring(0, 10),
              column: 'aberta',
              photos: [],
              timeline: [
                {
                  date: new Date().toISOString().substring(0, 10),
                  user: window.Auth.checkSession()?.name || 'Síndico',
                  note: 'Ordem de serviço criada'
                }
              ]
            };
            orders.unshift(newOrder);
            window.Storage.set('maintenance_orders', orders);

            window.Audit.log('Criação de Ordem de Serviço', { id: newId, title }, 'Manutenção');
            window.UI.toast(`OS #${newId} aberta com sucesso!`, 'success');
            close();
            Modules.maintenance.renderKanban(document.getElementById('maintenance-tab-content'));
          }
        }
      ]
    });
  },

  openDetailsModal(id) {
    const orders = window.Storage.get('maintenance_orders') || [];
    const item = orders.find(o => o.id === id);
    if (!item) return;

    const content = `
      <div style="font-size:14px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <b>#${item.id} — ${window.Security.sanitize(item.title)}</b>
          ${window.UI.badge(item.priority)}
        </div>
        <p><b>Área:</b> ${item.area} | <b>Fornecedor:</b> ${item.supplier}</p>
        <p><b>Valor Estimado:</b> ${window.Security.maskMoney(item.estimatedAmount)} | <b>Previsão:</b> ${item.estimatedDate}</p>
        <p><b>Etapa Atual:</b> <span class="badge badge-info">${item.column.toUpperCase()}</span></p>
      </div>

      <div class="card" style="padding:14px; margin-bottom:16px;">
        <h4 style="font-size:13px; font-weight:600; margin-bottom:10px;">Timeline & Apontamentos da Manutenção</h4>
        <div style="max-height:160px; overflow-y:auto;">
          ${(item.timeline || []).map(t => `
            <div style="font-size:12px; padding:6px 0; border-bottom:1px solid var(--color-border);">
              <span style="color:var(--color-text-muted); font-weight:600;">${t.date}</span> — <b>${window.Security.sanitize(t.user)}:</b> ${window.Security.sanitize(t.note)}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Adicionar Nota Interna / Parecer Técnico</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="os-new-note" class="form-control" placeholder="Inserir observação..." />
          <button class="btn btn-secondary btn-sm" onclick="Modules.maintenance.addNote('${item.id}')">Adicionar</button>
        </div>
      </div>
    `;

    window.UI.modal({
      title: `Detalhes da Ordem #${item.id}`,
      size: 'lg',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  addNote(id) {
    const input = document.getElementById('os-new-note');
    if (!input || !input.value.trim()) return;
    const orders = window.Storage.get('maintenance_orders') || [];
    const item = orders.find(o => o.id === id);
    if (!item) return;

    item.timeline = item.timeline || [];
    item.timeline.push({
      date: new Date().toISOString().substring(0, 10),
      user: window.Auth.checkSession()?.name || 'Síndico',
      note: input.value.trim()
    });
    window.Storage.set('maintenance_orders', orders);
    window.UI.toast('Observação adicionada à OS!', 'success');
    window.UI.closeModal();
    this.openDetailsModal(id);
  },

  // 2. MANUTENÇÃO PREVENTIVA
  renderPreventive(el) {
    const list = window.Storage.get('preventive_maintenance') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('shield-alert', 18)} Cronograma de Manutenções Preventivas Obrigatórias</h3>
          <button class="btn btn-primary btn-sm" onclick="Modules.maintenance.modalNovaPreventiva()">
            ${window.UI.icon('plus', 14)} Novo Item Preventivo
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Equipamento / Sistema</th>
                <th>Frequência</th>
                <th>Última Revisão</th>
                <th>Próxima Revisão</th>
                <th>Fornecedor Responsável</th>
                <th>Status</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => `
                <tr>
                  <td><b>${window.Security.sanitize(p.equipment)}</b></td>
                  <td>${p.frequency}</td>
                  <td>${p.lastDate}</td>
                  <td><b>${p.nextDate}</b></td>
                  <td>${p.supplier}</td>
                  <td>${window.UI.badge(p.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="window.UI.toast('Agendamento de vistoria registrado!', 'success')">
                      Agendar Vistoria
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  modalNovaPreventiva() {
    const suppliers = window.Storage.get('suppliers') || [];

    const content = `
      <div class="form-group">
        <label class="form-label">Equipamento ou Sistema</label>
        <input type="text" id="prev-equip" class="form-control" placeholder="Ex: Grupo Gerador de Energia" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Frequência</label>
          <select id="prev-freq" class="form-control">
            <option value="Mensal">Mensal</option>
            <option value="Bimestral">Bimestral</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fornecedor</label>
          <select id="prev-sup" class="form-control">
            ${suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Data da Última Revisão</label>
          <input type="date" id="prev-last" class="form-control" />
        </div>
        <div class="form-group">
          <label class="form-label">Data da Próxima Revisão</label>
          <input type="date" id="prev-next" class="form-control" />
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Cadastrar Item de Manutenção Preventiva',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Salvar Preventiva',
          className: 'btn-primary',
          onClick: (close) => {
            const equip = document.getElementById('prev-equip').value.trim();
            const freq = document.getElementById('prev-freq').value;
            const sup = document.getElementById('prev-sup').value;
            const last = document.getElementById('prev-last').value;
            const next = document.getElementById('prev-next').value;

            if (!equip || !next) {
              window.UI.toast('Informe o equipamento e a próxima data.', 'warning');
              return;
            }

            const list = window.Storage.get('preventive_maintenance') || [];
            list.push({
              id: 'pm_' + Date.now(),
              equipment: equip,
              frequency: freq,
              lastDate: last || '2026-09-01',
              nextDate: next,
              supplier: sup,
              status: 'Em dia'
            });
            window.Storage.set('preventive_maintenance', list);
            window.UI.toast('Item cadastrado com sucesso!', 'success');
            close();
            Modules.maintenance.renderPreventive(document.getElementById('maintenance-tab-content'));
          }
        }
      ]
    });
  },

  // 3. FORNECEDORES
  renderSuppliers(el) {
    const list = window.Storage.get('suppliers') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <h3 class="card-title">${window.UI.icon('truck', 18)} Fornecedores e Prestadores Homologados</h3>
          <button class="btn btn-primary btn-sm" onclick="Modules.maintenance.modalNovoFornecedor()">
            ${window.UI.icon('plus', 14)} Novo Fornecedor
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Fornecedor / Razão Social</th>
                <th>CNPJ</th>
                <th>Especialidades</th>
                <th>Contato & Telefone</th>
                <th>OS Realizadas</th>
                <th>Avaliação</th>
                <th class="no-sort">Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(s => `
                <tr>
                  <td><b>${window.Security.sanitize(s.name)}</b></td>
                  <td>${s.cnpj}</td>
                  <td>${s.specialty.map(sp => `<span class="badge badge-muted">${sp}</span>`).join(' ')}</td>
                  <td>
                    ${window.Security.sanitize(s.contact)}<br>
                    <span style="font-size:12px; color:var(--color-text-muted);">${s.phone}</span>
                  </td>
                  <td><b>${s.ordersCount || 0}</b></td>
                  <td>
                    <span style="color:#F59E0B; font-size:15px;">
                      ${'★'.repeat(s.rating)}${'☆'.repeat(5 - s.rating)}
                    </span>
                  </td>
                  <td>${window.UI.badge(s.status === 'ativo' ? 'Ativo' : 'Cancelada')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  modalNovoFornecedor() {
    const content = `
      <div class="form-group">
        <label class="form-label">Razão Social / Nome Fantasia</label>
        <input type="text" id="sup-name" class="form-control" placeholder="Nome da empresa" />
      </div>
      <div class="form-group">
        <label class="form-label">CNPJ (com validação real)</label>
        <input type="text" id="sup-cnpj" class="form-control" placeholder="00.000.000/0000-00" oninput="this.value = window.Security.maskCNPJ(this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Nome do Contato</label>
          <input type="text" id="sup-contact" class="form-control" placeholder="Pessoa de contato" />
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input type="text" id="sup-phone" class="form-control" placeholder="(00) 00000-0000" oninput="this.value = window.Security.maskPhone(this.value)" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">E-mail Comercial</label>
        <input type="email" id="sup-email" class="form-control" placeholder="contato@empresa.com" />
      </div>
      <div class="form-group">
        <label class="form-label">Especialidade (separar por vírgula)</label>
        <input type="text" id="sup-spec" class="form-control" placeholder="Ex: Hidráulica, Bombas, Desentupidora" />
      </div>
    `;

    window.UI.modal({
      title: 'Cadastrar Fornecedor Homologado',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Cadastrar Fornecedor',
          className: 'btn-primary',
          onClick: (close) => {
            const name = document.getElementById('sup-name').value.trim();
            const cnpj = document.getElementById('sup-cnpj').value.trim();
            const contact = document.getElementById('sup-contact').value.trim();
            const phone = document.getElementById('sup-phone').value.trim();
            const email = document.getElementById('sup-email').value.trim();
            const spec = document.getElementById('sup-spec').value.trim();

            if (!name || !cnpj) {
              window.UI.toast('Preencha Razão Social e CNPJ.', 'warning');
              return;
            }

            if (!window.Security.validateCNPJ(cnpj)) {
              window.UI.toast('CNPJ inválido! Digite um CNPJ oficial válido.', 'error');
              return;
            }

            const list = window.Storage.get('suppliers') || [];
            list.push({
              id: 'sup_' + Date.now(),
              name: name,
              cnpj: cnpj,
              contact: contact || 'Comercial',
              phone: phone || '(11) 0000-0000',
              email: email || '',
              specialty: spec ? spec.split(',').map(s => s.trim()) : ['Geral'],
              rating: 5,
              ordersCount: 0,
              status: 'ativo'
            });
            window.Storage.set('suppliers', list);
            window.Audit.log('Cadastro de Fornecedor', { name, cnpj }, 'Manutenção');
            window.UI.toast('Fornecedor cadastrado com sucesso!', 'success');
            close();
            Modules.maintenance.renderSuppliers(document.getElementById('maintenance-tab-content'));
          }
        }
      ]
    });
  }
};

window.Modules.assemblies = {
  currentTab: 'lista',

  render(container) {
    const list = window.Storage.get('assemblies') || [];
    const votings = window.Storage.get('votings') || [];
    const user = window.Auth.checkSession();
    const isSindico = user && user.role === 'SINDICO';

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('users', 20)} Gestão de Assembleias Gerais & Votações Eletrônicas</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">AGO, AGE, Atas Digitais estruturadas e deliberações em tempo real.</p>
        </div>
        ${isSindico ? `
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline btn-sm" onclick="Modules.assemblies.modalNovaVotacao()">
              ${window.UI.icon('check-square', 14)} Nova Votação
            </button>
            <button class="btn btn-primary btn-sm" onclick="Modules.assemblies.wizardConvocacao()">
              ${window.UI.icon('plus', 14)} Nova Assembleia (Edital)
            </button>
          </div>
        ` : ''}
      </div>

      <!-- VOTAÇÕES ATIVAS -->
      <div class="card" style="margin-bottom:24px; border-left:4px solid var(--color-primary);">
        <h4 style="font-size:15px; font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          ${window.UI.icon('vote', 18)} Votações Digitais em Andamento
        </h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
          ${votings.map(v => `
            <div style="border:1px solid var(--color-border); border-radius:8px; padding:16px; background:var(--color-surface);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge badge-${v.status === 'Aberta' ? 'success' : 'muted'}">${v.status}</span>
                <span style="font-size:11px; color:var(--color-text-muted);">Encerra: ${v.endDate}</span>
              </div>
              <h5 style="font-size:14px; font-weight:600; margin-bottom:6px;">${window.Security.sanitize(v.title)}</h5>
              <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:12px;">${window.Security.sanitize(v.description)}</p>

              <!-- OPÇÕES -->
              <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                ${v.options.map(opt => `
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
                      <span>${opt.text}</span>
                      <b>${opt.votesCount} votos (${opt.fractionPercent}%)</b>
                    </div>
                    <div style="height:6px; background:var(--color-bg); border-radius:3px; overflow:hidden;">
                      <div style="height:100%; width:${opt.fractionPercent}%; background:var(--color-primary);"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              ${user && user.role === 'MORADOR' && v.status === 'Aberta' ? `
                <button class="btn btn-sm btn-primary" style="width:100%;" onclick="Modules.assemblies.openMoradorVote('${v.id}')">
                  Registrar Meu Voto
                </button>
              ` : `
                <button class="btn btn-sm btn-outline" style="width:100%;" onclick="window.UI.toast('Relatório de auditoria de votos gerado.', 'info')">
                  Ver Auditoria de Votos
                </button>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ASSEMBLEIAS -->
      <div class="card">
        <h4 style="font-size:15px; font-weight:600; margin-bottom:16px;">Histórico e Assembleias Convocadas</h4>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${list.map(as => `
            <div style="border:1px solid var(--color-border); border-radius:8px; padding:18px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span class="badge badge-${as.status === 'Realizada' ? 'info' : 'warning'}">${as.status}</span>
                  <span style="font-size:12px; color:var(--color-text-muted);">${as.type} • ${as.date} às ${as.time}</span>
                </div>
                <h4 style="font-size:16px; font-weight:700;">${window.Security.sanitize(as.title)}</h4>
                <p style="font-size:13px; color:var(--color-text-muted); margin-top:2px;">
                  <b>Local:</b> ${as.location} | <b>Quórum deliberativo:</b> ${as.quorum}
                </p>
                <div style="margin-top:10px;">
                  <span style="font-size:12px; font-weight:600; color:var(--color-text-muted);">Pauta Convocada:</span>
                  <ul style="padding-left:18px; font-size:12px; margin-top:4px; color:var(--color-text);">
                    ${as.agenda.map(item => `<li><b>${item.title}:</b> ${item.description}</li>`).join('')}
                  </ul>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${as.status === 'Realizada' ? `
                  <button class="btn btn-sm btn-primary" onclick="Modules.assemblies.openAtaModal('${as.id}')">
                    ${window.UI.icon('file-text', 14)} Ver Ata Digital Registrada
                  </button>
                ` : `
                  <button class="btn btn-sm btn-outline" onclick="Modules.assemblies.printEdital('${as.id}')">
                    ${window.UI.icon('printer', 14)} Imprimir Edital Formal
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="window.UI.toast('Notificações de convocação reenviadas!', 'success')">
                    Reenviar Avisos
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  openMoradorVote(voteId) {
    const votings = window.Storage.get('votings') || [];
    const vote = votings.find(v => v.id === voteId);
    if (!vote) return;
    const user = window.Auth.checkSession();
    const unit = user.unitId || 'A101';

    if (vote.userVotes && vote.userVotes[unit]) {
      window.UI.toast(`Sua unidade (${unit}) já votou nesta deliberação.`, 'warning');
      return;
    }

    const content = `
      <p style="font-size:13px; margin-bottom:12px;">Voto referente à unidade: <b>${unit}</b></p>
      <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">${vote.title}</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${vote.options.map(opt => `
          <label style="display:flex; align-items:center; gap:10px; padding:10px; border:1px solid var(--color-border); border-radius:8px; cursor:pointer;">
            <input type="radio" name="vote-opt" value="${opt.id}" />
            <span style="font-size:13px; font-weight:500;">${opt.text}</span>
          </label>
        `).join('')}
      </div>
    `;

    window.UI.modal({
      title: 'Cédula de Votação Eletrônica',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Confirmar Meu Voto',
          className: 'btn-primary',
          onClick: (close) => {
            const selected = document.querySelector('input[name="vote-opt"]:checked');
            if (!selected) {
              window.UI.toast('Selecione uma opção de voto.', 'warning');
              return;
            }
            vote.userVotes = vote.userVotes || {};
            vote.userVotes[unit] = selected.value;

            const opt = vote.options.find(o => o.id === selected.value);
            if (opt) {
              opt.votesCount += 1;
              opt.fractionPercent = parseFloat((opt.fractionPercent + 2.08).toFixed(1));
            }

            window.Storage.set('votings', votings);
            window.Audit.log('Voto Registrado em Assembleia', { voteId, unit, opt: selected.value }, 'Assembleias');
            window.UI.toast('Seu voto foi registrado com sucesso e computado na ata!', 'success');
            close();
            Modules.assemblies.render(document.getElementById('content-area'));
          }
        }
      ]
    });
  },

  openAtaModal(id) {
    const as = (window.Storage.get('assemblies') || []).find(a => a.id === id);
    if (!as || !as.minutes) return;
    const condo = window.Storage.get('condo') || {};

    const content = `
      <div class="print-ata" style="font-size:13px; line-height:1.7; background:#FFFFFF; color:#000; padding:20px; border:1px solid #ccc;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
          <h2 style="font-size:18px; margin:0;">ATA DA ${as.title.toUpperCase()}</h2>
          <p style="margin:0; font-size:11px;">CONDOMÍNIO RESIDENCIAL DAS PALMEIRAS — CNPJ: ${condo.cnpj}</p>
        </div>

        <p><b>Data:</b> ${as.date} | <b>Horário:</b> ${as.time} às ${as.endTime} | <b>Local:</b> ${as.location}</p>
        <p><b>Presenças:</b> ${as.minutes.attendeesCount} condôminos presentes, ${as.minutes.absentCount} ausentes, ${as.minutes.proxiesCount} por procuração regular.</p>

        <h4 style="font-size:14px; margin-top:14px; text-decoration:underline;">DELIBERAÇÕES POR ITEM DE PAUTA:</h4>
        ${as.minutes.itemsDeliberation.map(it => `
          <div style="margin:10px 0; padding:8px; background:#F8FAFC; border-left:3px solid #1A56DB;">
            <b>Item ${it.item}:</b> ${it.text}<br>
            <span style="font-size:11px; color:#475569;">Votos a favor: ${it.votesFavor} | Contra: ${it.votesAgainst} | Abstenções: ${it.votesAbstain}</span>
          </div>
        `).join('')}

        <h4 style="font-size:14px; margin-top:16px; text-decoration:underline;">ASSINATURAS DIGITAIS REGISTRADAS:</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:12px;">
          ${(as.minutes.signatures || []).map(s => `
            <div style="text-align:center; border-top:1px solid #000; padding-top:4px; font-size:11px;">
              <b>${s.name}</b><br>
              ${s.role}<br>
              <span style="color:#0E9F6E;">✓ Assinado digitalmente em ${s.date}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    window.UI.modal({
      title: `Ata Digital — ${as.title}`,
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Fechar', className: 'btn-outline' },
        { label: 'Imprimir Ata', className: 'btn-primary', onClick: () => window.print() }
      ]
    });
  },

  printEdital(id) {
    const as = (window.Storage.get('assemblies') || []).find(a => a.id === id);
    if (!as) return;
    const condo = window.Storage.get('condo') || {};

    const content = `
      <div style="background:#FFF; color:#000; padding:24px; border:1px solid #ddd; font-family:'Times New Roman', serif; line-height:1.8;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:16px;">
          <h2 style="margin:0; font-size:18px;">EDITAL DE CONVOCAÇÃO</h2>
          <h3 style="margin:4px 0 0; font-size:15px;">${as.title.toUpperCase()}</h3>
          <p style="font-size:11px; margin:0;">${condo.name} — ${condo.address}, ${condo.city}/${condo.state}</p>
        </div>

        <p style="text-align:justify;">
          O Síndico do Condomínio Residencial das Palmeiras, no uso de suas atribuições legais conferidas pelo Código Civil Brasileiro e pela Convenção Condominial, convoca todos os senhores condôminos e proprietários para reunirem-se em <b>${as.title}</b>, a realizar-se no dia <b>${as.date}</b>, às <b>${as.time}</b> em primeira convocação com 50% dos condôminos presentes, ou às 20:00h em segunda convocação com qualquer número de presentes, no seguinte local: <b>${as.location}</b>.
        </p>

        <h4 style="margin-top:16px;">ORDEM DO DIA (PAUTA):</h4>
        <ol style="padding-left:24px;">
          ${as.agenda.map(item => `
            <li style="margin-bottom:6px;">
              <b>${item.title}:</b> ${item.description}
            </li>
          `).join('')}
        </ol>

        <p style="font-size:12px; margin-top:20px;">
          <b>Nota:</b> É vedada a participação e voto de condôminos em estado de inadimplência (Artigo 1.335, III do Código Civil).
        </p>

        <div style="margin-top:40px; text-align:center;">
          <p>São Paulo, ${new Date().toLocaleDateString('pt-BR')}</p>
          <div style="width:240px; border-top:1px solid #000; margin:30px auto 4px;"></div>
          <b>Carlos Mendonça</b><br>
          <span>Síndico do Condomínio</span>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Edital Formal de Convocação',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Fechar', className: 'btn-outline' },
        { label: 'Imprimir Edital', className: 'btn-primary', onClick: () => window.print() }
      ]
    });
  },

  wizardConvocacao() {
    let step = 1;
    let wizardData = {
      title: 'Assembleia Geral Ordinária',
      type: 'Ordinária',
      date: '2026-10-15',
      time: '19:30',
      location: 'Híbrida (Salão de Festas + Google Meet)',
      quorum: 'Maioria simples (50%+1)',
      agenda: [
        { title: 'Prestação de contas', description: 'Exercício 2025' },
        { title: 'Previsão orçamentária', description: 'Revisão da cota 2026' }
      ]
    };

    const renderStep = () => {
      let stepHtml = '';
      if (step === 1) {
        stepHtml = `
          <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">Passo 1 de 3: Dados Gerais da Assembleia</h4>
          <div class="form-group">
            <label class="form-label">Tipo de Assembleia</label>
            <select id="wiz-type" class="form-control">
              <option value="Ordinária">Ordinária (AGO)</option>
              <option value="Extraordinária">Extraordinária (AGE)</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" id="wiz-date" class="form-control" value="${wizardData.date}" />
            </div>
            <div class="form-group">
              <label class="form-label">Horário de Início</label>
              <input type="time" id="wiz-time" class="form-control" value="${wizardData.time}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Local de Realização</label>
            <input type="text" id="wiz-loc" class="form-control" value="${wizardData.location}" />
          </div>
        `;
      } else if (step === 2) {
        stepHtml = `
          <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">Passo 2 de 3: Itens da Pauta de Deliberação</h4>
          <div id="wiz-agenda-container" style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
            ${wizardData.agenda.map((ag, idx) => `
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="text" class="form-control" style="flex:1;" value="${ag.title}" placeholder="Título do item..." id="ag-title-${idx}" />
                <input type="text" class="form-control" style="flex:1.5;" value="${ag.description}" placeholder="Descrição..." id="ag-desc-${idx}" />
                <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">✕</button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-sm btn-outline" onclick="Modules.assemblies.addWizardAgendaItem()">+ Adicionar Item de Pauta</button>
        `;
      } else if (step === 3) {
        stepHtml = `
          <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">Passo 3 de 3: Revisão e Publicação do Edital</h4>
          <div style="background:#F8FAFC; padding:16px; border-radius:8px; border:1px solid #E2E8F0; font-size:13px;">
            <p><b>Título:</b> ${wizardData.type} — ${wizardData.date} às ${wizardData.time}</p>
            <p><b>Local:</b> ${wizardData.location}</p>
            <p><b>Total de itens em pauta:</b> ${wizardData.agenda.length} itens cadastrados</p>
            <p style="color:#0E9F6E; margin-top:8px;">✓ Edital gerado em conformidade com o Artigo 1.354 do Código Civil.</p>
          </div>
        `;
      }

      window.UI.modal({
        title: 'Assistente de Convocação de Assembleia',
        size: 'lg',
        content: stepHtml,
        buttons: [
          step > 1 ? { label: 'Voltar', className: 'btn-outline', onClick: () => { step--; renderStep(); } } : null,
          step < 3 ? {
            label: 'Avançar',
            className: 'btn-primary',
            onClick: () => {
              if (step === 1) {
                wizardData.type = document.getElementById('wiz-type').value;
                wizardData.date = document.getElementById('wiz-date').value;
                wizardData.time = document.getElementById('wiz-time').value;
                wizardData.location = document.getElementById('wiz-loc').value;
              }
              step++;
              renderStep();
            }
          } : {
            label: 'Salvar e Publicar Convocação',
            className: 'btn-primary',
            onClick: (close) => {
              const list = window.Storage.get('assemblies') || [];
              list.unshift({
                id: 'as_' + Date.now(),
                title: `Assembleia Geral ${wizardData.type}`,
                type: wizardData.type,
                date: wizardData.date,
                time: wizardData.time,
                endTime: '22:00',
                location: wizardData.location,
                quorum: 'Maioria simples (50%+1)',
                status: 'Futura',
                agenda: wizardData.agenda,
                minutes: null
              });
              window.Storage.set('assemblies', list);
              window.Audit.log('Convocação de Assembleia', { date: wizardData.date }, 'Assembleias');
              window.UI.toast('Edital publicado e notificações enviadas aos condôminos!', 'success');
              close();
              Modules.assemblies.render(document.getElementById('content-area'));
            }
          }
        ].filter(Boolean)
      });
    };

    renderStep();
  },

  addWizardAgendaItem() {
    const c = document.getElementById('wiz-agenda-container');
    if (!c) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:8px; align-items:center;';
    div.innerHTML = `
      <input type="text" class="form-control" style="flex:1;" placeholder="Novo título..." />
      <input type="text" class="form-control" style="flex:1.5;" placeholder="Descrição..." />
      <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">✕</button>
    `;
    c.appendChild(div);
  },

  modalNovaVotacao() {
    const content = `
      <div class="form-group">
        <label class="form-label">Título da Votação</label>
        <input type="text" id="new-vote-title" class="form-control" placeholder="Ex: Reforma da Fachada ou Instalação de Placas Solares" />
      </div>
      <div class="form-group">
        <label class="form-label">Descrição Explicativa</label>
        <textarea id="new-vote-desc" class="form-control" rows="2" placeholder="Explique a proposta..."></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Data de Encerramento</label>
          <input type="date" id="new-vote-end" class="form-control" />
        </div>
        <div class="form-group">
          <label class="form-label">Critério de Apuração</label>
          <select id="new-vote-type" class="form-control">
            <option value="fraction">Por Fração Ideal (m²)</option>
            <option value="unit">Um Voto por Unidade (1:1)</option>
          </select>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Iniciar Nova Votação Eletrônica',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Iniciar Votação',
          className: 'btn-primary',
          onClick: (close) => {
            const title = document.getElementById('new-vote-title').value.trim();
            const desc = document.getElementById('new-vote-desc').value.trim();
            const end = document.getElementById('new-vote-end').value;
            const type = document.getElementById('new-vote-type').value;

            if (!title) {
              window.UI.toast('Informe o título da deliberação.', 'warning');
              return;
            }

            const votings = window.Storage.get('votings') || [];
            votings.unshift({
              id: 'vote_' + Date.now(),
              title: title,
              description: desc,
              startDate: new Date().toISOString().substring(0, 10),
              endDate: end || '2026-10-01',
              status: 'Aberta',
              type: type,
              options: [
                { id: 'opt1', text: 'Sim, aprovar proposta', votesCount: 0, fractionPercent: 0 },
                { id: 'opt2', text: 'Não, rejeitar', votesCount: 0, fractionPercent: 0 },
                { id: 'opt3', text: 'Abstenção', votesCount: 0, fractionPercent: 0 }
              ],
              userVotes: {}
            });
            window.Storage.set('votings', votings);
            window.Audit.log('Abertura de Votação Eletrônica', { title }, 'Assembleias');
            window.UI.toast('Votação eletrônica aberta aos moradores!', 'success');
            close();
            Modules.assemblies.render(document.getElementById('content-area'));
          }
        }
      ]
    });
  }
};

window.Modules.communications = {
  render(container) {
    const list = window.Storage.get('announcements') || [];
    const user = window.Auth.checkSession();
    const isSindico = user && ['SINDICO', 'SUPER_ADMIN'].includes(user.role);

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('bell', 20)} Mural Oficial de Comunicados</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">Avisos importantes, regulamentos e comunicados urgentes da administração.</p>
        </div>
        ${isSindico ? `
          <button class="btn btn-primary btn-sm" onclick="Modules.communications.modalNovoComunicado()">
            ${window.UI.icon('plus', 14)} Novo Comunicado
          </button>
        ` : ''}
      </div>

      <!-- MURAL EM CARDS -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
        ${list.map(c => `
          <div class="card ${c.urgent ? 'card-urgent' : ''}" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom:0;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; gap:6px; align-items:center;">
                  <span class="badge badge-${c.urgent ? 'danger badge-urgent-pulse' : 'info'}">${c.category}</span>
                  ${c.pinned ? `<span style="color:var(--color-accent); font-size:12px; display:flex; align-items:center;">${window.UI.icon('pin', 14)} Fixado</span>` : ''}
                </div>
                <span style="font-size:11px; color:var(--color-text-muted);">${c.date}</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; margin-bottom:8px; color:var(--color-text);" class="${c.urgent ? 'urgent-card-title' : ''}">
                ${window.Security.sanitize(c.title)}
              </h4>
              <p style="font-size:13px; color:var(--color-text-muted); line-height:1.5; margin-bottom:16px;">
                ${window.Security.sanitize(c.content.substring(0, 140))}...
              </p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-border); padding-top:12px;">
              <span style="font-size:11px; color:var(--color-text-muted);">
                ${window.UI.icon('eye', 13)} ${c.views || 10} visualizações
              </span>
              <button class="btn btn-sm ${c.urgent ? 'btn-outline-danger' : 'btn-outline'}" onclick="Modules.communications.viewContent('${c.id}')">
                Ler comunicado completo
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  viewContent(id) {
    const list = window.Storage.get('announcements') || [];
    const item = list.find(c => c.id === id);
    if (!item) return;

    item.views = (item.views || 0) + 1;
    window.Storage.set('announcements', list);

    const content = `
      <div style="font-size:14px; line-height:1.7;">
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <span class="badge badge-info">${item.category}</span>
          <span style="font-size:12px; color:var(--color-text-muted);">Publicado em ${item.date}</span>
        </div>
        <h3 style="font-size:18px; font-weight:700; margin-bottom:14px;">${window.Security.sanitize(item.title)}</h3>
        <p style="white-space:pre-line; color:var(--color-text);">${window.Security.sanitize(item.content)}</p>
      </div>
    `;

    window.UI.modal({
      title: 'Comunicado Oficial',
      size: 'md',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  modalNovoComunicado() {
    const content = `
      <div class="form-group">
        <label class="form-label">Título do Comunicado</label>
        <input type="text" id="com-title" class="form-control" placeholder="Título claro e objetivo" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select id="com-cat" class="form-control">
            <option value="Informativo">Informativo</option>
            <option value="Urgente">Urgente</option>
            <option value="Regulamento">Regulamento</option>
            <option value="Convocação">Convocação</option>
            <option value="Manutenção">Manutenção</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Destinatários</label>
          <select id="com-target" class="form-control">
            <option value="Todos">Todos os Moradores</option>
            <option value="Apenas Proprietários">Apenas Proprietários</option>
            <option value="Apenas Inquilinos">Apenas Inquilinos</option>
            <option value="Bloco A">Bloco A</option>
            <option value="Bloco B">Bloco B</option>
            <option value="Bloco C">Bloco C</option>
            <option value="Bloco D">Bloco D</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Conteúdo do Comunicado</label>
        <textarea id="com-content" class="form-control" rows="4" placeholder="Escreva a mensagem completa..."></textarea>
      </div>
      <div style="display:flex; gap:20px; align-items:center;">
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" id="com-pinned" /> Fixar no topo do mural
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" id="com-urgent" /> Notificação Urgente (Push + WhatsApp)
        </label>
      </div>
    `;

    window.UI.modal({
      title: 'Publicar Novo Comunicado',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Publicar no Mural',
          className: 'btn-primary',
          onClick: (close) => {
            const title = document.getElementById('com-title').value.trim();
            const cat = document.getElementById('com-cat').value;
            const target = document.getElementById('com-target').value;
            const text = document.getElementById('com-content').value.trim();
            const pinned = document.getElementById('com-pinned').checked;
            const urgent = document.getElementById('com-urgent').checked;

            if (!title || !text) {
              window.UI.toast('Título e conteúdo são obrigatórios.', 'warning');
              return;
            }

            const list = window.Storage.get('announcements') || [];
            list.unshift({
              id: 'com_' + Date.now(),
              title: title,
              category: cat,
              target: target,
              date: new Date().toISOString().substring(0, 10),
              expires: null,
              pinned: pinned,
              urgent: urgent,
              views: 0,
              content: text
            });
            window.Storage.set('announcements', list);
            window.Audit.log('Publicação de Comunicado', { title, category: cat }, 'Comunicados');
            window.UI.toast('Comunicado publicado no mural!', 'success');
            close();
            Modules.communications.render(document.getElementById('content-area'));
          }
        }
      ]
    });
  }
};
