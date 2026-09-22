// MODULOS 3: PORTARIA, RESERVAS, OCORRÊNCIAS E CADASTRO

window.Modules = window.Modules || {};

window.Modules.access = {
  currentTab: 'visitantes',

  render(container, sub = null) {
    if (sub) this.currentTab = sub;

    container.innerHTML = `
      <div class="tabs-nav">
        <button class="tab-btn ${this.currentTab === 'visitantes' ? 'active' : ''}" onclick="Modules.access.switchTab('visitantes')">
          ${window.UI.icon('user-check', 16)} Registro de Visitantes & Acessos
        </button>
        <button class="tab-btn ${this.currentTab === 'moradores' ? 'active' : ''}" onclick="Modules.access.switchTab('moradores')">
          ${window.UI.icon('users', 16)} Moradores & Veículos Autorizados
        </button>
        <button class="tab-btn ${this.currentTab === 'encomendas' ? 'active' : ''}" onclick="Modules.access.switchTab('encomendas')">
          ${window.UI.icon('package', 16)} Encomendas & Correspondências
        </button>
      </div>

      <div id="access-tab-content"></div>
    `;

    this.renderTabContent();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    this.renderTabContent();
  },

  renderTabContent() {
    const el = document.getElementById('access-tab-content');
    if (!el) return;
    if (this.currentTab === 'visitantes') this.renderVisitors(el);
    else if (this.currentTab === 'moradores') this.renderAuthorized(el);
    else if (this.currentTab === 'encomendas') this.renderPackages(el);
  },

  // 1. VISITANTES
  renderVisitors(el) {
    const visitors = window.Storage.get('visitors') || [];
    const insideCount = visitors.filter(v => v.status === 'Dentro').length;

    el.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 3fr; gap:16px; margin-bottom:20px;" class="grid-2">
        <div class="card card-visitor-stat">
          <span style="font-size:12px; font-weight:600;">VISITANTES NO CONDOMÍNIO</span>
          <h2 style="font-size:32px; font-weight:700; margin-top:4px;">${insideCount}</h2>
          <p style="font-size:12px;">Presentes agora nas dependências.</p>
        </div>
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0;">
          <div>
            <h3 style="font-size:16px; font-weight:600;">Controle de Acesso em Tempo Real</h3>
            <p style="font-size:13px; color:var(--color-text-muted);">Registre visitas de pedestres, prestadores e veículos.</p>
          </div>
          <button class="btn btn-primary" onclick="Modules.access.modalRegistrarEntrada()">
            ${window.UI.icon('user-plus', 16)} Registrar Nova Entrada
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${window.UI.icon('list', 18)} Histórico de Entradas e Saídas</h3>
          <input type="text" id="vis-search" class="form-control" style="width:240px;" placeholder="Buscar visitante ou unidade..." oninput="Modules.access.filterVisitors()" />
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Horário Entrada</th>
                <th>Horário Saída</th>
                <th>Nome do Visitante</th>
                <th>Documento</th>
                <th>Unidade</th>
                <th>Motivo</th>
                <th>Veículo</th>
                <th>Status</th>
                <th class="no-sort">Ação</th>
              </tr>
            </thead>
            <tbody id="visitors-tbody">
              <!-- Renderizado via JS -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.filterVisitors();
  },

  filterVisitors() {
    const list = window.Storage.get('visitors') || [];
    const q = (document.getElementById('vis-search')?.value || '').toLowerCase();
    const filtered = list.filter(v => !q || v.name.toLowerCase().includes(q) || v.unit.toLowerCase().includes(q) || v.doc.includes(q));

    const tbody = document.getElementById('visitors-tbody');
    if (!tbody) return;

    tbody.innerHTML = filtered.map(v => `
      <tr>
        <td><b>${v.entryTime}</b></td>
        <td>${v.exitTime || '—'}</td>
        <td><b>${window.Security.sanitize(v.name)}</b></td>
        <td>${v.docType}: ${v.doc}</td>
        <td><span class="badge badge-info">${v.unit}</span></td>
        <td>${v.reason}</td>
        <td>${v.hasVehicle ? `<b>${v.plate}</b> (${v.model || 'Veículo'})` : 'A pé'}</td>
        <td>${window.UI.badge(v.status)}</td>
        <td>
          ${v.status === 'Dentro' ? `
            <button class="btn btn-sm btn-outline" onclick="Modules.access.registrarSaida('${v.id}')">
              Registrar Saída
            </button>
          ` : '<span style="color:var(--color-text-muted); font-size:12px;">Finalizado</span>'}
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  registrarSaida(id) {
    const list = window.Storage.get('visitors') || [];
    const item = list.find(v => v.id === id);
    if (!item) return;

    item.status = 'Saiu';
    item.exitTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    window.Storage.set('visitors', list);
    window.Audit.log('Registro de Saída de Visitante', { id, name: item.name }, 'Portaria');
    window.UI.toast(`Saída registrada para ${item.name}!`, 'info');
    this.renderVisitors(document.getElementById('access-tab-content'));
  },

  modalRegistrarEntrada() {
    const residents = window.Storage.get('residents') || [];

    const content = `
      <div class="form-group">
        <label class="form-label">Nome Completo do Visitante</label>
        <input type="text" id="vis-name" class="form-control" placeholder="Nome completo" />
      </div>

      <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Tipo Documento</label>
          <select id="vis-doctype" class="form-control">
            <option value="CPF">CPF</option>
            <option value="RG">RG</option>
            <option value="CNH">CNH</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Número do Documento</label>
          <input type="text" id="vis-doc" class="form-control" placeholder="Número do documento" />
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Unidade de Destino</label>
          <input type="text" id="vis-unit" class="form-control" list="res-units" placeholder="Ex: A101" />
          <datalist id="res-units">
            ${residents.map(r => `<option value="${r.unit}">${r.name}</option>`).join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">Motivo da Entrada</label>
          <select id="vis-reason" class="form-control">
            <option value="Visita Pessoal">Visita Pessoal</option>
            <option value="Prestador de Serviço">Prestador de Serviço</option>
            <option value="Entrega / Delivery">Entrega / Delivery</option>
            <option value="Corretor / Vistoria">Corretor / Vistoria</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:13px;">
          <input type="checkbox" id="vis-has-veh" onchange="document.getElementById('vis-veh-box').style.display = this.checked ? 'grid' : 'none'" />
          Visitante está com veículo?
        </label>
      </div>

      <div id="vis-veh-box" style="display:none; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px;">
        <input type="text" id="vis-plate" class="form-control" placeholder="Placa (ABC-1234)" oninput="this.value = window.Security.maskPlate(this.value)" />
        <input type="text" id="vis-model" class="form-control" placeholder="Modelo (Civic, Gol...)" />
        <input type="text" id="vis-color" class="form-control" placeholder="Cor" />
      </div>

      <div class="form-group">
        <label class="form-label">Captura de Foto / Documento (Simulada)</label>
        <div style="border:2px dashed var(--color-border); padding:16px; border-radius:8px; text-align:center; color:var(--color-text-muted);">
          ${window.UI.icon('camera', 24)}
          <p style="font-size:12px; margin-top:4px;">Webcam da portaria pronta para captura instantânea.</p>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Registrar Entrada de Visitante / Prestador',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Liberar Acesso',
          className: 'btn-primary',
          onClick: (close) => {
            const name = document.getElementById('vis-name').value.trim();
            const docType = document.getElementById('vis-doctype').value;
            const doc = document.getElementById('vis-doc').value.trim();
            const unit = document.getElementById('vis-unit').value.trim();
            const reason = document.getElementById('vis-reason').value;
            const hasVeh = document.getElementById('vis-has-veh').checked;
            const plate = document.getElementById('vis-plate')?.value.trim();
            const model = document.getElementById('vis-model')?.value.trim();
            const color = document.getElementById('vis-color')?.value.trim();

            if (!name || !doc || !unit) {
              window.UI.toast('Informe nome, documento e unidade.', 'warning');
              return;
            }

            if (docType === 'CPF' && !window.Security.validateCPF(doc)) {
              window.UI.toast('CPF informado é inválido.', 'error');
              return;
            }

            const visitors = window.Storage.get('visitors') || [];
            visitors.unshift({
              id: 'vis_' + Date.now(),
              name: name,
              docType: docType,
              doc: doc,
              unit: unit,
              reason: reason,
              entryTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
              exitTime: null,
              hasVehicle: hasVeh,
              plate: hasVeh ? plate : null,
              model: hasVeh ? model : null,
              color: hasVeh ? color : null,
              photo: null,
              status: 'Dentro'
            });
            window.Storage.set('visitors', visitors);

            window.Audit.log('Entrada Autorizada na Portaria', { name, unit, doc }, 'Portaria');
            window.UI.toast(`Entrada de ${name} autorizada para a unidade ${unit}!`, 'success');
            close();
            Modules.access.renderVisitors(document.getElementById('access-tab-content'));
          }
        }
      ]
    });
  },

  // 2. MORADORES E VEÍCULOS AUTORIZADOS
  renderAuthorized(el) {
    const residents = window.Storage.get('residents') || [];

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">
          ${window.UI.icon('users', 18)} Base de Moradores e Veículos Cadastrados na Portaria
        </h3>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Unidade</th>
                <th>Morador</th>
                <th>Tipo</th>
                <th>Contato</th>
                <th>Veículos Cadastrados</th>
                <th>Vaga Alocada</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${residents.map(r => `
                <tr>
                  <td><b>${r.unit}</b> (${r.block})</td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="avatar" style="width:28px; height:28px; font-size:11px;">${r.name.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <b>${window.Security.sanitize(r.name)}</b><br>
                        <span style="font-size:11px; color:var(--color-text-muted);">CPF: ${r.cpf}</span>
                      </div>
                    </div>
                  </td>
                  <td>${r.type === 'proprietario' ? 'Proprietário' : 'Inquilino'}</td>
                  <td>${r.phone}<br><span style="font-size:11px; color:var(--color-text-muted);">${r.email}</span></td>
                  <td>
                    ${r.vehicles && r.vehicles.length ? r.vehicles.map(v => `
                      <span class="badge badge-info" style="margin:2px;">${v.plate} (${v.model})</span>
                    `).join('') : '<span style="color:var(--color-text-muted); font-size:12px;">Sem veículo</span>'}
                  </td>
                  <td><b>${r.vehicles && r.vehicles[0] ? 'Vaga ' + r.vehicles[0].spot : '—'}</b></td>
                  <td>${window.UI.badge(r.status === 'ativo' ? 'Ativo' : 'Inadimplente')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // 3. ENCOMENDAS
  renderPackages(el) {
    const packages = window.Storage.get('packages') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('package', 18)} Encomendas e Entregas Recebidas</h3>
          <button class="btn btn-primary btn-sm" onclick="Modules.access.modalNovaEncomenda()">
            ${window.UI.icon('plus', 14)} Nova Encomenda
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Data Recebimento</th>
                <th>Destinatário</th>
                <th>Unidade</th>
                <th>Tipo / Volumes</th>
                <th>Status</th>
                <th>Retirada</th>
                <th class="no-sort">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${packages.map(p => `
                <tr>
                  <td>${p.receivedAt}</td>
                  <td><b>${window.Security.sanitize(p.resident)}</b></td>
                  <td><span class="badge badge-info">${p.unit}</span></td>
                  <td>${p.type} (${p.volumes} vol.)</td>
                  <td>${window.UI.badge(p.status)}</td>
                  <td>${p.pickedAt ? `${p.pickedAt} por ${p.pickedBy}` : '—'}</td>
                  <td>
                    ${p.status === 'Aguardando Retirada' ? `
                      <button class="btn btn-sm btn-secondary" onclick="Modules.access.confirmarRetirada('${p.id}')">
                        Confirmar Retirada
                      </button>
                    ` : '<span style="color:var(--color-text-muted); font-size:12px;">Entregue</span>'}
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

  confirmarRetirada(id) {
    const list = window.Storage.get('packages') || [];
    const item = list.find(p => p.id === id);
    if (!item) return;

    const content = `
      <div class="form-group">
        <label class="form-label">Nome de quem está retirando</label>
        <input type="text" id="ret-name" class="form-control" value="${item.resident}" />
      </div>
      <div class="form-group">
        <label class="form-label">Data e Hora da Entrega</label>
        <input type="text" class="form-control" value="${new Date().toISOString().replace('T', ' ').substring(0, 16)}" disabled />
      </div>
    `;

    window.UI.modal({
      title: 'Confirmar Baixa de Encomenda',
      size: 'sm',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Confirmar Entrega',
          className: 'btn-primary',
          onClick: (close) => {
            const name = document.getElementById('ret-name').value.trim();
            item.status = 'Retirado';
            item.pickedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
            item.pickedBy = name || item.resident;
            window.Storage.set('packages', list);
            window.Audit.log('Retirada de Encomenda', { id, unit: item.unit, pickedBy: item.pickedBy }, 'Portaria');
            window.UI.toast(`Encomenda entregue para ${item.pickedBy}!`, 'success');
            close();
            Modules.access.renderPackages(document.getElementById('access-tab-content'));
          }
        }
      ]
    });
  },

  modalNovaEncomenda() {
    const residents = window.Storage.get('residents') || [];

    const content = `
      <div class="form-group">
        <label class="form-label">Destinatário (Morador)</label>
        <select id="pkg-res" class="form-control">
          ${residents.map(r => `<option value="${r.name}::${r.unit}">${r.unit} - ${r.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Tipo de Entrega / Remetente</label>
          <input type="text" id="pkg-type" class="form-control" placeholder="Ex: Amazon / Mercado Livre / Correios" />
        </div>
        <div class="form-group">
          <label class="form-label">Volumes</label>
          <input type="number" id="pkg-vol" class="form-control" value="1" min="1" />
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Registrar Chegada de Encomenda',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Registrar e Notificar Morador',
          className: 'btn-primary',
          onClick: (close) => {
            const val = document.getElementById('pkg-res').value.split('::');
            const resName = val[0];
            const unit = val[1];
            const type = document.getElementById('pkg-type').value.trim();
            const vol = parseInt(document.getElementById('pkg-vol').value) || 1;

            const list = window.Storage.get('packages') || [];
            list.unshift({
              id: 'pkg_' + Date.now(),
              resident: resName,
              unit: unit,
              type: type || 'Pacote Encomenda',
              volumes: vol,
              receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              status: 'Aguardando Retirada',
              pickedAt: null,
              pickedBy: null
            });
            window.Storage.set('packages', list);
            window.Audit.log('Recebimento de Encomenda', { unit, resName }, 'Portaria');
            window.UI.toast(`Notificação enviada para o morador da unidade ${unit}!`, 'success');
            close();
            Modules.access.renderPackages(document.getElementById('access-tab-content'));
          }
        }
      ]
    });
  }
};

window.Modules.reservations = {
  render(container) {
    const areas = window.Storage.get('common_areas') || [];
    const reservations = window.Storage.get('reservations') || [];
    const user = window.Auth.checkSession();
    const isSindico = user && ['SINDICO', 'SUPER_ADMIN'].includes(user.role);

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('calendar', 20)} Reservas de Áreas Comuns</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">Consulte disponibilidades, regras e faça sua solicitação online.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Modules.reservations.modalNovaReserva()">
          ${window.UI.icon('plus', 14)} Solicitar Nova Reserva
        </button>
      </div>

      <!-- CARDS DAS ÁREAS COMUNS -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:16px; margin-bottom:24px;">
        ${areas.map(a => `
          <div class="card" style="margin-bottom:0; border-top:4px solid ${a.color};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <h4 style="font-size:15px; font-weight:700;">${a.name}</h4>
              <span class="badge badge-${a.active ? 'success' : 'muted'}">${a.active ? 'Ativa' : 'Inativa'}</span>
            </div>
            <p style="font-size:12px; color:var(--color-text-muted); margin:6px 0 10px;">${a.description}</p>
            <div style="font-size:12px; border-top:1px solid var(--color-border); padding-top:8px;">
              <div><b>Capacidade:</b> até ${a.capacity} pessoas</div>
              <div><b>Taxa de uso:</b> ${a.fee > 0 ? window.Security.maskMoney(a.fee) : 'Gratuita'}</div>
              <div><b>Aprovação:</b> ${a.autoApprove ? 'Automática' : 'Manual pelo Síndico'}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- CALENDÁRIO CSS GRID DINÂMICO (ANO ATUAL) -->
      ${(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const currentMonthName = monthNames[currentMonth];
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

        return `
          <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
              <h3 class="card-title">${window.UI.icon('calendar', 18)} Calendário de Reservas — ${currentMonthName} de ${currentYear}</h3>
            </div>
            <div class="calendar-grid">
              <div class="calendar-header-cell">DOM</div>
              <div class="calendar-header-cell">SEG</div>
              <div class="calendar-header-cell">TER</div>
              <div class="calendar-header-cell">QUA</div>
              <div class="calendar-header-cell">QUI</div>
              <div class="calendar-header-cell">SEX</div>
              <div class="calendar-header-cell">SÁB</div>

              ${Array.from({ length: totalCells }, (_, idx) => {
                const dayNum = idx - firstDayIndex + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const dateStr = `${currentYear}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
                const dayRes = isCurrentMonth ? reservations.filter(r => r.date === dateStr) : [];

                return `
                  <div class="calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''}" onclick="${isCurrentMonth ? `Modules.reservations.showDayReservations('${dateStr}')` : ''}">
                    <div class="calendar-day-num">${isCurrentMonth ? dayNum : ''}</div>
                    ${dayRes.map(r => `
                      <div class="calendar-event-pill" style="background:#1A56DB;">
                        ${r.unit}: ${r.areaName}
                      </div>
                    `).join('')}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      })()}

      <!-- HISTÓRICO DE RESERVAS -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">${window.UI.icon('list', 18)} Histórico de Reservas</h3>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Área Comum</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Condômino / Unidade</th>
                <th>Convidados</th>
                <th>Taxa</th>
                <th>Status</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${reservations.map(r => `
                <tr>
                  <td><b>${r.areaName}</b></td>
                  <td>${r.date}</td>
                  <td>${r.timeSlot}</td>
                  <td>${r.resident} (<b>${r.unit}</b>)</td>
                  <td>${r.guestsCount}</td>
                  <td>${window.Security.maskMoney(r.fee)}</td>
                  <td>${window.UI.badge(r.status)}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      ${isSindico && r.status === 'Aguardando aprovação' ? `
                        <button class="btn btn-sm btn-secondary" onclick="Modules.reservations.approveRes('${r.id}')">Aprovar</button>
                        <button class="btn btn-sm btn-danger" onclick="Modules.reservations.cancelRes('${r.id}')">Recusar</button>
                      ` : ''}
                      ${r.status !== 'Cancelada' && r.status !== 'Concluída' ? `
                        <button class="btn btn-sm btn-outline" onclick="Modules.reservations.cancelRes('${r.id}')">Cancelar</button>
                      ` : ''}
                    </div>
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

  showDayReservations(dateStr) {
    const list = (window.Storage.get('reservations') || []).filter(r => r.date === dateStr);
    const content = list.length ? `
      <div>
        ${list.map(r => `
          <div style="padding:12px; border:1px solid var(--color-border); border-radius:8px; margin-bottom:8px;">
            <b>${r.areaName}</b> — ${r.timeSlot}<br>
            <span>Responsável: <b>${r.resident}</b> (${r.unit})</span><br>
            <span>Convidados: ${r.guestsCount} | Status: ${window.UI.badge(r.status)}</span>
          </div>
        `).join('')}
      </div>
    ` : '<p>Nenhuma reserva registrada para este dia. Espaços disponíveis!</p>';

    window.UI.modal({
      title: `Reservas em ${dateStr}`,
      size: 'sm',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  approveRes(id) {
    const list = window.Storage.get('reservations') || [];
    const item = list.find(r => r.id === id);
    if (!item) return;

    item.status = 'Confirmada';
    window.Storage.set('reservations', list);
    window.Audit.log('Aprovação de Reserva', { id, area: item.areaName, unit: item.unit }, 'Reservas');
    window.UI.toast(`Reserva da área ${item.areaName} confirmada!`, 'success');
    Modules.reservations.render(document.getElementById('content-area'));
  },

  cancelRes(id) {
    const list = window.Storage.get('reservations') || [];
    const item = list.find(r => r.id === id);
    if (!item) return;

    window.UI.confirm(`Deseja realmente cancelar a reserva da área ${item.areaName}?`, () => {
      item.status = 'Cancelada';
      window.Storage.set('reservations', list);
      window.Audit.log('Cancelamento de Reserva', { id, area: item.areaName }, 'Reservas');
      window.UI.toast('Reserva cancelada.', 'info');
      Modules.reservations.render(document.getElementById('content-area'));
    });
  },

  modalNovaReserva() {
    const areas = window.Storage.get('common_areas') || [];
    const user = window.Auth.checkSession();

    const content = `
      <div class="form-group">
        <label class="form-label">Área Comum</label>
        <select id="res-area" class="form-control" onchange="Modules.reservations.updateFeeNotice()">
          ${areas.map(a => `<option value="${a.id}" data-fee="${a.fee}" data-cap="${a.capacity}">${a.name} (Capacidade: ${a.capacity} pessoas)</option>`).join('')}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Data Desejada</label>
          <input type="date" id="res-date" class="form-control" min="${new Date().toISOString().substring(0, 10)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Período / Horário</label>
          <select id="res-slot" class="form-control">
            <option value="10:00 às 16:00">Diurno (10:00 às 16:00)</option>
            <option value="17:00 às 22:00">Noturno (17:00 às 22:00)</option>
            <option value="10:00 às 22:00">Integral (10:00 às 22:00)</option>
          </select>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Número Estimado de Convidados</label>
          <input type="number" id="res-guests" class="form-control" value="15" min="1" />
        </div>
        <div class="form-group">
          <label class="form-label">Unidade Responsável</label>
          <input type="text" id="res-unit" class="form-control" value="${user?.unitId || 'A101'}" disabled />
        </div>
      </div>

      <div id="res-fee-box" style="background:#EFF6FF; border:1px solid #BFDBFE; padding:12px; border-radius:8px; font-size:13px; color:#1E40AF; margin-bottom:12px;">
        Taxa de uso: <b>R$ 200,00</b> (cobrada na próxima cota condominial).
      </div>
    `;

    window.UI.modal({
      title: 'Solicitação de Reserva de Espaço',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Confirmar Reserva',
          className: 'btn-primary',
          onClick: (close) => {
            const areaEl = document.getElementById('res-area');
            const areaId = areaEl.value;
            const areaObj = areas.find(a => a.id === areaId);
            const date = document.getElementById('res-date').value;
            const slot = document.getElementById('res-slot').value;
            const guests = parseInt(document.getElementById('res-guests').value) || 1;

            if (!date) {
              window.UI.toast('Informe a data da reserva.', 'warning');
              return;
            }

            if (guests > (areaObj?.capacity || 100)) {
              window.UI.toast(`A capacidade máxima deste espaço é de ${areaObj.capacity} pessoas.`, 'error');
              return;
            }

            const list = window.Storage.get('reservations') || [];
            list.unshift({
              id: 'res_' + Date.now(),
              areaId: areaId,
              areaName: areaObj.name,
              date: date,
              timeSlot: slot,
              guestsCount: guests,
              resident: user?.name || 'Ana Paula Ramos',
              unit: user?.unitId || 'A101',
              status: areaObj.autoApprove ? 'Confirmada' : 'Aguardando aprovação',
              fee: areaObj.fee,
              notes: 'Reserva pelo aplicativo'
            });
            window.Storage.set('reservations', list);
            window.Audit.log('Nova Reserva Solicitada', { area: areaObj.name, date }, 'Reservas');
            window.UI.toast('Reserva registrada com sucesso!', 'success');
            close();
            Modules.reservations.render(document.getElementById('content-area'));
          }
        }
      ]
    });
  },

  updateFeeNotice() {
    const areaEl = document.getElementById('res-area');
    const feeBox = document.getElementById('res-fee-box');
    if (!areaEl || !feeBox) return;
    const opt = areaEl.selectedOptions[0];
    const fee = parseFloat(opt.getAttribute('data-fee')) || 0;
    feeBox.innerHTML = `Taxa de uso: <b>${window.Security.maskMoney(fee)}</b> ${fee === 0 ? '(Espaço Gratuito)' : '(cobrada na próxima cota condominial)'}.`;
  }
};

window.Modules.occurrences = {
  render(container) {
    const list = window.Storage.get('occurrences') || [];
    const user = window.Auth.checkSession();
    const isSindico = user && ['SINDICO', 'SUPER_ADMIN'].includes(user.role);

    // Morador só enxerga as suas próprias ocorrências
    const visibleList = isSindico ? list : (user ? list.filter(o => (user.unitId && o.complainingUnit === user.unitId) || (user.name && o.resident === user.name)) : list);

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 class="card-title">${window.UI.icon('alert-triangle', 20)} Central de Ocorrências & Ouvidoria</h3>
          <p style="font-size:13px; color:var(--color-text-muted);">Registro e acompanhamento de chamados de barulho, animais, manutenção e segurança com SLA.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Modules.occurrences.modalNovaOcorrencia()">
          ${window.UI.icon('plus', 14)} Abrir Ocorrência
        </button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Categoria</th>
                <th>Título / Descrição</th>
                <th>Reclamante</th>
                <th>Data</th>
                <th>SLA Restante</th>
                <th>Status</th>
                <th class="no-sort">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${visibleList.map(o => `
                <tr>
                  <td><b>#${o.id}</b></td>
                  <td>${o.category}</td>
                  <td><b>${window.Security.sanitize(o.title)}</b><br><span style="font-size:12px; color:var(--color-text-muted);">${window.Security.sanitize(o.description.substring(0, 50))}...</span></td>
                  <td>${o.isAnonymous ? '<i>Anônimo</i>' : (o.resident + ' (' + o.complainingUnit + ')')}</td>
                  <td>${o.date}</td>
                  <td>
                    ${o.status === 'Resolvida' || o.status === 'Arquivada' ? '<span class="badge badge-success">Concluído</span>' : (
                      o.slaStatus === 'warning' ? '<span class="badge badge-warning">Atenção (12h)</span>' : '<span class="badge badge-success">No prazo (36h)</span>'
                    )}
                  </td>
                  <td>${window.UI.badge(o.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="Modules.occurrences.viewDetails('${o.id}')">
                      Ver Detalhes
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

  viewDetails(id) {
    const list = window.Storage.get('occurrences') || [];
    const item = list.find(o => o.id === id);
    if (!item) return;
    const user = window.Auth.checkSession();
    const isSindico = user && ['SINDICO', 'SUPER_ADMIN'].includes(user.role);

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;" class="grid-2">
        <div>
          <div style="margin-bottom:12px;">
            <span class="badge badge-info">${item.category}</span>
            <span class="badge badge-${item.priority === 'Urgente' ? 'danger' : 'warning'}">${item.priority}</span>
          </div>
          <h3 style="font-size:16px; font-weight:700; margin-bottom:8px;">${window.Security.sanitize(item.title)}</h3>
          <p style="font-size:13px; line-height:1.6; margin-bottom:14px;">${window.Security.sanitize(item.description)}</p>
          <div style="font-size:12px; color:var(--color-text-muted);">
            <div><b>Localização:</b> ${item.location}</div>
            <div><b>Unidade Infratora:</b> ${item.offendingUnit || 'Não especificada'}</div>
            <div><b>Data do Ocorrido:</b> ${item.date}</div>
            <div><b>Reclamante:</b> ${item.isAnonymous ? 'Anônimo (identidade protegida)' : item.resident}</div>
          </div>
        </div>

        <div>
          <h4 style="font-size:14px; font-weight:600; margin-bottom:10px;">Histórico & Providências</h4>
          <div style="max-height:180px; overflow-y:auto; margin-bottom:12px; border:1px solid var(--color-border); border-radius:8px; padding:10px;">
            ${(item.timeline || []).map(t => `
              <div style="font-size:12px; padding:6px 0; border-bottom:1px solid var(--color-border);">
                <div style="display:flex; justify-content:space-between; color:var(--color-text-muted);">
                  <b>${t.user}</b>
                  <span>${t.date}</span>
                </div>
                <div>${window.Security.sanitize(t.text)}</div>
              </div>
            `).join('')}
          </div>

          ${isSindico ? `
            <div class="form-group">
              <label class="form-label">Alterar Status</label>
              <select id="occ-status-sel" class="form-control">
                <option value="Aberta" ${item.status === 'Aberta' ? 'selected' : ''}>Aberta</option>
                <option value="Em análise" ${item.status === 'Em análise' ? 'selected' : ''}>Em análise</option>
                <option value="Em providência" ${item.status === 'Em providência' ? 'selected' : ''}>Em providência</option>
                <option value="Resolvida" ${item.status === 'Resolvida' ? 'selected' : ''}>Resolvida</option>
                <option value="Arquivada" ${item.status === 'Arquivada' ? 'selected' : ''}>Arquivada</option>
              </select>
            </div>
          ` : ''}

          <div class="form-group">
            <label class="form-label">Adicionar Parecer / Resposta</label>
            <div style="display:flex; gap:6px;">
              <input type="text" id="occ-reply-text" class="form-control" placeholder="Mensagem..." />
              <button class="btn btn-sm btn-secondary" onclick="Modules.occurrences.addReply('${item.id}')">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    window.UI.modal({
      title: `Ocorrência #${item.id}`,
      size: 'lg',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  addReply(id) {
    const input = document.getElementById('occ-reply-text');
    const statusSel = document.getElementById('occ-status-sel');
    if (!input || !input.value.trim()) return;

    const list = window.Storage.get('occurrences') || [];
    const item = list.find(o => o.id === id);
    if (!item) return;

    const user = window.Auth.checkSession();
    item.timeline = item.timeline || [];
    item.timeline.push({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: user?.name || 'Síndico',
      text: input.value.trim()
    });

    if (statusSel) {
      item.status = statusSel.value;
    }

    window.Storage.set('occurrences', list);
    window.Audit.log('Resposta em Ocorrência', { id, status: item.status }, 'Ocorrências');
    window.UI.toast('Resposta registrada com sucesso!', 'success');
    window.UI.closeModal();
    this.viewDetails(id);
    this.render(document.getElementById('content-area'));
  },

  modalNovaOcorrencia() {
    const user = window.Auth.checkSession();

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select id="new-occ-cat" class="form-control">
            <option value="Barulho">🔊 Barulho / Som Alto</option>
            <option value="Estacionamento">🚗 Estacionamento / Vagas</option>
            <option value="Animais">🐾 Animais de Estimação</option>
            <option value="Segurança">🔒 Segurança / Portas</option>
            <option value="Infraestrutura">🔧 Infraestrutura / Vazamento</option>
            <option value="Outros">📋 Outros Assuntos</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Unidade Infratora (se souber)</label>
          <input type="text" id="new-occ-offending" class="form-control" placeholder="Ex: B202" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Título da Ocorrência</label>
        <input type="text" id="new-occ-title" class="form-control" placeholder="Resumo do fato ocorrido" />
      </div>

      <div class="form-group">
        <label class="form-label">Local Exato</label>
        <input type="text" id="new-occ-loc" class="form-control" placeholder="Ex: Bloco A, 2º andar / Garagem Subsolo 1" />
      </div>

      <div class="form-group">
        <label class="form-label">Descrição Detalhada dos Fatos (mínimo 30 caracteres)</label>
        <textarea id="new-occ-desc" class="form-control" rows="3" placeholder="Descreva com detalhes data, hora, contexto e testemunhas..."></textarea>
      </div>

      <div class="form-group">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:600;">
          <input type="checkbox" id="new-occ-anon" /> Manter anonimato (minha identidade não será revelada)
        </label>
      </div>
    `;

    window.UI.modal({
      title: 'Registrar Nova Ocorrência / Reclamação',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Enviar Ocorrência',
          className: 'btn-primary',
          onClick: (close) => {
            const cat = document.getElementById('new-occ-cat').value;
            const offending = document.getElementById('new-occ-offending').value.trim();
            const title = document.getElementById('new-occ-title').value.trim();
            const loc = document.getElementById('new-occ-loc').value.trim();
            const desc = document.getElementById('new-occ-desc').value.trim();
            const isAnon = document.getElementById('new-occ-anon').checked;

            if (!title || desc.length < 20) {
              window.UI.toast('Preencha o título e forneça uma descrição detalhada.', 'warning');
              return;
            }

            const list = window.Storage.get('occurrences') || [];
            const newId = 'occ_' + Date.now();
            list.unshift({
              id: newId,
              category: cat,
              title: title,
              location: loc || 'Área comum',
              offendingUnit: offending || null,
              complainingUnit: user?.unitId || 'A101',
              resident: user?.name || 'Ana Paula Ramos',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              description: desc,
              priority: 'Media',
              isAnonymous: isAnon,
              status: 'Aberta',
              slaHoursLeft: 48,
              slaStatus: 'ok',
              photos: [],
              timeline: [
                {
                  date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  user: isAnon ? 'Anônimo' : (user?.name || 'Condômino'),
                  text: 'Ocorrência registrada no sistema'
                }
              ]
            });
            window.Storage.set('occurrences', list);

            window.Audit.log('Abertura de Ocorrência', { id: newId, cat }, 'Ocorrências');
            window.UI.toast('Ocorrência aberta e encaminhada ao Síndico!', 'success');
            close();
            Modules.occurrences.render(document.getElementById('content-area'));
          }
        }
      ]
    });
  }
};

window.Modules.registry = {
  currentTab: 'condominio',

  render(container, sub = null) {
    if (sub) this.currentTab = sub;

    container.innerHTML = `
      <div class="tabs-nav">
        <button class="tab-btn ${this.currentTab === 'condominio' ? 'active' : ''}" onclick="Modules.registry.switchTab('condominio')">
          ${window.UI.icon('building', 16)} Dados do Condomínio
        </button>
        <button class="tab-btn ${this.currentTab === 'unidades' ? 'active' : ''}" onclick="Modules.registry.switchTab('unidades')">
          ${window.UI.icon('home', 16)} Unidades (48 Apartamentos)
        </button>
        <button class="tab-btn ${this.currentTab === 'documentos' ? 'active' : ''}" onclick="Modules.registry.switchTab('documentos')">
          ${window.UI.icon('file-text', 16)} Biblioteca de Documentos Oficiais
        </button>
      </div>

      <div id="registry-tab-content"></div>
    `;

    this.renderTabContent();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    this.renderTabContent();
  },

  renderTabContent() {
    const el = document.getElementById('registry-tab-content');
    if (!el) return;
    if (this.currentTab === 'condominio') this.renderCondoData(el);
    else if (this.currentTab === 'unidades') this.renderUnits(el);
    else if (this.currentTab === 'documentos') this.renderDocuments(el);
  },

  renderCondoData(el) {
    const condo = window.Storage.get('condo') || {};

    el.innerHTML = `
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">
          ${window.UI.icon('building-2', 18)} Informações Cadastrais e Fiscais do Condomínio
        </h3>

        <div style="display:grid; grid-template-columns:2fr 1fr; gap:24px;" class="grid-2">
          <div>
            <div class="form-group">
              <label class="form-label">Razão Social</label>
              <input type="text" id="cd-name" class="form-control" value="${condo.name || ''}" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
              <div class="form-group">
                <label class="form-label">CNPJ (validação real)</label>
                <input type="text" id="cd-cnpj" class="form-control" value="${condo.cnpj || ''}" oninput="this.value = window.Security.maskCNPJ(this.value)" />
              </div>
              <div class="form-group">
                <label class="form-label">Plano CondoHub</label>
                <input type="text" class="form-control" value="${condo.plan || 'Profissional'}" disabled />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Endereço Completo</label>
              <input type="text" id="cd-addr" class="form-control" value="${condo.address || ''}" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;" class="grid-2">
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <input type="text" id="cd-city" class="form-control" value="${condo.city || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <input type="text" id="cd-state" class="form-control" value="${condo.state || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">CEP</label>
                <input type="text" id="cd-cep" class="form-control" value="${condo.cep || ''}" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
              <div class="form-group">
                <label class="form-label">Telefone Oficial</label>
                <input type="text" id="cd-phone" class="form-control" value="${condo.phone || ''}" oninput="this.value = window.Security.maskPhone(this.value)" />
              </div>
              <div class="form-group">
                <label class="form-label">E-mail Administrativo</label>
                <input type="email" id="cd-email" class="form-control" value="${condo.email || ''}" />
              </div>
            </div>

            <h4 style="font-size:14px; font-weight:600; margin:16px 0 10px;">Dados Bancários para Arrecadação</h4>
            <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:12px;" class="grid-2">
              <div class="form-group">
                <label class="form-label">Banco</label>
                <input type="text" id="cd-bank" class="form-control" value="${condo.bankName || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Agência</label>
                <input type="text" id="cd-agency" class="form-control" value="${condo.bankAgency || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Conta Corrente</label>
                <input type="text" id="cd-acc" class="form-control" value="${condo.bankAccount || ''}" />
              </div>
            </div>

            <button class="btn btn-primary" onclick="Modules.registry.saveCondoData()">
              ${window.UI.icon('save', 16)} Salvar Alterações
            </button>
          </div>

          <div>
            <div class="card" style="text-align:center; padding:24px;">
              <div style="width:100px; height:100px; border-radius:50%; background:var(--color-bg); border:2px dashed var(--color-border); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; color:var(--color-text-muted);">
                ${window.UI.icon('image', 32)}
              </div>
              <h4 style="font-size:14px; font-weight:600;">Logotipo do Condomínio</h4>
              <p style="font-size:12px; color:var(--color-text-muted); margin:4px 0 12px;">Formatos JPG, PNG ou SVG até 2MB.</p>
              <button class="btn btn-sm btn-outline" onclick="window.UI.toast('Upload de logo simulado!', 'info')">
                Escolher Arquivo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  saveCondoData() {
    const cnpj = document.getElementById('cd-cnpj').value.trim();
    if (!window.Security.validateCNPJ(cnpj)) {
      window.UI.toast('CNPJ informado é inválido!', 'error');
      return;
    }

    const condo = window.Storage.get('condo') || {};
    condo.name = document.getElementById('cd-name').value.trim();
    condo.cnpj = cnpj;
    condo.address = document.getElementById('cd-addr').value.trim();
    condo.city = document.getElementById('cd-city').value.trim();
    condo.state = document.getElementById('cd-state').value.trim();
    condo.cep = document.getElementById('cd-cep').value.trim();
    condo.phone = document.getElementById('cd-phone').value.trim();
    condo.email = document.getElementById('cd-email').value.trim();
    condo.bankName = document.getElementById('cd-bank').value.trim();
    condo.bankAgency = document.getElementById('cd-agency').value.trim();
    condo.bankAccount = document.getElementById('cd-acc').value.trim();

    window.Storage.set('condo', condo);
    window.Audit.log('Atualização Cadastral do Condomínio', { cnpj }, 'Cadastro');
    window.UI.toast('Dados do condomínio atualizados com sucesso!', 'success');
  },

  renderUnits(el) {
    const units = window.Storage.get('units') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('home', 18)} Relação de Unidades Autônomas (${units.length} Unidades)</h3>
          <span style="font-size:13px; color:var(--color-text-muted);">Blocos A, B, C, D • 12 unidades por bloco</span>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Unidade</th>
                <th>Bloco</th>
                <th>Área Privativa</th>
                <th>Fração Ideal</th>
                <th>Vagas</th>
                <th>Proprietário Titular</th>
                <th>Inquilino / Morador</th>
                <th>Status</th>
                <th class="no-sort">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${units.map(u => `
                <tr>
                  <td><b>${u.unit}</b></td>
                  <td>Bloco ${u.block}</td>
                  <td>${u.area} m²</td>
                  <td>${(u.fraction * 100).toFixed(4)}%</td>
                  <td>${u.spots ? u.spots.join(', ') : '—'}</td>
                  <td>${u.ownerName}</td>
                  <td>${u.tenantName || '—'}</td>
                  <td>${window.UI.badge(u.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="Modules.registry.editUnit('${u.id}')">
                      Editar
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

  editUnit(id) {
    const units = window.Storage.get('units') || [];
    const item = units.find(u => u.id === id);
    if (!item) return;

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Unidade</label>
          <input type="text" class="form-control" value="${item.unit}" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Status da Ocupação</label>
          <select id="u-status" class="form-control">
            <option value="Ocupada" ${item.status === 'Ocupada' ? 'selected' : ''}>Ocupada</option>
            <option value="Vaga" ${item.status === 'Vaga' ? 'selected' : ''}>Vaga</option>
            <option value="Em Reforma" ${item.status === 'Em Reforma' ? 'selected' : ''}>Em Reforma</option>
          </select>
        </div>
      </div>

      <h4 style="font-size:14px; font-weight:600; margin:12px 0 6px;">Dados do Proprietário</h4>
      <div class="form-group">
        <label class="form-label">Nome do Proprietário</label>
        <input type="text" id="u-owner-name" class="form-control" value="${item.ownerName || ''}" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">CPF (validação real)</label>
          <input type="text" id="u-owner-cpf" class="form-control" value="${item.ownerCpf || ''}" oninput="this.value = window.Security.maskCPF(this.value)" />
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input type="text" id="u-owner-phone" class="form-control" value="${item.ownerPhone || ''}" oninput="this.value = window.Security.maskPhone(this.value)" />
        </div>
      </div>

      <h4 style="font-size:14px; font-weight:600; margin:12px 0 6px;">Dados do Inquilino (se houver)</h4>
      <div class="form-group">
        <label class="form-label">Nome do Inquilino</label>
        <input type="text" id="u-tenant-name" class="form-control" value="${item.tenantName || ''}" />
      </div>
    `;

    window.UI.modal({
      title: `Editar Cadastro da Unidade ${item.unit}`,
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Salvar Unidade',
          className: 'btn-primary',
          onClick: (close) => {
            const cpf = document.getElementById('u-owner-cpf').value.trim();
            if (cpf && !window.Security.validateCPF(cpf)) {
              window.UI.toast('CPF do proprietário é inválido!', 'error');
              return;
            }

            item.status = document.getElementById('u-status').value;
            item.ownerName = document.getElementById('u-owner-name').value.trim();
            item.ownerCpf = cpf;
            item.ownerPhone = document.getElementById('u-owner-phone').value.trim();
            item.tenantName = document.getElementById('u-tenant-name').value.trim() || null;

            window.Storage.set('units', units);
            window.Audit.log('Edição de Unidade', { unit: item.unit }, 'Cadastro');
            window.UI.toast(`Unidade ${item.unit} atualizada!`, 'success');
            close();
            Modules.registry.renderUnits(document.getElementById('registry-tab-content'));
          }
        }
      ]
    });
  },

  renderDocuments(el) {
    const docs = window.Storage.get('documents') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('file-text', 18)} Acervo Digital de Documentos do Condomínio</h3>
          <button class="btn btn-primary btn-sm" onclick="window.UI.toast('Envio de novo documento aberto!', 'info')">
            ${window.UI.icon('upload', 14)} Enviar Documento
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Data de Upload</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Acesso Público?</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${docs.map(d => `
                <tr>
                  <td>
                    <b>${window.Security.sanitize(d.title)}</b><br>
                    <span style="font-size:11px; color:var(--color-text-muted);">${d.filename} (${d.size})</span>
                  </td>
                  <td>${d.category}</td>
                  <td>${d.uploadDate}</td>
                  <td>${d.expiresDate || 'Sem vencimento'}</td>
                  <td>${window.UI.badge(d.status)}</td>
                  <td>${d.isPublic ? '<span style="color:#0E9F6E; font-weight:600;">✓ Sim (Visível aos moradores)</span>' : '<span style="color:#64748B;">Apenas Administração</span>'}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="window.UI.toast('Iniciando download seguro do arquivo...', 'info')">
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

    if (window.lucide) window.lucide.createIcons();
  }
};
