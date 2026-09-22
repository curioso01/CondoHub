// MODULOS 1: DASHBOARD E FINANCEIRO

window.Modules = window.Modules || {};

window.Modules.dashboard = {
  render(container) {
    this.initCustomDates();
    const condo = window.Storage.get('condo') || {};
    const receivables = window.Storage.get('receivables') || [];
    const payables = window.Storage.get('payables') || [];
    const occurrences = window.Storage.get('occurrences') || [];
    const financialMonths = window.Storage.get('financial_months') || [];
    const auditLogs = window.Audit.getLogs();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const currentRef = `${currentYear}-${currentMonthNum}`;
    const nextMonthObj = new Date(currentYear, now.getMonth() + 1, 1);
    const nextYear = nextMonthObj.getFullYear();
    const nextMonthNum = String(nextMonthObj.getMonth() + 1).padStart(2, '0');
    const nextRef = `${nextYear}-${nextMonthNum}`;

    const monthAbbrNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthLabel = monthAbbrNames[now.getMonth()];
    const nextMonthLabel = monthAbbrNames[nextMonthObj.getMonth()];

    // 1. Inadimplência
    const currentMonthRec = receivables.filter(r => r.ref === currentRef);
    const overdue = currentMonthRec.filter(r => r.status === 'Vencido');
    const totalUnits = condo.totalUnits || 48;
    const inadimplenciaPercent = ((overdue.length / totalUnits) * 100).toFixed(1);

    // 2. Caixa Atual
    const totalRevenue = financialMonths.reduce((acc, m) => acc + (m.revenue || 0), 0);
    const totalExpenses = financialMonths.reduce((acc, m) => acc + (m.expenses || 0), 0);
    const caixaAtual = totalRevenue - totalExpenses;

    // 3. Ocorrências Abertas
    const openOcc = occurrences.filter(o => o.status !== 'Resolvida' && o.status !== 'Arquivada');
    const hasUrgent = openOcc.some(o => o.priority === 'Urgente');

    // 4. Próximo Vencimento em Massa
    const nextDueList = receivables.filter(r => r.ref === nextRef);
    const nextDueTotal = nextDueList.length > 0
      ? nextDueList.reduce((acc, r) => acc + (r.amount || 0), 0)
      : (totalUnits * 800);

    // Cálculos dinâmicos para os Anéis Luminescentes
    const paidCurrent = currentMonthRec.filter(r => r.status === 'Pago').length;
    const adimplenciaRingPct = currentMonthRec.length > 0 ? Math.round((paidCurrent / currentMonthRec.length) * 100) : 96;

    const pendPayables = payables.filter(p => p.status !== 'Pago').reduce((acc, p) => acc + (p.amount || 0), 0);
    const liquidezRingPct = pendPayables > 0 ? Math.min(100, Math.round((Math.max(0, caixaAtual) / (pendPayables + 10000)) * 100)) : 92;

    // Dados para os 3 novos cards operacionais do Dashboard
    const allOverdue = receivables.filter(r => r.status === 'Vencido');
    const upcomingMaint = (window.Storage.get('preventive_maintenance') || []).slice(0, 3);
    const todayDateStr = now.toISOString().substring(0, 10);
    const todayReservations = (window.Storage.get('reservations') || []).filter(r => r.date === todayDateStr);

    container.innerHTML = `
      <!-- KPIS -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:24px;" class="grid-4">
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Inadimplência (${currentMonthLabel})</span>
              <h3 style="font-size:24px; font-weight:700; margin-top:4px; color:var(--color-danger);">${inadimplenciaPercent}%</h3>
              <p style="font-size:12px; color:var(--color-text-muted); margin-top:2px;">${overdue.length} unidades de ${totalUnits} <span style="color:var(--color-secondary); font-weight:600;">(Tempo real)</span></p>
            </div>
            <div style="width:40px; height:40px; border-radius:8px; background:#FDE8E8; display:flex; align-items:center; justify-content:center; color:var(--color-danger);">
              ${window.UI.icon('alert-triangle', 20)}
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Saldo em Caixa</span>
              <h3 style="font-size:24px; font-weight:700; margin-top:4px; color:var(--color-secondary);">${window.Security.maskMoney(caixaAtual)}</h3>
              <p style="font-size:12px; color:var(--color-secondary); margin-top:2px; font-weight:600;">↑ Superávit acumulado</p>
            </div>
            <div style="width:40px; height:40px; border-radius:8px; background:#DEF7EC; display:flex; align-items:center; justify-content:center; color:var(--color-secondary);">
              ${window.UI.icon('wallet', 20)}
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Ocorrências Ativas</span>
              <h3 style="font-size:24px; font-weight:700; margin-top:4px; color:var(--color-text);">${openOcc.length}</h3>
              <p style="font-size:12px; margin-top:2px;">
                ${hasUrgent ? '<span class="badge badge-danger badge-urgent-pulse">1 Urgente pendente</span>' : '<span style="color:var(--color-secondary); font-weight:600;">Todas em prazo SLA</span>'}
              </p>
            </div>
            <div style="width:40px; height:40px; border-radius:8px; background:#FEF08A; display:flex; align-items:center; justify-content:center; color:#B45309;">
              ${window.UI.icon('message-square', 20)}
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Próximo Ciclo (${nextMonthLabel})</span>
              <h3 style="font-size:24px; font-weight:700; margin-top:4px; color:var(--color-primary);">${window.Security.maskMoney(nextDueTotal)}</h3>
              <p style="font-size:12px; color:var(--color-text-muted); margin-top:2px;">Vencimento em <b>10/${nextMonthNum}/${nextYear}</b></p>
            </div>
            <div style="width:40px; height:40px; border-radius:8px; background:#E1EFFE; display:flex; align-items:center; justify-content:center; color:var(--color-primary);">
              ${window.UI.icon('calendar', 20)}
            </div>
          </div>
        </div>
      </div>

      <!-- ALERTAS CRÍTICOS -->
      <div class="card card-warning-alert">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <span style="color:#D97706; display:flex;">${window.UI.icon('alert-circle', 20)}</span>
          <h4 style="font-size:15px; font-weight:600; color:#92400E;">Alertas do Condomínio em Destaque</h4>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;" class="grid-2">
          <div class="alert-item-box">
            <span style="font-size:11px; font-weight:700; color:#DC2626; text-transform:uppercase;">Boletos Vencidos > 30 Dias</span>
            <p style="font-size:13px; font-weight:600; margin-top:4px;">Unidade A202 (R$ 1.600,00)</p>
            <button class="btn btn-sm btn-outline" style="margin-top:8px;" onclick="Router.navigate('financial', 'receber')">Acessar Cobrança</button>
          </div>
          <div class="alert-item-box">
            <span style="font-size:11px; font-weight:700; color:#D97706; text-transform:uppercase;">Manutenção Preventiva</span>
            <p style="font-size:13px; font-weight:600; margin-top:4px;">Extintores e Bombas vencem em 5 dias</p>
            <button class="btn btn-sm btn-outline" style="margin-top:8px;" onclick="Router.navigate('maintenance', 'preventiva')">Ver Preventiva</button>
          </div>
          <div class="alert-item-box">
            <span style="font-size:11px; font-weight:700; color:#2563EB; text-transform:uppercase;">Assembleia Prevista</span>
            <p style="font-size:13px; font-weight:600; margin-top:4px;">AGO ${currentYear} convocada para 15/${nextMonthNum}</p>
            <button class="btn btn-sm btn-outline" style="margin-top:8px;" onclick="Router.navigate('assemblies')">Ver Edital</button>
          </div>
        </div>
      </div>

      <!-- PAINEL ANALÍTICO MODERNO (HIGH-TECH DASHBOARD ADAPTATIVO) -->
      <div class="analytics-panel">
        <!-- Efeito sutil de iluminação ambiente no fundo -->
        <div style="position:absolute; top:-60px; left:10%; width:300px; height:180px; background:radial-gradient(circle, rgba(255,42,133,0.12) 0%, transparent 70%); pointer-events:none; filter:blur(40px);"></div>
        <div style="position:absolute; top:-60px; right:15%; width:300px; height:180px; background:radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%); pointer-events:none; filter:blur(40px);"></div>

        <!-- INDICADORES EM ANÉIS LUMINOSOS (SEM TÍTULO STEP) -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding-bottom:18px; margin-bottom:20px; border-bottom:1px solid;" class="analytics-border">
          <!-- 1: ADIMPLÊNCIA -->
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; min-width:110px;">
            <div class="ring-circle ring-1">
              <span id="ring-val-1" class="ring-percentage">${adimplenciaRingPct}%</span>
            </div>
            <span class="ring-label">Adimplência</span>
          </div>

          <div class="step-connector"></div>

          <!-- 2: LIQUIDEZ ATIVA -->
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; min-width:110px;">
            <div class="ring-circle ring-2">
              <span id="ring-val-2" class="ring-percentage">${liquidezRingPct}%</span>
            </div>
            <span class="ring-label">Liquidez Ativa</span>
          </div>

          <div class="step-connector"></div>

          <!-- 3: ORÇADO EXECUTADO -->
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; min-width:110px;">
            <div class="ring-circle ring-3">
              <span id="ring-val-3" class="ring-percentage">68%</span>
            </div>
            <span class="ring-label">Orçado Executado</span>
          </div>

          <div class="step-connector"></div>

          <!-- 4: FUNDO RESERVA -->
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; min-width:110px;">
            <div class="ring-circle ring-4">
              <span id="ring-val-4" class="ring-percentage">18%</span>
            </div>
            <span class="ring-label">Fundo Reserva</span>
          </div>
        </div>

        <!-- GRID PRINCIPAL DE GRÁFICOS CORRETAMENTE POSICIONADO -->
        <div class="analytics-grid">
          
          <!-- GRÁFICO 1: ONDAS MULTICAMADAS COM FILTRO DINÂMICO DIA / MÊS / ANO -->
          <div class="analytics-card" style="justify-content:space-between;">
            <!-- Topo: Título + Seletor de Período -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:10px;">
              <div>
                <h3 class="analytics-title" style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px; margin:0;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#FF2A85; box-shadow:0 0 8px #FF2A85;"></span>
                  Fluxo Financeiro & Ondas de Performance
                </h3>
                <p id="flow-subtitle" class="analytics-subtitle" style="font-size:12px; margin-top:3px; margin-bottom:0;">
                  Receitas vs Despesas vs Meta — Últimos 6 Meses
                </p>
              </div>

              <!-- CONTROLE DINÂMICO: DIA / MÊS / ANO / PERSONALIZADO -->
              <div class="period-toggle-group">
                <button id="btn-period-dia" class="period-toggle-btn ${this.currentPeriod === 'dia' ? 'active' : ''}" onclick="Modules.dashboard.setPeriod('dia')">Dia</button>
                <button id="btn-period-mes" class="period-toggle-btn ${this.currentPeriod === 'mes' ? 'active' : ''}" onclick="Modules.dashboard.setPeriod('mes')">Mês</button>
                <button id="btn-period-ano" class="period-toggle-btn ${this.currentPeriod === 'ano' ? 'active' : ''}" onclick="Modules.dashboard.setPeriod('ano')">Ano</button>
                <button id="btn-period-custom" class="period-toggle-btn ${this.currentPeriod === 'custom' ? 'active' : ''}" onclick="Modules.dashboard.toggleCustomPeriod()">
                  <span style="display:inline-flex; align-items:center; gap:5px;">
                    ${window.UI.icon('calendar', 12)}
                    <span>Personalizado</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- BARRA DE SELEÇÃO DE PERÍODO PERSONALIZADO -->
            <div id="custom-period-bar" class="custom-period-bar" style="display:${this.currentPeriod === 'custom' ? 'flex' : 'none'};">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); display:flex; align-items:center; gap:4px;">
                  ${window.UI.icon('calendar', 13)} De:
                </span>
                <input type="date" id="chart-custom-start" class="form-control" style="width:138px; height:32px; padding:4px 8px; font-size:12px;" value="${this.customStartDate || ''}" />
                
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted);">Até:</span>
                <input type="date" id="chart-custom-end" class="form-control" style="width:138px; height:32px; padding:4px 8px; font-size:12px;" value="${this.customEndDate || ''}" />

                <button type="button" class="btn btn-sm btn-primary" style="height:32px; padding:0 12px; font-size:12px; display:inline-flex; align-items:center; gap:5px;" onclick="Modules.dashboard.applyCustomPeriod()">
                  ${window.UI.icon('filter', 13)} Filtrar
                </button>
              </div>

              <!-- ATALHOS RÁPIDOS (PRESETS) -->
              <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); margin-right:2px;">Atalhos:</span>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('15d')">15d</button>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('30d')">30d</button>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('3m')">3 meses</button>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('6m')">6 meses</button>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('12m')">12 meses</button>
                <button type="button" class="custom-period-preset-btn" onclick="Modules.dashboard.setCustomPreset('ytd')">Este Ano</button>
              </div>
            </div>

            <!-- Sub-topo: Legenda e Callouts perfeitamente alinhados -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid;" class="analytics-border">
              <!-- Legenda em pílulas -->
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:14px; font-size:11px;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="width:12px; height:4px; background:#FF2A85; border-radius:2px; box-shadow:0 0 6px #FF2A85;"></span>
                  <span class="bar-item-label">Receitas</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span id="legend-dot-exp" style="width:12px; height:4px; background:#00E5FF; border-radius:2px;"></span>
                  <span class="bar-item-label">Despesas</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="width:12px; height:0; border-top:2px dashed #FFB800;"></span>
                  <span id="legend-label-target" class="bar-item-label">Meta Fixa</span>
                </div>
              </div>

              <!-- Tags Flutuantes (Callouts de Pico) -->
              <div style="display:flex; gap:8px;">
                <div id="flow-callout-high" class="callout-pill peak">
                  <span>▲ R$ 39.6k</span> <span style="opacity:0.85; font-size:9px;">RECORDE</span>
                </div>
                <div id="flow-callout-low" class="callout-pill lowest">
                  <span>▼ R$ 29.8k</span> <span style="opacity:0.85; font-size:9px;">CUSTO MÍN</span>
                </div>
              </div>
            </div>

            <!-- Container do Canvas: Posicionamento fixo, sem overflow e com altura ideal -->
            <div style="height:255px; position:relative; width:100%; min-width:0; margin-top:auto;">
              <canvas id="chart-revenue-expenses"></canvas>
            </div>
          </div>

          <!-- GRÁFICO 2: ROSCA HOLOGRÁFICA COM BARRAS NUMERADAS 01..05 -->
          <div class="analytics-card" style="justify-content:space-between;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 class="analytics-title" style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px; margin:0;">
                <span style="width:8px; height:8px; border-radius:50%; background:#FFB800; box-shadow:0 0 8px #FFB800;"></span>
                Distribuição de Custos
              </h3>
              <span id="costs-period-badge" class="badge-period" style="font-size:11px; padding:3px 10px; border-radius:12px; font-weight:600;">Últimos 6 Meses</span>
            </div>

            <div style="display:grid; grid-template-columns:130px 1fr; gap:16px; align-items:center; flex:1; padding:6px 0;">
              <!-- ROSCA COM MÉTRICA CENTRAL -->
              <div style="position:relative; width:130px; height:130px; margin:0 auto; flex-shrink:0;">
                <canvas id="chart-expenses-pie"></canvas>
                <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
                  <span id="donut-center-pct" class="donut-center-value" style="font-size:20px; font-weight:800; line-height:1;">68%</span>
                  <span class="analytics-subtitle" style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px;">Executado</span>
                </div>
              </div>

              <!-- BARRAS NUMERADAS 01..05 -->
              <div id="costs-bars-container" style="display:flex; flex-direction:column; gap:8px;">
                <!-- Preenchido dinamicamente via renderCostBars() -->
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- CARDS OPERACIONAIS DE GESTÃO DIÁRIA -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;" class="grid-3">
        <!-- 1. INADIMPLENTES DO MÊS -->
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
          <div class="card-header" style="padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--color-danger); display:flex;">${window.UI.icon('alert-octagon', 18)}</span>
              <h3 class="card-title" style="font-size:14px; font-weight:700;">Inadimplentes do Mês</h3>
            </div>
            <span class="badge badge-danger" style="font-size:11px;">${allOverdue.length} ${allOverdue.length === 1 ? 'unidade' : 'unidades'}</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:260px;">
            ${allOverdue.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--color-text-muted); font-size:12px;">
                <div style="color:var(--color-secondary); display:flex; justify-content:center; margin-bottom:6px;">
                  ${window.UI.icon('check-circle', 28)}
                </div>
                <p style="font-weight:600; margin:0 0 2px;">Nenhum boleto vencido!</p>
                <span>A inadimplência do condomínio está sob controle.</span>
              </div>
            ` : allOverdue.map(r => `
              <div style="padding:10px; border-radius:6px; background:var(--color-bg); border:1px solid var(--color-border); display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <span style="font-weight:700; font-size:13px; color:var(--color-text);">Apto ${r.unit}</span>
                    <span style="font-size:12px; color:var(--color-text-muted); margin-left:4px;">— ${window.Security.sanitize(r.resident)}</span>
                  </div>
                  <b style="font-size:13px; color:var(--color-danger);">${window.Security.maskMoney(r.amount)}</b>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--color-text-muted);">
                  <span>Venc: <b>${r.dueDate}</b></span>
                  <button class="btn btn-sm btn-outline" style="color:#059669; border-color:#059669; background:rgba(5,150,105,0.06); padding:3px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px;" onclick="Modules.dashboard.simulateWhatsAppCharge('${r.unit}', '${encodeURIComponent(r.resident)}', ${r.amount})">
                    ${window.UI.icon('message-circle', 12)} Cobrar via WhatsApp (simulado)
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. PRÓXIMAS MANUTENÇÕES -->
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
          <div class="card-header" style="padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#7C3AED; display:flex;">${window.UI.icon('wrench', 18)}</span>
              <h3 class="card-title" style="font-size:14px; font-weight:700;">Próximas Manutenções</h3>
            </div>
            <button class="btn btn-ghost btn-sm" style="font-size:11px; padding:2px 6px;" onclick="Router.navigate('maintenance')">Ver todas</button>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:260px;">
            ${upcomingMaint.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--color-text-muted); font-size:12px;">
                <p>Nenhuma manutenção preventiva cadastrada.</p>
              </div>
            ` : upcomingMaint.map(pm => `
              <div style="padding:10px; border-radius:6px; background:var(--color-bg); border:1px solid var(--color-border); display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <b style="font-size:12px; color:var(--color-text); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:180px;">${window.Security.sanitize(pm.equipment)}</b>
                  <span class="badge ${pm.status === 'Em dia' ? 'badge-success' : (pm.status === 'Proximo' ? 'badge-warning' : 'badge-danger')}" style="font-size:10px;">${pm.status}</span>
                </div>
                <div style="font-size:11px; color:var(--color-text-muted); display:flex; justify-content:space-between; align-items:center;">
                  <span>Fornecedor: <b>${window.Security.sanitize(pm.supplier || 'Interno')}</b></span>
                  <span>Previsto: <b>${pm.nextDate}</b></span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. RESERVAS DE HOJE -->
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
          <div class="card-header" style="padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#2563EB; display:flex;">${window.UI.icon('calendar', 18)}</span>
              <h3 class="card-title" style="font-size:14px; font-weight:700;">Reservas de Hoje</h3>
            </div>
            <button class="btn btn-ghost btn-sm" style="font-size:11px; padding:2px 6px;" onclick="Router.navigate('reservations')">Agenda</button>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:260px;">
            ${todayReservations.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--color-text-muted); font-size:12px;">
                <div style="color:var(--color-primary); display:flex; justify-content:center; margin-bottom:6px;">
                  ${window.UI.icon('calendar', 28)}
                </div>
                <p style="font-weight:600; margin:0 0 2px;">Nenhuma reserva hoje</p>
                <span>Todas as áreas sociais estão livres para uso comum.</span>
              </div>
            ` : todayReservations.map(res => `
              <div style="padding:10px; border-radius:6px; background:var(--color-bg); border:1px solid var(--color-border); display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <b style="font-size:13px; color:var(--color-text);">${window.Security.sanitize(res.areaName || 'Área Comum')}</b>
                  <span class="badge badge-info" style="font-size:10px;">${res.status}</span>
                </div>
                <div style="font-size:12px; color:var(--color-text-muted);">
                  Horário: <b>${res.timeSlot}</b>
                </div>
                <div style="font-size:11px; color:var(--color-text-muted); display:flex; justify-content:space-between;">
                  <span>Solicitante: <b>${window.Security.sanitize(res.resident)}</b> (Unid. ${res.unit})</span>
                  ${res.fee > 0 ? `<span style="font-weight:600; color:var(--color-text);">${window.Security.maskMoney(res.fee)}</span>` : '<span style="color:var(--color-secondary);">Gratuito</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ATIVIDADES RECENTES -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${window.UI.icon('activity', 18)} Feed de Atividades Recentes</h3>
          <button class="btn btn-sm btn-outline" onclick="Modules.dashboard.showAllActivities()">Ver todas as atividades</button>
        </div>
        <div>
          ${auditLogs.slice(0, 8).map(log => {
            const rawDetails = window.Audit.formatDetails ? window.Audit.formatDetails(log.details) : (log.details || '');
            const safeDetails = window.Security.sanitize(rawDetails);
            return `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--color-border);">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:32px; height:32px; border-radius:6px; background:var(--color-bg); display:flex; align-items:center; justify-content:center; color:var(--color-primary);">
                  ${window.UI.icon('check', 16)}
                </div>
                <div>
                  <div style="font-weight:600; font-size:13px;">
                    ${window.Security.sanitize(log.action)}
                    ${safeDetails ? `<span style="font-weight:400; color:var(--color-text-muted);"> — ${safeDetails}</span>` : ''}
                  </div>
                  <div style="font-size:11px; color:var(--color-text-muted);">${window.Security.sanitize(log.userName)} (${log.role}) • Módulo: ${log.module}</div>
                </div>
              </div>
              <div style="font-size:12px; color:var(--color-text-muted); white-space:nowrap;">
                ${log.timestamp}
              </div>
            </div>
          `;}).join('')}
        </div>
      </div>
    `;

    // Registra listener de tema para atualizar gráficos dinamicamente no toggle Dark/Light
    if (!this._themeListenerRegistered) {
      this._themeListenerRegistered = true;
      window.addEventListener('themechange', () => {
        if (document.getElementById('chart-revenue-expenses')) {
          this.initCharts();
        }
      });
    }

    // Registra listener de alteração financeira para atualizar dashboard em tempo real
    if (!this._financialListenerRegistered) {
      this._financialListenerRegistered = true;
      const onFinancialChange = () => {
        const flowChart = document.getElementById('chart-revenue-expenses');
        if (flowChart) {
          // Se o dashboard está visível na tela, re-renderiza para atualizar KPIs, anéis e gráficos
          const mainContent = document.getElementById('main-content');
          if (mainContent && window.Router && window.Router.currentModule === 'dashboard') {
            this.render(mainContent);
          } else {
            this.initCharts();
          }
        }
      };
      window.addEventListener('condohub_financial_change', onFinancialChange);
      window.addEventListener('condohub_storage', (e) => {
        if (e.detail && (e.detail.key === 'receivables' || e.detail.key === 'payables' || e.detail.key === 'financial_months')) {
          onFinancialChange();
        }
      });
    }

    // Inicialização Chart.js
    setTimeout(() => {
      this.initCharts();
    }, 50);
  },

  currentPeriod: 'mes',
  customStartDate: null,
  customEndDate: null,

  initCustomDates() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    if (!this.customEndDate) {
      this.customEndDate = `${yyyy}-${mm}-${dd}`;
    }
    if (!this.customStartDate) {
      // Padrão: 30 dias atrás
      const past = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const pY = past.getFullYear();
      const pM = String(past.getMonth() + 1).padStart(2, '0');
      const pD = String(past.getDate()).padStart(2, '0');
      this.customStartDate = `${pY}-${pM}-${pD}`;
    }
  },

  toggleCustomPeriod() {
    this.initCustomDates();
    if (this.currentPeriod !== 'custom') {
      this.setPeriod('custom');
    } else {
      const bar = document.getElementById('custom-period-bar');
      if (bar) {
        bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
      }
    }
  },

  setPeriod(period) {
    this.currentPeriod = period;

    const bar = document.getElementById('custom-period-bar');
    if (bar) {
      bar.style.display = (period === 'custom') ? 'flex' : 'none';
      if (period === 'custom') {
        const startInput = document.getElementById('chart-custom-start');
        const endInput = document.getElementById('chart-custom-end');
        if (startInput && !startInput.value) startInput.value = this.customStartDate;
        if (endInput && !endInput.value) endInput.value = this.customEndDate;
      }
    }

    // Atualiza classes ativas dos botões
    ['dia', 'mes', 'ano', 'custom'].forEach(p => {
      const btn = document.getElementById('btn-period-' + p);
      if (btn) {
        if (p === period) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    this.initCharts();
  },

  applyCustomPeriod() {
    const startInput = document.getElementById('chart-custom-start');
    const endInput = document.getElementById('chart-custom-end');
    if (!startInput || !endInput) return;

    let startVal = startInput.value;
    let endVal = endInput.value;

    if (!startVal || !endVal) {
      if (window.UI && window.UI.toast) {
        window.UI.toast('Selecione as datas inicial e final para filtrar', 'warning');
      }
      return;
    }

    if (startVal > endVal) {
      const temp = startVal;
      startVal = endVal;
      endVal = temp;
      startInput.value = startVal;
      endInput.value = endVal;
      if (window.UI && window.UI.toast) {
        window.UI.toast('Data inicial ajustada para ser anterior à final', 'info');
      }
    }

    this.customStartDate = startVal;
    this.customEndDate = endVal;
    this.setPeriod('custom');

    if (window.UI && window.UI.toast) {
      window.UI.toast('Período personalizado aplicado no gráfico', 'success');
    }
  },

  setCustomPreset(preset) {
    this.initCustomDates();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let startDate = new Date();
    if (preset === '15d') {
      startDate = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));
    } else if (preset === '30d') {
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    } else if (preset === '3m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (preset === '6m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    } else if (preset === '12m') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else if (preset === 'ytd') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const startY = startDate.getFullYear();
    const startM = String(startDate.getMonth() + 1).padStart(2, '0');
    const startD = String(startDate.getDate()).padStart(2, '0');
    const startStr = `${startY}-${startM}-${startD}`;

    this.customStartDate = startStr;
    this.customEndDate = todayStr;

    const startInput = document.getElementById('chart-custom-start');
    const endInput = document.getElementById('chart-custom-end');
    if (startInput) startInput.value = startStr;
    if (endInput) endInput.value = todayStr;

    this.setPeriod('custom');
  },

  getPeriodData() {
    const period = this.currentPeriod || 'mes';
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const currentYear = now.getFullYear();

    const receivables = (window.Storage && window.Storage.get('receivables')) || [];
    const payables = (window.Storage && window.Storage.get('payables')) || [];
    const financialMonths = (window.Storage && window.Storage.get('financial_months')) || [];

    // Categorias de despesas com distribuição dinâmica calculada sobre payables pagos
    const catMap = {
      manutencao: { num: '01', name: 'Manutenção & Reparos', total: 0, color: '#FF2A85', grad: 'linear-gradient(90deg, #FF2A85, #F43F5E)' },
      seguranca: { num: '02', name: 'Segurança & Portaria', total: 0, color: '#00B4D8', grad: 'linear-gradient(90deg, #00B4D8, #38BDF8)' },
      limpeza: { num: '03', name: 'Limpeza & Higiene', total: 0, color: '#FFB800', grad: 'linear-gradient(90deg, #FFB800, #F59E0B)' },
      adm: { num: '04', name: 'Administração & Jurídico', total: 0, color: '#A855F7', grad: 'linear-gradient(90deg, #A855F7, #6366F1)' },
      outros: { num: '05', name: 'Fundo Reserva & Outros', total: 0, color: '#10B981', grad: 'linear-gradient(90deg, #10B981, #059669)' }
    };

    payables.forEach(p => {
      const cat = (p.category || '').toLowerCase();
      const amt = Number(p.amount) || 0;
      if (cat.includes('manuten') || cat.includes('obra')) catMap.manutencao.total += amt;
      else if (cat.includes('seguran') || cat.includes('portar')) catMap.seguranca.total += amt;
      else if (cat.includes('limpez') || cat.includes('conserva')) catMap.limpeza.total += amt;
      else if (cat.includes('admin') || cat.includes('juríd') || cat.includes('honor')) catMap.adm.total += amt;
      else catMap.outros.total += amt;
    });

    const totalExpAll = Object.values(catMap).reduce((acc, c) => acc + c.total, 0) || 1;
    const catList = Object.values(catMap);
    let doughnutData = catList.map(c => Math.max(5, Math.round((c.total / totalExpAll) * 100)));
    const sumPct = doughnutData.reduce((a, b) => a + b, 0);
    if (sumPct > 0) {
      doughnutData = doughnutData.map(val => Math.round((val / sumPct) * 100));
    }
    const costBars = catList.map((c, idx) => ({
      num: c.num,
      name: c.name,
      pct: doughnutData[idx] || 20,
      color: c.color,
      grad: c.grad
    }));

    if (period === 'dia') {
      // Últimos 7 dias reais baseados no new Date()
      const daysLabels = [];
      const daysRevenue = [];
      const daysExpenses = [];
      const daysTarget = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;

        const isToday = (i === 0);
        const dayLabel = isToday ? `Hoje (${dd})` : `${dd}/${monthNames[d.getMonth()]}`;
        daysLabels.push(dayLabel);

        // Soma recebimentos reais com paidAt nesta data
        const dayRec = receivables.filter(r => r.status === 'Pago' && (r.paidAt === isoDate || r.due === isoDate))
          .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        // Despesas reais pagas nesta data
        const dayPay = payables.filter(p => p.status === 'Pago' && (p.paidAt === isoDate || p.due === isoDate))
          .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        // Dados consistentes para visualização fluida e orgânica do fluxo diário
        const baselineRec = [2800, 4200, 3100, 4900, 3600, 2400, 3800][6 - i];
        const baselinePay = [1600, 2100, 2900, 1800, 2400, 1100, 1700][6 - i];

        daysRevenue.push(dayRec > 0 ? dayRec : baselineRec);
        daysExpenses.push(dayPay > 0 ? dayPay : baselinePay);
        daysTarget.push(3000);
      }

      const maxRev = Math.max(...daysRevenue);
      const minExp = Math.min(...daysExpenses);
      const totalRevWeek = daysRevenue.reduce((a, b) => a + b, 0);
      const totalTargetWeek = daysTarget.reduce((a, b) => a + b, 0);
      const execPct = Math.round((totalRevWeek / totalTargetWeek) * 100);

      return {
        labels: daysLabels,
        revenue: daysRevenue,
        expenses: daysExpenses,
        target: daysTarget,
        targetVal: 'R$ 3.0k',
        targetLabel: 'Meta Diária',
        yMax: Math.max(...daysRevenue, ...daysExpenses) + 1500,
        yCallback: (val) => 'R$ ' + (val / 1000).toFixed(1) + 'k',
        subtitle: 'Fluxo diário dos últimos 7 dias — Conciliação contínua e em tempo real',
        calloutHigh: { val: `▲ R$ ${(maxRev / 1000).toFixed(1)}k`, label: 'PICO DIA' },
        calloutLow: { val: `▼ R$ ${minExp >= 1000 ? (minExp / 1000).toFixed(1) + 'k' : minExp}`, label: 'MENOR CUSTO' },
        periodBadge: 'Últimos 7 dias',
        executedPct: `${execPct}%`,
        doughnutData: doughnutData,
        costBars: costBars
      };
    } else if (period === 'ano') {
      // 4 anos reais centralizados no ano corrente
      const yearStart = currentYear - 3;
      const yearsLabels = [
        String(yearStart),
        String(yearStart + 1),
        String(yearStart + 2),
        `${currentYear} (Atual)`
      ];

      // Acumulados anuais dinâmicos
      const annualRev = [418000, 442000, 458000];
      const annualExp = [382000, 408000, 419000];

      // Ano atual consolidado de financialMonths e transações
      const curYearRev = financialMonths.filter(m => m.month && m.month.startsWith(String(currentYear)))
        .reduce((acc, m) => acc + (m.revenue || 0), 0) || 472000;
      const curYearExp = financialMonths.filter(m => m.month && m.month.startsWith(String(currentYear)))
        .reduce((acc, m) => acc + (m.expenses || 0), 0) || 426000;

      annualRev.push(curYearRev);
      annualExp.push(curYearExp);
      const targetAnnual = [440000, 440000, 450000, 460000];

      const maxYear = Math.max(...annualRev);
      const minYearExp = Math.min(...annualExp);
      const execPctYear = Math.round((curYearRev / 460000) * 100);

      return {
        labels: yearsLabels,
        revenue: annualRev,
        expenses: annualExp,
        target: targetAnnual,
        targetVal: 'R$ 460k',
        targetLabel: 'Meta Anual',
        yMax: Math.max(...annualRev, ...annualExp) + 50000,
        yCallback: (val) => 'R$ ' + Math.round(val / 1000) + 'k',
        subtitle: `Consolidado anual — Histórico financeiro e projeção orçamentária ${currentYear}`,
        calloutHigh: { val: `▲ R$ ${Math.round(maxYear / 1000)}k`, label: 'RECORDE ANUAL' },
        calloutLow: { val: `▼ R$ ${Math.round(minYearExp / 1000)}k`, label: 'BASE HISTÓRICA' },
        periodBadge: `Consolidado Anual (${currentYear})`,
        executedPct: `${execPctYear}%`,
        doughnutData: doughnutData,
        costBars: costBars
      };
    } else if (period === 'custom') {
      this.initCustomDates();
      const startStr = this.customStartDate;
      const endStr = this.customEndDate;
      const startD = new Date(startStr + 'T00:00:00');
      const endD = new Date(endStr + 'T23:59:59');

      const formatDateBR = (d) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      const diffTime = Math.max(0, endD.getTime() - startD.getTime());
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

      // Filtro de despesas no período selecionado para rosca e barras
      const periodPayables = payables.filter(p => {
        const d = p.paidAt || p.due;
        return d && d >= startStr && d <= endStr;
      });

      const customCatMap = {
        manutencao: { num: '01', name: 'Manutenção & Reparos', total: 0, color: '#FF2A85', grad: 'linear-gradient(90deg, #FF2A85, #F43F5E)' },
        seguranca: { num: '02', name: 'Segurança & Portaria', total: 0, color: '#00B4D8', grad: 'linear-gradient(90deg, #00B4D8, #38BDF8)' },
        limpeza: { num: '03', name: 'Limpeza & Higiene', total: 0, color: '#FFB800', grad: 'linear-gradient(90deg, #FFB800, #F59E0B)' },
        adm: { num: '04', name: 'Administração & Jurídico', total: 0, color: '#A855F7', grad: 'linear-gradient(90deg, #A855F7, #6366F1)' },
        outros: { num: '05', name: 'Fundo Reserva & Outros', total: 0, color: '#10B981', grad: 'linear-gradient(90deg, #10B981, #059669)' }
      };

      (periodPayables.length > 0 ? periodPayables : payables).forEach(p => {
        const cat = (p.category || '').toLowerCase();
        const amt = Number(p.amount) || 0;
        if (cat.includes('manuten') || cat.includes('obra')) customCatMap.manutencao.total += amt;
        else if (cat.includes('seguran') || cat.includes('portar')) customCatMap.seguranca.total += amt;
        else if (cat.includes('limpez') || cat.includes('conserva')) customCatMap.limpeza.total += amt;
        else if (cat.includes('admin') || cat.includes('juríd') || cat.includes('honor')) customCatMap.adm.total += amt;
        else customCatMap.outros.total += amt;
      });

      const totalCustomExp = Object.values(customCatMap).reduce((acc, c) => acc + c.total, 0) || 1;
      const customCatList = Object.values(customCatMap);
      let customDoughnutData = customCatList.map(c => Math.max(5, Math.round((c.total / totalCustomExp) * 100)));
      const customSumPct = customDoughnutData.reduce((a, b) => a + b, 0);
      if (customSumPct > 0) {
        customDoughnutData = customDoughnutData.map(val => Math.round((val / customSumPct) * 100));
      }
      const customCostBars = customCatList.map((c, idx) => ({
        num: c.num,
        name: c.name,
        pct: customDoughnutData[idx] || 20,
        color: c.color,
        grad: c.grad
      }));

      const labels = [];
      const revenue = [];
      const expenses = [];
      const target = [];
      let targetVal = 'R$ 38k';
      let targetLabel = 'Meta Fixa';
      let yCallback = (val) => 'R$ ' + (val / 1000).toFixed(0) + 'k';
      let yPadding = 7000;

      if (diffDays <= 35) {
        // AGRUPAMENTO DIÁRIO (Até 35 dias)
        const cur = new Date(startD);
        while (cur <= endD) {
          const yyyy = cur.getFullYear();
          const mm = String(cur.getMonth() + 1).padStart(2, '0');
          const dd = String(cur.getDate()).padStart(2, '0');
          const iso = `${yyyy}-${mm}-${dd}`;
          const isToday = (iso === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`);
          labels.push(isToday ? `Hoje (${dd})` : `${dd}/${monthNames[cur.getMonth()]}`);

          const dayRec = receivables.filter(r => r.status === 'Pago' && (r.paidAt === iso || r.due === iso))
            .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
          const dayPay = payables.filter(p => p.status === 'Pago' && (p.paidAt === iso || p.due === iso))
            .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

          const hash = Math.abs(cur.getDate() * 37 + (cur.getMonth() + 1) * 19) % 7;
          const baseRec = [3200, 4800, 2900, 5600, 3900, 2400, 4200][hash];
          const basePay = [1600, 2200, 3100, 1900, 2600, 1200, 1800][hash];

          revenue.push(dayRec > 0 ? dayRec : baseRec);
          expenses.push(dayPay > 0 ? dayPay : basePay);
          target.push(3000);

          cur.setDate(cur.getDate() + 1);
        }
        targetVal = 'R$ 3k';
        targetLabel = 'Meta Diária';
        yCallback = (val) => 'R$ ' + (val / 1000).toFixed(1) + 'k';
        yPadding = 1500;
      } else if (diffDays <= 730) {
        // AGRUPAMENTO MENSAL (De 36 dias a 2 anos)
        const cur = new Date(startD.getFullYear(), startD.getMonth(), 1);
        const endMonth = new Date(endD.getFullYear(), endD.getMonth(), 1);
        while (cur <= endMonth) {
          const yyyy = cur.getFullYear();
          const mm = String(cur.getMonth() + 1).padStart(2, '0');
          const key = `${yyyy}-${mm}`;
          const label = `${monthNames[cur.getMonth()]}/${String(yyyy).slice(2)}`;
          labels.push(label);

          const fm = financialMonths.find(f => f.month === key);
          const mRec = receivables.filter(r => r.ref === key && r.status === 'Pago')
            .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
          const mPay = payables.filter(p => p.status === 'Pago' && (p.due.startsWith(key) || (p.paidAt && p.paidAt.startsWith(key))))
            .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

          if (fm) {
            revenue.push(fm.revenue);
            expenses.push(fm.expenses);
          } else if (mRec > 0 || mPay > 0) {
            revenue.push(mRec > 0 ? mRec : 38400);
            expenses.push(mPay > 0 ? mPay : 32100);
          } else {
            const hash = Math.abs(cur.getMonth() + yyyy) % 5;
            revenue.push([38400, 39600, 38100, 40200, 37900][hash]);
            expenses.push([31500, 33200, 29800, 34100, 30500][hash]);
          }
          target.push(38000);

          cur.setMonth(cur.getMonth() + 1);
        }
        targetVal = 'R$ 38k';
        targetLabel = 'Meta Mensal';
        yCallback = (val) => 'R$ ' + Math.round(val / 1000) + 'k';
        yPadding = 7000;
      } else {
        // AGRUPAMENTO ANUAL (> 2 anos)
        const startY = startD.getFullYear();
        const endY = endD.getFullYear();
        for (let y = startY; y <= endY; y++) {
          labels.push(String(y));
          const yRev = financialMonths.filter(m => m.month && m.month.startsWith(String(y)))
            .reduce((acc, m) => acc + (m.revenue || 0), 0) || (430000 + (y % 5) * 12000);
          const yExp = financialMonths.filter(m => m.month && m.month.startsWith(String(y)))
            .reduce((acc, m) => acc + (m.expenses || 0), 0) || (390000 + (y % 5) * 11000);
          revenue.push(yRev);
          expenses.push(yExp);
          target.push(450000);
        }
        targetVal = 'R$ 450k';
        targetLabel = 'Meta Anual';
        yCallback = (val) => 'R$ ' + Math.round(val / 1000) + 'k';
        yPadding = 50000;
      }

      const maxRev = Math.max(...revenue);
      const minExp = Math.min(...expenses);
      const totalRev = revenue.reduce((a, b) => a + b, 0);
      const totalTarget = target.reduce((a, b) => a + b, 0);
      const execPct = totalTarget > 0 ? Math.round((totalRev / totalTarget) * 100) : 100;

      const groupDesc = diffDays <= 35 ? `${labels.length} dias` : (diffDays <= 730 ? `${labels.length} meses` : `${labels.length} anos`);

      return {
        labels: labels,
        revenue: revenue,
        expenses: expenses,
        target: target,
        targetVal: targetVal,
        targetLabel: targetLabel,
        yMax: Math.max(...revenue, ...expenses) + yPadding,
        yCallback: yCallback,
        subtitle: `Período personalizado de ${formatDateBR(startD)} a ${formatDateBR(endD)} (${groupDesc})`,
        calloutHigh: { val: `▲ R$ ${maxRev >= 10000 ? Math.round(maxRev / 1000) + 'k' : (maxRev / 1000).toFixed(1) + 'k'}`, label: 'PICO PERÍODO' },
        calloutLow: { val: `▼ R$ ${minExp >= 10000 ? Math.round(minExp / 1000) + 'k' : (minExp / 1000).toFixed(1) + 'k'}`, label: 'CUSTO MÍN' },
        periodBadge: `${formatDateBR(startD)} - ${formatDateBR(endD)}`,
        executedPct: `${execPct}%`,
        doughnutData: customDoughnutData,
        costBars: customCostBars
      };
    } else {
      // Mês (Padrão) — Últimos 6 meses até o mês atual
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        const label = `${monthNames[d.getMonth()]}/${String(yyyy).slice(2)}`;
        last6Months.push({ key, label, yyyy, mm });
      }

      const labels = last6Months.map(m => m.label);
      const revenue = [];
      const expenses = [];
      const target = [];

      last6Months.forEach(m => {
        // Busca se existe registro em financialMonths
        const fm = financialMonths.find(f => f.month === m.key);
        // Também calcula recebíveis deste mês
        const monthRec = receivables.filter(r => r.ref === m.key && r.status === 'Pago')
          .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
        const monthPay = payables.filter(p => p.status === 'Pago' && (p.due.startsWith(m.key) || (p.paidAt && p.paidAt.startsWith(m.key))))
          .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        if (fm) {
          revenue.push(fm.revenue);
          expenses.push(fm.expenses);
        } else if (monthRec > 0 || monthPay > 0) {
          revenue.push(monthRec > 0 ? monthRec : 38400);
          expenses.push(monthPay > 0 ? monthPay : 32100);
        } else {
          revenue.push(38400);
          expenses.push(31500);
        }
        target.push(38000);
      });

      const maxRev = Math.max(...revenue);
      const minExp = Math.min(...expenses);
      const curRev = revenue[revenue.length - 1];
      const curTarget = target[target.length - 1];
      const execPct = Math.round((curRev / curTarget) * 100);

      return {
        labels: labels,
        revenue: revenue,
        expenses: expenses,
        target: target,
        targetVal: 'R$ 38k',
        targetLabel: 'Meta Fixa',
        yMax: Math.max(...revenue, ...expenses) + 7000,
        yCallback: (val) => 'R$ ' + (val / 1000).toFixed(0) + 'k',
        subtitle: `Receitas vs Despesas vs Meta — Últimos 6 Meses consolidado (${monthNames[now.getMonth()]}/${currentYear})`,
        calloutHigh: { val: `▲ R$ ${(maxRev / 1000).toFixed(1)}k`, label: 'RECORDE' },
        calloutLow: { val: `▼ R$ ${(minExp / 1000).toFixed(1)}k`, label: 'CUSTO MÍN' },
        periodBadge: 'Últimos 6 Meses',
        executedPct: `${execPct}%`,
        doughnutData: doughnutData,
        costBars: costBars
      };
    }
  },

  renderCostBars(costBars) {
    const container = document.getElementById('costs-bars-container');
    if (!container || !costBars) return;

    container.innerHTML = costBars.map(item => `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px;">
          <span class="bar-item-label" style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:9px; font-weight:800; background:${item.color}; color:#fff; padding:1px 5px; border-radius:4px;">${item.num}</span>
            ${item.name}
          </span>
          <span style="font-weight:700; color:${item.color};">${item.pct}%</span>
        </div>
        <div class="bar-track">
          <div style="width:${item.pct}%; height:100%; background:${item.grad}; box-shadow:0 0 8px ${item.color}80; border-radius:3px; transition:width 0.4s ease;"></div>
        </div>
      </div>
    `).join('');
  },

  initCharts() {
    if (!window.Chart) return;

    if (this._chart1) {
      try { this._chart1.destroy(); } catch (e) { /* ignore */ }
    }
    if (this._chart2) {
      try { this._chart2.destroy(); } catch (e) { /* ignore */ }
    }

    const data = this.getPeriodData();
    const isDark = document.body.classList.contains('dark-mode');

    // Atualiza textos e badges do DOM
    const subEl = document.getElementById('flow-subtitle');
    if (subEl) subEl.textContent = data.subtitle;

    const calloutHighEl = document.getElementById('flow-callout-high');
    if (calloutHighEl) {
      calloutHighEl.innerHTML = `<span>${data.calloutHigh.val}</span> <span style="opacity:0.85; font-size:9px;">${data.calloutHigh.label}</span>`;
    }

    const calloutLowEl = document.getElementById('flow-callout-low');
    if (calloutLowEl) {
      calloutLowEl.innerHTML = `<span>${data.calloutLow.val}</span> <span style="opacity:0.85; font-size:9px;">${data.calloutLow.label}</span>`;
    }

    const badgeEl = document.getElementById('costs-period-badge');
    if (badgeEl) badgeEl.textContent = data.periodBadge;

    const donutCenterEl = document.getElementById('donut-center-pct');
    if (donutCenterEl) donutCenterEl.textContent = data.executedPct;

    const legendDotExp = document.getElementById('legend-dot-exp');
    if (legendDotExp) legendDotExp.style.background = isDark ? '#00E5FF' : '#00B4D8';

    const legendTargetEl = document.getElementById('legend-label-target');
    if (legendTargetEl && data.targetLabel) {
      legendTargetEl.textContent = `${data.targetLabel} (${data.targetVal})`;
    }

    this.renderCostBars(data.costBars);

    // 1. GRÁFICO ONDAS MULTICAMADAS NEON (SPLINE AREA) COM CORES DO TEMA
    const ctxBar = document.getElementById('chart-revenue-expenses');
    if (ctxBar) {
      const ctx = ctxBar.getContext('2d');

      // Gradientes adaptativos conforme o tema
      const gradRevenue = ctx.createLinearGradient(0, 0, 0, 255);
      if (isDark) {
        gradRevenue.addColorStop(0, 'rgba(255, 42, 133, 0.42)');
        gradRevenue.addColorStop(0.5, 'rgba(255, 42, 133, 0.12)');
        gradRevenue.addColorStop(1, 'rgba(255, 42, 133, 0.0)');
      } else {
        gradRevenue.addColorStop(0, 'rgba(255, 42, 133, 0.26)');
        gradRevenue.addColorStop(0.5, 'rgba(255, 42, 133, 0.08)');
        gradRevenue.addColorStop(1, 'rgba(255, 42, 133, 0.0)');
      }

      const gradExpenses = ctx.createLinearGradient(0, 0, 0, 255);
      if (isDark) {
        gradExpenses.addColorStop(0, 'rgba(0, 229, 255, 0.38)');
        gradExpenses.addColorStop(0.5, 'rgba(0, 229, 255, 0.10)');
        gradExpenses.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
      } else {
        gradExpenses.addColorStop(0, 'rgba(0, 180, 216, 0.24)');
        gradExpenses.addColorStop(0.5, 'rgba(0, 180, 216, 0.06)');
        gradExpenses.addColorStop(1, 'rgba(0, 180, 216, 0.0)');
      }

      const expensesBorderColor = isDark ? '#00E5FF' : '#00B4D8';
      const targetBorderColor = isDark ? '#FFB800' : '#D97706';
      const ticksColor = isDark ? '#94A3B8' : '#64748B';
      const tooltipBg = isDark ? '#0F172A' : '#1E293B';
      const tooltipBody = isDark ? '#CBD5E1' : '#E2E8F0';
      const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

      this._chart1 = new window.Chart(ctxBar, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Receitas Realizadas',
              data: data.revenue,
              borderColor: '#FF2A85',
              borderWidth: 3.5,
              backgroundColor: gradRevenue,
              fill: true,
              tension: 0.44,
              cubicInterpolationMode: 'monotone',
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: '#FF2A85',
              pointBorderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#FF2A85',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3
            },
            {
              label: 'Despesas Operacionais',
              data: data.expenses,
              borderColor: expensesBorderColor,
              borderWidth: 3.5,
              backgroundColor: gradExpenses,
              fill: true,
              tension: 0.44,
              cubicInterpolationMode: 'monotone',
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: expensesBorderColor,
              pointBorderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: expensesBorderColor,
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3
            },
            {
              label: data.targetLabel || 'Meta Orçada',
              data: data.target,
              borderColor: targetBorderColor,
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              tension: 0.2,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: targetBorderColor
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: '#FFFFFF',
              bodyColor: tooltipBody,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${window.Security.maskMoney(ctx.raw)}`
              }
            }
          },
          layout: {
            padding: {
              left: 6,
              right: 18,
              top: 14,
              bottom: 8
            }
          },
          scales: {
            x: {
              offset: true,
              grid: {
                display: false,
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false
              },
              border: {
                display: false
              },
              ticks: {
                color: ticksColor,
                padding: 10,
                font: { size: 12, weight: '600' }
              }
            },
            y: {
              grid: {
                display: false,
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false
              },
              border: {
                display: false
              },
              ticks: {
                color: ticksColor,
                padding: 18,
                font: { size: 11, weight: '600' },
                callback: data.yCallback
              }
            }
          }
        }
      });
    }

    // 2. GRÁFICO ROSCA HOLOGRÁFICA NEON ADAPTATIVO
    const ctxPie = document.getElementById('chart-expenses-pie');
    if (ctxPie) {
      const expensesBorderColor = isDark ? '#00E5FF' : '#00B4D8';
      const targetBorderColor = isDark ? '#FFB800' : '#F59E0B';
      const doughnutBorder = isDark ? '#0B0F19' : '#FFFFFF';
      const tooltipBg = isDark ? '#0F172A' : '#1E293B';
      const tooltipBody = isDark ? '#CBD5E1' : '#E2E8F0';
      const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

      this._chart2 = new window.Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: ['Manutenção & Reparos', 'Segurança & Portaria', 'Limpeza & Higiene', 'Administração & Jurídico', 'Fundo Reserva & Outros'],
          datasets: [{
            data: data.doughnutData,
            backgroundColor: [
              '#FF2A85',
              expensesBorderColor,
              targetBorderColor,
              '#A855F7',
              '#10B981'
            ],
            borderColor: doughnutBorder,
            borderWidth: 2,
            hoverOffset: 6,
            borderRadius: 4,
            spacing: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '74%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: '#FFFFFF',
              bodyColor: tooltipBody,
              borderColor: tooltipBorder,
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
              }
            }
          }
        }
      });
    }
  },

  showAllActivities() {
    const logs = window.Audit.getLogs();
    const content = `
      <div class="table-responsive" style="max-height:450px;">
        <table class="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Módulo</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => {
              const formatted = window.Audit.formatDetails ? window.Audit.formatDetails(l.details) : (l.details || '');
              return `
              <tr>
                <td style="white-space:nowrap; font-size:12px;">${l.timestamp}</td>
                <td><b>${window.Security.sanitize(l.userName)}</b> <span style="font-size:11px; color:var(--color-text-muted);">(${l.role})</span></td>
                <td>${window.Security.sanitize(l.module)}</td>
                <td>${window.Security.sanitize(l.action)}</td>
                <td style="font-size:12px;">${window.Security.sanitize(formatted)}</td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    `;
    window.UI.modal({
      title: 'Histórico Completo de Auditoria',
      size: 'lg',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  simulateWhatsAppCharge(unit, residentEncoded, amount) {
    const resident = decodeURIComponent(residentEncoded);
    const formattedAmount = window.Security.maskMoney(amount);
    const msg = `Olá ${resident} (Unidade ${unit}), identificamos que a taxa condominial de ${formattedAmount} encontra-se em aberto no sistema. Para obter a linha digitável, código PIX ou a 2ª via atualizada com isenção de novos encargos, acesse o Portal do Condômino ou responda esta mensagem diretamente. Conte conosco! — Administração CondoHub`;

    window.UI.modal({
      title: 'Disparo de Cobrança WhatsApp (Simulação)',
      size: 'md',
      content: `
        <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:16px;">
          <div style="width:40px; height:40px; border-radius:8px; background:#DCFCE7; color:#15803D; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${window.UI.icon('message-circle', 22)}
          </div>
          <div>
            <h4 style="font-size:14px; font-weight:700; margin:0 0 4px;">Notificação Amigável de Inadimplência</h4>
            <p style="font-size:12px; color:var(--color-text-muted); margin:0;">Destinatário: <b>${window.Security.sanitize(resident)}</b> • Apto <b>${unit}</b></p>
          </div>
        </div>
        <div style="background:var(--color-bg); border-radius:8px; padding:12px; border:1px solid var(--color-border); margin-bottom:14px;">
          <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); display:block; margin-bottom:6px;">Mensagem Formatada:</label>
          <p style="font-size:13px; line-height:1.5; color:var(--color-text); margin:0;">${msg}</p>
        </div>
        <div style="font-size:12px; color:var(--color-text-muted);">
          ℹ️ Mensagem em conformidade com o código de ética condominial e LGPD.
        </div>
      `,
      buttons: [
        {
          label: 'Enviar via WhatsApp (Simulado)',
          className: 'btn-secondary',
          onClick: () => {
            window.Audit.log('COBRANCA_WHATSAPP', 'financial', `Cobrança amigável via WhatsApp enviada para ${resident} (${unit}) - ${formattedAmount}`);
            window.UI.toast(`Cobrança amigável enviada para ${resident} (Unid. ${unit}) com sucesso!`, 'success');
          }
        },
        { label: 'Fechar', className: 'btn-outline' }
      ]
    });
  }
};

window.Modules.financial = {
  currentTab: 'receber',

  render(container, sub = null) {
    if (sub) this.currentTab = sub;

    container.innerHTML = `
      <div class="tabs-nav">
        <button class="tab-btn ${this.currentTab === 'receber' ? 'active' : ''}" onclick="Modules.financial.switchTab('receber')">
          ${window.UI.icon('arrow-down-left', 16)} Contas a Receber
        </button>
        <button class="tab-btn ${this.currentTab === 'pagar' ? 'active' : ''}" onclick="Modules.financial.switchTab('pagar')">
          ${window.UI.icon('arrow-up-right', 16)} Contas a Pagar
        </button>
        <button class="tab-btn ${this.currentTab === 'multas' ? 'active' : ''}" onclick="Modules.financial.switchTab('multas')">
          ${window.UI.icon('alert-octagon', 16)} Multas & Advertências
        </button>
        <button class="tab-btn ${this.currentTab === 'extrato' ? 'active' : ''}" onclick="Modules.financial.switchTab('extrato')">
          ${window.UI.icon('list', 16)} Extrato Bancário
        </button>
        <button class="tab-btn ${this.currentTab === 'orcamento' ? 'active' : ''}" onclick="Modules.financial.switchTab('orcamento')">
          ${window.UI.icon('pie-chart', 16)} Orçamento Anual
        </button>
      </div>

      <div id="financial-tab-content"></div>
    `;

    this.renderTabContent();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
    this.renderTabContent();
  },

  renderTabContent() {
    const el = document.getElementById('financial-tab-content');
    if (!el) return;
    if (this.currentTab === 'receber') this.renderReceivables(el);
    else if (this.currentTab === 'pagar') this.renderPayables(el);
    else if (this.currentTab === 'multas') this.renderFines(el);
    else if (this.currentTab === 'extrato') this.renderStatement(el);
    else if (this.currentTab === 'orcamento') this.renderBudget(el);
  },

  // 1. CONTAS A RECEBER
  renderReceivables(el) {
    const list = window.Storage.get('receivables') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" id="rec-search" class="form-control" style="width:200px;" placeholder="Buscar por morador..." oninput="Modules.financial.filterReceivables()" />
            <select id="rec-status" class="form-control" style="width:140px;" onchange="Modules.financial.filterReceivables()">
              <option value="">Todos os status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Vencido">Vencido</option>
            </select>
            <select id="rec-ref" class="form-control" style="width:130px;" onchange="Modules.financial.filterReceivables()">
              <option value="">Todas ref.</option>
              <option value="2026-10">2026-10</option>
              <option value="2026-09" selected>2026-09</option>
              <option value="2026-08">2026-08</option>
            </select>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline btn-sm" onclick="Modules.financial.exportReceivablesCSV()">
              ${window.UI.icon('download', 14)} Exportar CSV
            </button>
            <button class="btn btn-danger btn-sm" onclick="Modules.financial.modalInadimplentes()">
              ${window.UI.icon('send', 14)} Cobrar Inadimplentes
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" id="rec-table">
            <thead>
              <tr>
                <th>Unidade</th>
                <th>Morador</th>
                <th>Tipo</th>
                <th>Referência</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody id="rec-table-body">
              <!-- Renderizado via JS -->
            </tbody>
          </table>
        </div>
        <div id="rec-pagination"></div>
      </div>
    `;

    this.filterReceivables();
  },

  filterReceivables(page = 1) {
    const list = window.Storage.get('receivables') || [];
    const q = (document.getElementById('rec-search')?.value || '').toLowerCase();
    const status = document.getElementById('rec-status')?.value || '';
    const ref = document.getElementById('rec-ref')?.value || '';

    let filtered = list.filter(item => {
      const matchQ = !q || item.resident.toLowerCase().includes(q) || item.unit.toLowerCase().includes(q);
      const matchStatus = !status || item.status === status;
      const matchRef = !ref || item.ref === ref;
      return matchQ && matchStatus && matchRef;
    });

    const perPage = 10;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    const tbody = document.getElementById('rec-table-body');
    if (!tbody) return;

    tbody.innerHTML = paginated.map(r => `
      <tr>
        <td><b>${r.unit}</b></td>
        <td>${window.Security.sanitize(r.resident)}</td>
        <td>${r.type}</td>
        <td>${r.ref}</td>
        <td>${r.due}</td>
        <td><b>${window.Security.maskMoney(r.amount)}</b></td>
        <td>${window.UI.badge(r.status)}</td>
        <td>
          <div style="display:flex; gap:6px;">
            ${r.status !== 'Pago' ? `
              <button class="btn btn-sm btn-secondary" onclick="Modules.financial.markAsPaid('${r.id}')" title="Marcar como Pago">
                ✓ Pagar
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline" onclick="Modules.financial.openBoletoModal('${r.id}')" title="Emitir 2ª Via">
              ${window.UI.icon('printer', 14)} Boleto
            </button>
            <button class="btn btn-sm btn-outline" onclick="Modules.financial.openAgreementModal('${r.id}')" title="Registrar Acordo">
              ${window.UI.icon('file-text', 14)}
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    const pagEl = document.getElementById('rec-pagination');
    if (pagEl) {
      pagEl.innerHTML = window.UI.pagination({
        total: filtered.length,
        page: page,
        perPage: perPage,
        onPageChange: (p) => Modules.financial.filterReceivables(p)
      });
    }

    if (window.lucide) window.lucide.createIcons();
  },

  markAsPaid(id) {
    const receivables = window.Storage.get('receivables') || [];
    const item = receivables.find(r => r.id === id);
    if (!item) return;

    const content = `
      <div class="form-group">
        <label class="form-label">Unidade / Morador</label>
        <input type="text" class="form-control" value="${item.unit} - ${item.resident}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">Valor</label>
        <input type="text" class="form-control" value="${window.Security.maskMoney(item.amount)}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">Data de Pagamento</label>
        <input type="date" id="paid-date" class="form-control" value="${new Date().toISOString().substring(0, 10)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Forma de Pagamento</label>
        <select id="paid-method" class="form-control">
          <option value="Pix">Pix Instantâneo</option>
          <option value="Boleto">Boleto Bancário</option>
          <option value="TED">Transferência TED</option>
          <option value="Dinheiro">Dinheiro em Espécie</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Observação / Comprovante</label>
        <textarea id="paid-obs" class="form-control" rows="2" placeholder="Autenticação bancária..."></textarea>
      </div>
    `;

    window.UI.modal({
      title: 'Registrar Baixa de Pagamento',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Confirmar Baixa',
          className: 'btn-primary',
          onClick: (close) => {
            const date = document.getElementById('paid-date').value;
            const method = document.getElementById('paid-method').value;
            item.status = 'Pago';
            item.paidAt = date;
            item.method = method;
            window.Storage.set('receivables', receivables);
            window.Audit.log('Baixa de Pagamento Realizada', { id, unit: item.unit, amount: item.amount, method }, 'Financeiro');
            window.UI.toast(`Pagamento da unidade ${item.unit} registrado com sucesso!`, 'success');
            close();
            Modules.financial.filterReceivables();
          }
        }
      ]
    });
  },

  openBoletoModal(id) {
    const item = (window.Storage.get('receivables') || []).find(r => r.id === id);
    if (!item) return;
    const condo = window.Storage.get('condo') || {};

    const content = `
      <div class="print-boleto" style="background:#FFFFFF; color:#000; padding:20px; border:1px solid #ccc; font-family:monospace;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
          <div>
            <h2 style="font-size:18px; margin:0;">${condo.name}</h2>
            <p style="font-size:11px; margin:0;">CNPJ: ${condo.cnpj} | ${condo.address}, ${condo.city}-${condo.state}</p>
          </div>
          <div style="text-align:right;">
            <b style="font-size:16px;">BANCO ITAÚ 341-7</b>
            <p style="font-size:12px; margin:0;">34191.09008 00000.123456 78900.123456 1 95000000080000</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:3fr 1fr; border:1px solid #000; margin-bottom:12px;">
          <div style="padding:8px; border-right:1px solid #000;">
            <span style="font-size:10px;">Pagador</span><br>
            <b>${item.resident}</b> - Unidade: <b>${item.unit}</b>
          </div>
          <div style="padding:8px;">
            <span style="font-size:10px;">Vencimento</span><br>
            <b style="font-size:14px; color:#E02424;">${item.due}</b>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:2fr 1fr 1fr; border:1px solid #000; margin-bottom:12px;">
          <div style="padding:8px; border-right:1px solid #000;">
            <span style="font-size:10px;">Descrição</span><br>
            ${item.type} - Ref: ${item.ref}
          </div>
          <div style="padding:8px; border-right:1px solid #000;">
            <span style="font-size:10px;">Espécie</span><br>
            R$
          </div>
          <div style="padding:8px;">
            <span style="font-size:10px;">Valor do Documento</span><br>
            <b style="font-size:14px;">${window.Security.maskMoney(item.amount)}</b>
          </div>
        </div>

        <div style="grid-column:span 3; border:1px solid #000; padding:8px; margin-bottom:12px; background:#F9FAFB;">
          <span style="font-size:10px; font-weight:700;">INSTRUÇÕES DE COBRANÇA AO SACADO / CAIXA:</span><br>
          <span style="font-size:11px; line-height:1.4;">
            • Cota Condominial Ordinária mensal referente à unidade ${item.unit}.<br>
            • <b>ÁGUA E ESGOTO:</b> O consumo de água e esgoto do condomínio já está <b>100% incluso</b> nesta taxa condominial coletiva (sem cobrança adicional de hidrômetro individual).<br>
            • Após o vencimento, cobrar multa de 2% e juros moratórios de 1% ao mês. Não receber após 30 dias de atraso.
          </span>
        </div>

        <div style="border:1px dashed #000; padding:10px; text-align:center; margin-top:12px;">
          <p style="font-size:10px; margin-bottom:8px;">CÓDIGO DE BARRAS FEBRABAN</p>
          <div style="font-family:'Courier New', monospace; font-size:24px; letter-spacing:4px; font-weight:bold;">
            ||| | |||| || |||||| | |||| ||| ||||||| ||| ||
          </div>
          <p style="font-size:10px; margin-top:4px;">Linha digitável: 34191.09008 00000.123456 78900.123456 1 95000000080000</p>
        </div>
      </div>
    `;

    window.UI.modal({
      title: `2ª Via de Boleto Bancário — Unidade ${item.unit}`,
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Fechar', className: 'btn-outline' },
        { label: 'Imprimir Boleto', className: 'btn-primary', onClick: () => window.print() }
      ]
    });
  },

  openAgreementModal(id) {
    const item = (window.Storage.get('receivables') || []).find(r => r.id === id);
    if (!item) return;

    const content = `
      <p style="font-size:13px; margin-bottom:12px;">Registrar termo de acordo para quitação de débito da unidade <b>${item.unit}</b>.</p>
      <div class="form-group">
        <label class="form-label">Valor Original</label>
        <input type="text" class="form-control" value="${window.Security.maskMoney(item.amount)}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">Valor Acordado (com juros/desconto)</label>
        <input type="text" id="agree-val" class="form-control" value="${window.Security.maskMoney(item.amount)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Número de Parcelas</label>
        <select id="agree-installments" class="form-control">
          <option value="1">1x À vista</option>
          <option value="2">2x Mensais</option>
          <option value="3">3x Mensais</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">1º Vencimento</label>
        <input type="date" id="agree-due" class="form-control" value="${new Date().toISOString().substring(0, 10)}" />
      </div>
    `;

    window.UI.modal({
      title: 'Registrar Acordo de Cobrança',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Salvar Acordo',
          className: 'btn-primary',
          onClick: (close) => {
            window.Audit.log('Acordo de Cobrança Registrado', { id, unit: item.unit }, 'Financeiro');
            window.UI.toast(`Termo de acordo registrado com sucesso para a unidade ${item.unit}.`, 'success');
            close();
          }
        }
      ]
    });
  },

  modalInadimplentes() {
    const list = (window.Storage.get('receivables') || []).filter(r => r.status === 'Vencido');
    const totalVencido = list.reduce((acc, r) => acc + r.amount, 0);

    const content = `
      <div style="background:#FDE8E8; padding:12px; border-radius:8px; margin-bottom:16px;">
        <span style="font-size:12px; color:#9B1C1C; font-weight:600;">Total Inadimplente no Ciclo:</span>
        <h3 style="font-size:20px; color:#9B1C1C; font-weight:700;">${window.Security.maskMoney(totalVencido)}</h3>
        <p style="font-size:12px; color:#9B1C1C;">${list.length} boletos em atraso detectados.</p>
      </div>

      <div class="table-responsive" style="max-height:260px;">
        <table class="table">
          <thead>
            <tr>
              <th style="width:30px;"><input type="checkbox" id="check-all-inad" checked onchange="document.querySelectorAll('.inad-check').forEach(c => c.checked = this.checked)" /></th>
              <th>Unidade</th>
              <th>Morador</th>
              <th>Vencimento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(r => `
              <tr>
                <td><input type="checkbox" class="inad-check" value="${r.id}" checked /></td>
                <td><b>${r.unit}</b></td>
                <td>${r.resident}</td>
                <td>${r.due}</td>
                <td>${window.Security.maskMoney(r.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    window.UI.modal({
      title: 'Disparo de Notificação de Cobrança em Massa',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Enviar Cobrança Simulada',
          className: 'btn-danger',
          onClick: (close, e) => {
            const btn = e.target;
            window.UI.setButtonLoading(btn, true);
            setTimeout(() => {
              window.UI.setButtonLoading(btn, false);
              window.Audit.log('Disparo de Cobrança em Massa', { count: list.length, total: totalVencido }, 'Financeiro');
              window.UI.toast(`Notificações por E-mail e WhatsApp enviadas para ${list.length} condôminos! (Simulação)`, 'success');
              close();
            }, 1200);
          }
        }
      ]
    });
  },

  exportReceivablesCSV() {
    const list = window.Storage.get('receivables') || [];
    let csv = 'ID,Unidade,Morador,Tipo,Referencia,Vencimento,Valor,Status\n';
    list.forEach(r => {
      csv += `"${r.id}","${r.unit}","${r.resident}","${r.type}","${r.ref}","${r.due}","${r.amount}","${r.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `condohub_contas_receber_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    window.UI.toast('Arquivo CSV baixado com sucesso!', 'info');
  },

  // 2. CONTAS A PAGAR
  renderPayables(el) {
    const list = window.Storage.get('payables') || [];

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <h3 class="card-title">${window.UI.icon('arrow-up-right', 18)} Contas a Pagar & Despesas</h3>
          <button class="btn btn-primary btn-sm" onclick="Modules.financial.modalNovaContaPagar()">
            ${window.UI.icon('plus', 14)} Nova Conta
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th class="no-sort">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => `
                <tr>
                  <td><b>${window.Security.sanitize(p.supplier)}</b><br><span style="font-size:11px; color:var(--color-text-muted);">${p.cnpj}</span></td>
                  <td>${p.category}</td>
                  <td>${window.Security.sanitize(p.description)}</td>
                  <td>${p.due}</td>
                  <td><b>${window.Security.maskMoney(p.amount)}</b></td>
                  <td>${window.UI.badge(p.status)}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      ${p.status === 'Em aprovação' ? `
                        <button class="btn btn-sm btn-secondary" onclick="Modules.financial.approvePayable('${p.id}')">Aprovar</button>
                      ` : ''}
                      ${p.status === 'Pendente' ? `
                        <button class="btn btn-sm btn-primary" onclick="Modules.financial.payPayable('${p.id}')">Pagar</button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline" onclick="Modules.financial.viewPayable('${p.id}')">Ver</button>
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

  modalNovaContaPagar() {
    const suppliers = window.Storage.get('suppliers') || [];

    const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;" class="grid-2">
        <div class="form-group">
          <label class="form-label">Fornecedor</label>
          <input type="text" id="pay-sup" class="form-control" placeholder="Razão social do fornecedor" list="sup-list" />
          <datalist id="sup-list">
            ${suppliers.map(s => `<option value="${s.name}">`).join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">CNPJ / CPF</label>
          <input type="text" id="pay-cnpj" class="form-control" placeholder="00.000.000/0000-00" oninput="this.value = window.Security.maskCNPJ(this.value)" />
        </div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select id="pay-cat" class="form-control">
            <option value="Manutenção">Manutenção</option>
            <option value="Segurança">Segurança</option>
            <option value="Limpeza">Limpeza</option>
            <option value="Administração">Administração</option>
            <option value="Jurídico">Jurídico</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input type="number" id="pay-amount" class="form-control" placeholder="0.00" step="0.01" />
        </div>
        <div class="form-group">
          <label class="form-label">Data de Vencimento</label>
          <input type="date" id="pay-due" class="form-control" />
        </div>
        <div class="form-group">
          <label class="form-label">Centro de Custo</label>
          <select id="pay-cost" class="form-control">
            <option value="Manutenção Geral">Manutenção Geral</option>
            <option value="Segurança">Segurança</option>
            <option value="Limpeza & Conservação">Limpeza & Conservação</option>
            <option value="Administração">Administração</option>
            <option value="Utilidades">Utilidades (Água / Luz)</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição Detalhada da Despesa</label>
        <textarea id="pay-desc" class="form-control" rows="2" placeholder="Detalhes do serviço ou produto..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Anexo de Nota Fiscal / Comprovante</label>
        <input type="file" id="pay-file" class="form-control" accept="image/*,.pdf" />
      </div>
    `;

    window.UI.modal({
      title: 'Cadastrar Nova Conta a Pagar',
      size: 'lg',
      content: content,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline' },
        {
          label: 'Salvar Despesa',
          className: 'btn-primary',
          onClick: (close) => {
            const sup = document.getElementById('pay-sup').value.trim();
            const cnpj = document.getElementById('pay-cnpj').value.trim();
            const cat = document.getElementById('pay-cat').value;
            const amount = parseFloat(document.getElementById('pay-amount').value);
            const due = document.getElementById('pay-due').value;
            const desc = document.getElementById('pay-desc').value.trim();
            const cost = document.getElementById('pay-cost').value;

            if (!sup || !amount || !due) {
              window.UI.toast('Preencha fornecedor, valor e vencimento obrigatórios.', 'warning');
              return;
            }

            // Regra de alçada de aprovação:
            // <= R$ 500: auto-aprovado
            // > R$ 500 e <= 2000: aprovação pelo síndico
            // > 2000: requer aprovação de 2 conselheiros
            let status = 'Pendente';
            let approvedBy = null;
            if (amount <= 500) {
              status = 'Pendente';
              approvedBy = 'Síndico (Auto <= R$500)';
            } else {
              status = 'Em aprovação';
            }

            const payables = window.Storage.get('payables') || [];
            const newPay = {
              id: 'pay_' + Date.now(),
              supplier: sup,
              cnpj: cnpj || '00.000.000/0001-00',
              category: cat,
              description: desc,
              due: due,
              amount: amount,
              status: status,
              approvedBy: approvedBy,
              costCenter: cost
            };
            payables.unshift(newPay);
            window.Storage.set('payables', payables);

            window.Audit.log('Nova Despesa Cadastrada', { supplier: sup, amount }, 'Financeiro');
            window.UI.toast('Conta a pagar cadastrada com sucesso!', 'success');
            close();
            Modules.financial.renderPayables(document.getElementById('financial-tab-content'));
          }
        }
      ]
    });
  },

  approvePayable(id) {
    const payables = window.Storage.get('payables') || [];
    const item = payables.find(p => p.id === id);
    if (!item) return;

    item.status = 'Pendente';
    item.approvedBy = 'Carlos Mendonça (Síndico)';
    window.Storage.set('payables', payables);
    window.Audit.log('Aprovação de Despesa', { id, amount: item.amount }, 'Financeiro');
    window.UI.toast('Despesa aprovada para liquidação!', 'success');
    Modules.financial.renderPayables(document.getElementById('financial-tab-content'));
  },

  payPayable(id) {
    const payables = window.Storage.get('payables') || [];
    const item = payables.find(p => p.id === id);
    if (!item) return;

    window.UI.confirm(`Confirmar liquidação de ${window.Security.maskMoney(item.amount)} para ${item.supplier}?`, () => {
      item.status = 'Pago';
      item.paidAt = new Date().toISOString().substring(0, 10);
      window.Storage.set('payables', payables);
      window.Audit.log('Pagamento de Fornecedor', { id, amount: item.amount }, 'Financeiro');
      window.UI.toast('Pagamento registrado com sucesso!', 'success');
      Modules.financial.renderPayables(document.getElementById('financial-tab-content'));
    });
  },

  viewPayable(id) {
    const item = (window.Storage.get('payables') || []).find(p => p.id === id);
    if (!item) return;

    const content = `
      <div style="font-size:14px;">
        <p><b>Fornecedor:</b> ${item.supplier}</p>
        <p><b>CNPJ:</b> ${item.cnpj}</p>
        <p><b>Categoria:</b> ${item.category}</p>
        <p><b>Centro de Custo:</b> ${item.costCenter}</p>
        <p><b>Vencimento:</b> ${item.due}</p>
        <p><b>Valor:</b> ${window.Security.maskMoney(item.amount)}</p>
        <p><b>Status:</b> ${window.UI.badge(item.status)}</p>
        <p><b>Aprovado Por:</b> ${item.approvedBy || 'Pendente de aprovação'}</p>
        <p style="margin-top:10px;"><b>Descrição:</b><br>${item.description}</p>
      </div>
    `;

    window.UI.modal({
      title: 'Detalhes da Conta a Pagar',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  // 3. EXTRATO
  renderStatement(el) {
    const rec = window.Storage.get('receivables') || [];
    const pay = window.Storage.get('payables') || [];

    // Consolida entradas e saídas pagas
    const entries = [];
    rec.filter(r => r.status === 'Pago').forEach(r => {
      entries.push({
        date: r.paidAt || '2026-09-10',
        desc: `Recebimento Taxa - Unidade ${r.unit}`,
        type: 'Entrada',
        amount: r.amount
      });
    });

    pay.filter(p => p.status === 'Pago').forEach(p => {
      entries.push({
        date: p.paidAt || p.due,
        desc: `Pagto ${p.supplier} (${p.category})`,
        type: 'Saída',
        amount: -p.amount
      });
    });

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    let runningBalance = 48500;
    const rows = entries.map(e => {
      runningBalance += e.amount;
      return { ...e, balance: runningBalance };
    });

    const totalIn = entries.filter(e => e.amount > 0).reduce((acc, e) => acc + e.amount, 0);
    const totalOut = Math.abs(entries.filter(e => e.amount < 0).reduce((acc, e) => acc + e.amount, 0));

    el.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:20px;" class="grid-4">
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600;">TOTAL ENTRADAS (REALIZADAS)</span>
          <h3 style="font-size:22px; color:var(--color-secondary); margin-top:4px;">+ ${window.Security.maskMoney(totalIn)}</h3>
        </div>
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600;">TOTAL SAÍDAS (PAGAS)</span>
          <h3 style="font-size:22px; color:var(--color-danger); margin-top:4px;">- ${window.Security.maskMoney(totalOut)}</h3>
        </div>
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600;">SALDO CONSOLIDADO EM CONTA</span>
          <h3 style="font-size:22px; color:var(--color-primary); margin-top:4px;">${window.Security.maskMoney(runningBalance)}</h3>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <h3 class="card-title">${window.UI.icon('list', 18)} Livro Razão e Extrato Bancário</h3>
          <button class="btn btn-outline btn-sm" onclick="window.UI.toast('Exportando extrato completo em CSV...', 'info')">
            ${window.UI.icon('download', 14)} Exportar CSV
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
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
              ${rows.map(r => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.desc}</td>
                  <td><span class="badge badge-${r.type === 'Entrada' ? 'success' : 'danger'}">${r.type}</span></td>
                  <td style="color:${r.amount > 0 ? 'var(--color-secondary)' : 'var(--color-danger)'}; font-weight:600;">
                    ${r.amount > 0 ? '+' : ''} ${window.Security.maskMoney(r.amount)}
                  </td>
                  <td><b>${window.Security.maskMoney(r.balance)}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // 4. ORÇAMENTO ANUAL
  renderBudget(el) {
    const categories = [
      { cat: 'Limpeza & Conservação', orc: 74400, real: 71200 },
      { cat: 'Segurança & Monitoramento', orc: 54000, real: 54000 },
      { cat: 'Manutenção de Elevadores', orc: 33600, real: 36800 },
      { cat: 'Água & Esgoto Coletivo (Sabesp - Incluso na Cota)', orc: 25200, real: 23900 },
      { cat: 'Energia Elétrica (Enel)', orc: 41400, real: 45200 },
      { cat: 'Honorários Administradora', orc: 45600, real: 45600 },
      { cat: 'Seguro Predial Obrigatório', orc: 22200, real: 21800 },
      { cat: 'Manutenções Gerais & Obras', orc: 30000, real: 34500 }
    ];

    const totalOrc = categories.reduce((acc, c) => acc + c.orc, 0);
    const totalReal = categories.reduce((acc, c) => acc + c.real, 0);
    const budgetYear = new Date().getFullYear();

    el.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 class="card-title">${window.UI.icon('pie-chart', 18)} Comparativo Orçado vs Realizado (Exercício ${budgetYear})</h3>
          <button class="btn btn-outline btn-sm" onclick="window.UI.toast('Edição orçamentária disponível em modo administrativo', 'info')">
            ${window.UI.icon('edit', 14)} Editar Orçamento
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
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
              ${categories.map(c => {
                const diff = c.real - c.orc;
                const perc = ((diff / c.orc) * 100).toFixed(1);
                const isOver = diff > 0;
                return `
                  <tr style="${Math.abs(perc) > 10 ? (isOver ? 'background:#FEF2F2;' : 'background:#F0FDF4;') : ''}">
                    <td><b>${c.cat}</b></td>
                    <td>${window.Security.maskMoney(c.orc)}</td>
                    <td><b>${window.Security.maskMoney(c.real)}</b></td>
                    <td style="color:${isOver ? 'var(--color-danger)' : 'var(--color-secondary)'}; font-weight:600;">
                      ${isOver ? '+' : ''}${window.Security.maskMoney(diff)}
                    </td>
                    <td><b>${perc}%</b></td>
                    <td>
                      <span class="badge badge-${isOver ? (perc > 10 ? 'danger' : 'warning') : 'success'}">
                        ${isOver ? 'Acima do Orçado' : 'Dentro do Orçado'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
              <tr style="background:var(--color-bg); font-weight:700;">
                <td>TOTAIS GERAIS</td>
                <td>${window.Security.maskMoney(totalOrc)}</td>
                <td>${window.Security.maskMoney(totalReal)}</td>
                <td style="color:${totalReal > totalOrc ? 'var(--color-danger)' : 'var(--color-secondary)'};">
                  ${totalReal > totalOrc ? '+' : ''}${window.Security.maskMoney(totalReal - totalOrc)}
                </td>
                <td>${(((totalReal - totalOrc) / totalOrc) * 100).toFixed(1)}%</td>
                <td>${window.UI.badge(totalReal > totalOrc ? 'Acima do Orçado' : 'Dentro do Orçado')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // ============================================================
  // GESTÃO DE MULTAS & ADVERTÊNCIAS (INFRAÇÕES E REGULAMENTO)
  // ============================================================

  INFRACTIONS_CATALOG: [
    'Barulho excessivo e perturbação do sossego após 22h (Art. 42)',
    'Uso irregular de vaga de garagem ou obstrução da via interna (Art. 18)',
    'Descarte irregular de entulho/lixo em áreas comuns (Art. 27)',
    'Animais soltos sem coleira/guia em áreas sociais restritas (Art. 35)',
    'Alteração de padrão de fachada/esquadria sem aprovação prévia (Art. 12)',
    'Uso indevido ou dano ao mobiliário e área de lazer (Art. 50)',
    'Excesso de velocidade nas vias internas do condomínio (Art. 60)',
    'Dano ou vandalismo ao patrimônio coletivo predial (Art. 64)',
    'Realização de obras em horários não permitidos (Art. 31)',
    'Fumar em áreas comuns fechadas (Lei Antifumo e Regulamento) (Art. 72)'
  ],

  initFines() {
    let fines = window.Storage.get('fines');
    if (!fines || !Array.isArray(fines) || fines.length === 0) {
      fines = [
        {
          id: 'fn-001',
          unit: 'A202',
          resident: 'Mariana Duarte Souza',
          type: '1ª Advertência',
          infraction: 'Barulho excessivo e perturbação do sossego após 22h (Art. 42)',
          amount: 0,
          infractionDate: '2026-09-08',
          notifiedAt: '2026-09-09',
          description: 'Som em volume excessivo com diversas reclamações de vizinhos dos apartamentos A102 e A302.',
          status: 'Notificado'
        },
        {
          id: 'fn-002',
          unit: 'B104',
          resident: 'Lucas Nogueira Pinheiro',
          type: '2ª Advertência',
          infraction: 'Uso irregular de vaga de garagem ou obstrução da via interna (Art. 18)',
          amount: 0,
          infractionDate: '2026-09-12',
          notifiedAt: '2026-09-13',
          description: 'Veículo estacionado sobre a faixa de circulação de pedestres impedindo manobras na vaga B105.',
          status: 'Notificado'
        },
        {
          id: 'fn-003',
          unit: 'A202',
          resident: 'Mariana Duarte Souza',
          type: 'Multa',
          infraction: 'Barulho excessivo e perturbação do sossego após 22h (Art. 42)',
          amount: 400,
          infractionDate: '2026-09-18',
          notifiedAt: '2026-09-19',
          description: 'Reincidência constatada de festividade ruidosa de madrugada. Aplicação de multa de 50% da cota condominial.',
          status: 'Confirmado'
        }
      ];
      window.Storage.set('fines', fines);
    }
    return fines;
  },

  renderFines(container) {
    const fines = this.initFines();
    const residents = window.Storage.get('residents') || [];

    const filterStatus = this._finesFilterStatus || 'Todos';
    const filterUnit = this._finesFilterUnit || 'Todas';
    const searchQuery = (this._finesSearchQuery || '').toLowerCase();

    const totalWarnings = fines.filter(f => f.type.includes('Advertência') && f.status !== 'Cancelado').length;
    const totalFines = fines.filter(f => f.type === 'Multa' && f.status !== 'Cancelado').length;
    const totalFinesAmount = fines.filter(f => f.type === 'Multa' && f.status !== 'Cancelado').reduce((acc, f) => acc + (f.amount || 0), 0);
    const paidFines = fines.filter(f => f.status === 'Pago').length;

    const filtered = fines.filter(f => {
      if (filterStatus !== 'Todos' && f.status !== filterStatus) return false;
      if (filterUnit !== 'Todas' && f.unit !== filterUnit) return false;
      if (searchQuery) {
        const text = `${f.unit} ${f.resident} ${f.infraction} ${f.type} ${f.description}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const uniqueUnits = [...new Set(residents.map(r => r.unit))].sort();

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:20px;" class="grid-4">
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Advertências Aplicadas</span>
          <h3 style="font-size:24px; color:#D97706; margin-top:4px;">${totalWarnings}</h3>
          <span style="font-size:11px; color:var(--color-text-muted);">1ª e 2ª advertências ativas</span>
        </div>
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Multas Emitidas</span>
          <h3 style="font-size:24px; color:var(--color-danger); margin-top:4px;">${totalFines}</h3>
          <span style="font-size:11px; color:var(--color-text-muted);">Com valor financeiro lançado</span>
        </div>
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Volume de Multas</span>
          <h3 style="font-size:24px; color:var(--color-primary); margin-top:4px;">${window.Security.maskMoney(totalFinesAmount)}</h3>
          <span style="font-size:11px; color:var(--color-text-muted);">Integrado ao Contas a Receber</span>
        </div>
        <div class="card" style="margin-bottom:0;">
          <span style="font-size:12px; color:var(--color-text-muted); font-weight:600; text-transform:uppercase;">Multas Liquidadas</span>
          <h3 style="font-size:24px; color:var(--color-secondary); margin-top:4px;">${paidFines} / ${totalFines}</h3>
          <span style="font-size:11px; color:var(--color-text-muted);">${totalFines > 0 ? Math.round((paidFines / totalFines) * 100) : 0}% de resolução</span>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <h3 class="card-title" style="margin:0 0 4px; display:flex; align-items:center; gap:8px;">
              ${window.UI.icon('alert-octagon', 18)} Gestão de Multas & Advertências
            </h3>
            <p style="font-size:12px; color:var(--color-text-muted); margin:0;">
              Fluxo formal automatizado: <b>1ª Advertência</b> ➔ <b>2ª Advertência</b> ➔ <b>Multa Pecuniária</b> (Art. 1.336/1.337 CC)
            </p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-primary btn-sm" onclick="Modules.financial.modalNovaMulta()">
              ${window.UI.icon('plus', 14)} Nova Advertência / Multa
            </button>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center; background:var(--color-bg); padding:10px; border-radius:8px; border:1px solid var(--color-border);">
          <div style="flex:1; min-width:180px;">
            <input type="text" id="fines-search-input" class="form-control" placeholder="Buscar por morador, infração, apto..." value="${window.Security.sanitize(this._finesSearchQuery || '')}" oninput="Modules.financial.onFinesSearch(this.value)" />
          </div>
          <div style="width:160px;">
            <select class="form-control" onchange="Modules.financial.onFinesFilterStatus(this.value)">
              <option value="Todos" ${filterStatus === 'Todos' ? 'selected' : ''}>Status: Todos</option>
              <option value="Notificado" ${filterStatus === 'Notificado' ? 'selected' : ''}>Notificado</option>
              <option value="Recorrido" ${filterStatus === 'Recorrido' ? 'selected' : ''}>Recorrido</option>
              <option value="Confirmado" ${filterStatus === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="Pago" ${filterStatus === 'Pago' ? 'selected' : ''}>Pago</option>
              <option value="Cancelado" ${filterStatus === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
          <div style="width:140px;">
            <select class="form-control" onchange="Modules.financial.onFinesFilterUnit(this.value)">
              <option value="Todas" ${filterUnit === 'Todas' ? 'selected' : ''}>Unidade: Todas</option>
              ${uniqueUnits.map(u => `<option value="${u}" ${filterUnit === u ? 'selected' : ''}>Apto ${u}</option>`).join('')}
            </select>
          </div>
          ${(filterStatus !== 'Todos' || filterUnit !== 'Todas' || searchQuery) ? `
            <button class="btn btn-ghost btn-sm" onclick="Modules.financial.clearFinesFilters()">Limpar filtros</button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Unidade & Morador</th>
                <th>Grau / Tipo</th>
                <th>Infração ao Regulamento</th>
                <th>Valor</th>
                <th>Data Fato</th>
                <th>Notificado em</th>
                <th>Status</th>
                <th style="text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align:center; padding:32px; color:var(--color-text-muted);">
                    Nenhuma advertência ou multa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ` : filtered.map(fn => {
                const isFine = fn.type === 'Multa';
                const badgeClass = fn.type === '1ª Advertência' ? 'badge-info' : (fn.type === '2ª Advertência' ? 'badge-warning' : 'badge-danger');
                const statusBadge = fn.status === 'Pago' ? 'badge-success' : (fn.status === 'Confirmado' ? 'badge-danger' : (fn.status === 'Recorrido' ? 'badge-warning' : (fn.status === 'Cancelado' ? 'badge-muted' : 'badge-info')));

                return `
                  <tr>
                    <td>
                      <b>Apto ${fn.unit}</b>
                      <div style="font-size:12px; color:var(--color-text-muted);">${window.Security.sanitize(fn.resident)}</div>
                    </td>
                    <td>
                      <span class="badge ${badgeClass}" style="font-weight:700;">${fn.type}</span>
                    </td>
                    <td>
                      <span style="font-size:12px; font-weight:600; color:var(--color-text);">${window.Security.sanitize(fn.infraction)}</span>
                      <p style="font-size:11px; color:var(--color-text-muted); margin:2px 0 0; max-width:240px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                        ${window.Security.sanitize(fn.description)}
                      </p>
                    </td>
                    <td>
                      <b style="font-size:13px; color:${isFine ? 'var(--color-danger)' : 'var(--color-text-muted)'};">
                        ${fn.amount > 0 ? window.Security.maskMoney(fn.amount) : 'R$ 0,00'}
                      </b>
                    </td>
                    <td style="font-size:12px;">${fn.infractionDate}</td>
                    <td style="font-size:12px;">${fn.notifiedAt}</td>
                    <td>
                      <span class="badge ${statusBadge}">${fn.status}</span>
                    </td>
                    <td style="text-align:right; white-space:nowrap;">
                      <button class="btn btn-sm btn-outline" onclick="Modules.financial.modalVerMulta('${fn.id}')" title="Ver Notificação Formal">
                        ${window.UI.icon('file-text', 13)} Ver
                      </button>
                      <button class="btn btn-sm btn-outline" onclick="Modules.financial.verHistoricoUnidade('${fn.unit}')" title="Histórico da Unidade">
                        ${window.UI.icon('history', 13)}
                      </button>
                      ${fn.status !== 'Pago' && fn.status !== 'Cancelado' ? `
                        <button class="btn btn-sm btn-secondary" onclick="Modules.financial.modalAlterarStatusMulta('${fn.id}')" title="Atualizar Status">
                          ${window.UI.icon('check', 13)}
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  onFinesSearch(val) {
    this._finesSearchQuery = val;
    const el = document.getElementById('financial-tab-content');
    if (el) this.renderFines(el);
  },

  onFinesFilterStatus(val) {
    this._finesFilterStatus = val;
    const el = document.getElementById('financial-tab-content');
    if (el) this.renderFines(el);
  },

  onFinesFilterUnit(val) {
    this._finesFilterUnit = val;
    const el = document.getElementById('financial-tab-content');
    if (el) this.renderFines(el);
  },

  clearFinesFilters() {
    this._finesFilterStatus = 'Todos';
    this._finesFilterUnit = 'Todas';
    this._finesSearchQuery = '';
    const el = document.getElementById('financial-tab-content');
    if (el) this.renderFines(el);
  },

  getSuggestedTypeForUnit(unit) {
    const fines = window.Storage.get('fines') || [];
    const activeUnitFines = fines.filter(f => f.unit === unit && f.status !== 'Cancelado');
    const count = activeUnitFines.length;

    if (count === 0) {
      return {
        type: '1ª Advertência',
        amount: 0,
        count: 0,
        explanation: 'Primeira ocorrência para esta unidade: 1ª Advertência formal sem aplicação de multa.'
      };
    } else if (count === 1) {
      return {
        type: '2ª Advertência',
        amount: 0,
        count: 1,
        explanation: 'Unidade possui 1 advertência anterior: 2ª Advertência (último aviso antes de multa pecuniária).'
      };
    } else {
      return {
        type: 'Multa',
        amount: 400,
        count: count,
        explanation: `Unidade reincidente (${count} registros ativos): Aplicação direta de MULTA PECUNIÁRIA recomendada!`
      };
    }
  },

  modalNovaMulta(unitPrefill = null) {
    const residents = window.Storage.get('residents') || [];
    const defaultUnit = unitPrefill || (residents[0] ? residents[0].unit : 'A101');
    const residentObj = residents.find(r => r.unit === defaultUnit) || { name: 'Morador' };
    const suggestion = this.getSuggestedTypeForUnit(defaultUnit);
    const today = new Date().toISOString().substring(0, 10);

    const content = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Unidade (Apartamento) *</label>
            <select id="fine-unit" class="form-control" onchange="Modules.financial.onUnitChangeInModal(this.value)">
              ${residents.map(r => `<option value="${r.unit}" ${r.unit === defaultUnit ? 'selected' : ''}>Apto ${r.unit} - ${window.Security.sanitize(r.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Morador Responsável *</label>
            <input type="text" id="fine-resident" class="form-control" value="${window.Security.sanitize(residentObj.name)}" readonly style="background:var(--color-bg);" />
          </div>
        </div>

        <!-- BOX DO FLUXO AUTOMATIZADO / RECOMENDAÇÃO -->
        <div id="fine-escalation-box" style="padding:10px 12px; border-radius:6px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); font-size:12px; color:var(--color-primary);">
          ${window.UI.icon('info', 14)} <span id="fine-escalation-text"><b>Fluxo automático:</b> ${suggestion.explanation}</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Grau / Tipo de Notificação *</label>
            <select id="fine-type" class="form-control" onchange="Modules.financial.onFineTypeChange(this.value)">
              <option value="1ª Advertência" ${suggestion.type === '1ª Advertência' ? 'selected' : ''}>1ª Advertência (Sem multa)</option>
              <option value="2ª Advertência" ${suggestion.type === '2ª Advertência' ? 'selected' : ''}>2ª Advertência (Último aviso)</option>
              <option value="Multa" ${suggestion.type === 'Multa' ? 'selected' : ''}>Multa (Com valor financeiro)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Valor da Multa (R$)</label>
            <input type="number" id="fine-amount" class="form-control" value="${suggestion.amount}" ${suggestion.type !== 'Multa' ? 'disabled' : ''} step="50" min="0" placeholder="0.00" />
            <span style="font-size:10px; color:var(--color-text-muted);">Taxa padrão: R$ 400,00 (50% da cota)</span>
          </div>
        </div>

        <div>
          <label class="form-label">Infração ao Regulamento Interno *</label>
          <select id="fine-infraction" class="form-control">
            ${this.INFRACTIONS_CATALOG.map(inf => `<option value="${inf}">${inf}</option>`).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Data do Fato (Infração) *</label>
            <input type="date" id="fine-date" class="form-control" value="${today}" />
          </div>
          <div>
            <label class="form-label">Data da Notificação *</label>
            <input type="date" id="fine-notified-at" class="form-control" value="${today}" />
          </div>
        </div>

        <div>
          <label class="form-label">Descrição Circunstanciada dos Fatos *</label>
          <textarea id="fine-description" class="form-control" rows="3" placeholder="Descreva os fatos detalhadamente, testemunhas, registros de portaria ou imagens de câmeras..."></textarea>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Emitir Nova Advertência ou Multa',
      size: 'md',
      content: content,
      buttons: [
        {
          label: 'Emitir Notificação',
          className: 'btn-primary',
          onClick: () => {
            const unit = document.getElementById('fine-unit').value;
            const resident = document.getElementById('fine-resident').value;
            const type = document.getElementById('fine-type').value;
            const amountInput = document.getElementById('fine-amount').value;
            const infraction = document.getElementById('fine-infraction').value;
            const infractionDate = document.getElementById('fine-date').value;
            const notifiedAt = document.getElementById('fine-notified-at').value;
            const description = document.getElementById('fine-description').value.trim();

            if (!description) {
              window.UI.toast('Por favor, informe a descrição dos fatos.', 'danger');
              return;
            }

            const cleanUnit = window.Security.sanitize(unit);
            const cleanResident = window.Security.sanitize(resident);
            const cleanType = window.Security.sanitize(type);
            const cleanInfraction = window.Security.sanitize(infraction);
            const cleanDescription = window.Security.sanitize(description);
            const numAmount = cleanType === 'Multa' ? (parseFloat(amountInput) || 400) : 0;

            const newFine = {
              id: 'fn-' + Date.now(),
              unit: cleanUnit,
              resident: cleanResident,
              type: cleanType,
              infraction: cleanInfraction,
              amount: numAmount,
              infractionDate: infractionDate,
              notifiedAt: notifiedAt,
              description: cleanDescription,
              status: cleanType === 'Multa' ? 'Confirmado' : 'Notificado'
            };

            const fines = window.Storage.get('fines') || [];
            fines.unshift(newFine);
            window.Storage.set('fines', fines);

            // Integração automática com Contas a Receber caso seja multa pecuniária
            if (cleanType === 'Multa' && numAmount > 0) {
              const receivables = window.Storage.get('receivables') || [];
              const recDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
              receivables.push({
                id: 'rec_fine_' + newFine.id,
                unit: cleanUnit,
                resident: cleanResident,
                description: `Multa: ${cleanInfraction.split('(')[0].trim()}`,
                amount: numAmount,
                dueDate: recDueDate,
                status: 'Pendente',
                ref: new Date().toISOString().substring(0, 7)
              });
              window.Storage.set('receivables', receivables);
            }

            // Notificação em tempo real no app
            if (window.Notifications && window.Notifications.add) {
              window.Notifications.add({
                title: `${cleanType} aplicada na Unidade ${cleanUnit}`,
                message: `${cleanResident} foi notificado: ${cleanInfraction}`,
                type: 'warning',
                link: '#financial'
              });
            }

            // Registro no Log de Auditoria
            window.Audit.log(
              'NOVA_INFRACAO',
              'financial',
              `${cleanType} aplicada para Unidade ${cleanUnit} (${cleanResident}) - ${cleanInfraction}`
            );

            window.UI.toast(`${cleanType} gerada com sucesso para a Unidade ${cleanUnit}!`, 'success');
            const el = document.getElementById('financial-tab-content');
            if (el) this.renderFines(el);
          }
        },
        { label: 'Cancelar', className: 'btn-outline' }
      ]
    });
  },

  onUnitChangeInModal(unit) {
    const residents = window.Storage.get('residents') || [];
    const res = residents.find(r => r.unit === unit);
    const resInput = document.getElementById('fine-resident');
    if (resInput && res) resInput.value = res.name;

    const suggestion = this.getSuggestedTypeForUnit(unit);
    const typeSelect = document.getElementById('fine-type');
    const amountInput = document.getElementById('fine-amount');
    const boxText = document.getElementById('fine-escalation-text');

    if (typeSelect) typeSelect.value = suggestion.type;
    if (amountInput) {
      amountInput.value = suggestion.amount;
      amountInput.disabled = suggestion.type !== 'Multa';
    }
    if (boxText) {
      boxText.innerHTML = `<b>Fluxo automático:</b> ${suggestion.explanation}`;
    }
  },

  onFineTypeChange(type) {
    const amountInput = document.getElementById('fine-amount');
    if (amountInput) {
      if (type === 'Multa') {
        amountInput.disabled = false;
        if (!parseFloat(amountInput.value)) amountInput.value = 400;
      } else {
        amountInput.disabled = true;
        amountInput.value = 0;
      }
    }
  },

  verHistoricoUnidade(unit) {
    const fines = (window.Storage.get('fines') || []).filter(f => f.unit === unit);
    const occurrences = (window.Storage.get('occurrences') || []).filter(o => o.unit === unit);
    const residents = window.Storage.get('residents') || [];
    const res = residents.find(r => r.unit === unit) || { name: 'Morador da Unidade' };

    const content = `
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg); padding:12px; border-radius:8px; border:1px solid var(--color-border);">
          <div>
            <h4 style="margin:0; font-size:15px; font-weight:700;">Prontuário Disciplinar • Unidade ${unit}</h4>
            <p style="margin:2px 0 0; font-size:12px; color:var(--color-text-muted);">Responsável: <b>${window.Security.sanitize(res.name)}</b></p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Modules.financial.modalNovaMulta('${unit}')">
            ${window.UI.icon('plus', 13)} Nova Notificação
          </button>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <h5 style="font-size:13px; font-weight:700; margin:0 0 8px; color:var(--color-text);">Histórico de Advertências e Multas (${fines.length})</h5>
        ${fines.length === 0 ? `
          <div style="padding:16px; text-align:center; font-size:12px; color:var(--color-text-muted); background:var(--color-bg); border-radius:6px;">
            Nenhuma advertência ou multa registrada para esta unidade.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${fines.map((f, i) => `
              <div style="padding:10px 12px; border-radius:6px; border:1px solid var(--color-border); background:var(--color-bg); display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge ${f.type === '1ª Advertência' ? 'badge-info' : (f.type === '2ª Advertência' ? 'badge-warning' : 'badge-danger')}">${f.type}</span>
                    <b style="font-size:13px;">${window.Security.sanitize(f.infraction)}</b>
                  </div>
                  <p style="font-size:12px; color:var(--color-text-muted); margin:4px 0 0;">${window.Security.sanitize(f.description)}</p>
                  <div style="font-size:11px; color:var(--color-text-muted); margin-top:4px;">
                    Data do fato: <b>${f.infractionDate}</b> • Notificado em: <b>${f.notifiedAt}</b>
                  </div>
                </div>
                <div style="text-align:right;">
                  <b style="font-size:13px; color:${f.amount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'};">
                    ${f.amount > 0 ? window.Security.maskMoney(f.amount) : 'Sem valor pecuniário'}
                  </b>
                  <div style="margin-top:4px;">
                    <span class="badge ${f.status === 'Pago' ? 'badge-success' : (f.status === 'Confirmado' ? 'badge-danger' : 'badge-info')}">${f.status}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div>
        <h5 style="font-size:13px; font-weight:700; margin:0 0 8px; color:var(--color-text);">Ocorrências Envolvendo a Unidade (${occurrences.length})</h5>
        ${occurrences.length === 0 ? `
          <div style="padding:12px; text-align:center; font-size:12px; color:var(--color-text-muted); background:var(--color-bg); border-radius:6px;">
            Nenhuma ocorrência registrada no livro de portaria.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${occurrences.map(o => `
              <div style="padding:8px 12px; border-radius:6px; border:1px solid var(--color-border); font-size:12px; display:flex; justify-content:space-between;">
                <div>
                  <b>${window.Security.sanitize(o.title)}</b> (${o.category})
                  <span style="color:var(--color-text-muted); margin-left:6px;">- ${o.date}</span>
                </div>
                <span class="badge badge-muted">${o.status}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    window.UI.modal({
      title: `Prontuário Disciplinar - Apto ${unit}`,
      size: 'lg',
      content: content,
      buttons: [{ label: 'Fechar', className: 'btn-primary' }]
    });
  },

  modalVerMulta(fineId) {
    const fines = window.Storage.get('fines') || [];
    const fn = fines.find(f => f.id === fineId);
    if (!fn) return;

    const condo = window.Storage.get('condo') || {};

    const content = `
      <div id="print-fine-notification" style="border:1px solid var(--color-border); padding:20px; border-radius:8px; background:var(--color-bg);">
        <div style="text-align:center; border-bottom:2px solid var(--color-border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="margin:0; font-size:16px; font-weight:800; text-transform:uppercase;">${window.Security.sanitize(condo.name || 'Residencial das Palmeiras')}</h3>
          <p style="margin:2px 0 0; font-size:12px; color:var(--color-text-muted);">CNPJ: ${condo.cnpj || '12.345.678/0001-90'} • Gestão Administrativa Oficial</p>
          <div style="display:inline-block; margin-top:8px; padding:4px 12px; border-radius:4px; font-weight:700; font-size:13px; text-transform:uppercase; background:${fn.type === 'Multa' ? '#FEE2E2; color:#991B1B;' : '#FEF3C7; color:#92400E;'}">
            NOTIFICAÇÃO FORMAL: ${fn.type}
          </div>
        </div>

        <div style="font-size:13px; line-height:1.6; display:flex; flex-direction:column; gap:10px;">
          <p><b>À Unidade:</b> Apto ${fn.unit} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Destinatário:</b> ${window.Security.sanitize(fn.resident)}</p>
          <p><b>Data da Infração:</b> ${fn.infractionDate} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Data de Expedição:</b> ${fn.notifiedAt}</p>
          <p><b>Infração Tipificada:</b> <span style="font-weight:700; color:var(--color-danger);">${window.Security.sanitize(fn.infraction)}</span></p>

          <div style="background:var(--color-surface); padding:12px; border-radius:6px; border:1px solid var(--color-border); margin:8px 0;">
            <b style="display:block; margin-bottom:4px; font-size:12px; text-transform:uppercase; color:var(--color-text-muted);">Histórico Circunstanciado dos Fatos:</b>
            <p style="margin:0; font-style:italic;">"${window.Security.sanitize(fn.description)}"</p>
          </div>

          ${fn.type === 'Multa' ? `
            <div style="padding:10px; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; color:#1E40AF; font-size:12px;">
              <b>Penalidade Pecuniária:</b> Valor de <b>${window.Security.maskMoney(fn.amount)}</b> lançado na cota condominial, com vencimento em 15 dias.
            </div>
          ` : `
            <div style="padding:10px; background:#FEF3C7; border:1px solid #FDE68A; border-radius:6px; color:#92400E; font-size:12px;">
              <b>Advertência Educativa:</b> Não há imposição pecuniária nesta notificação. Solicitamos a imediata cessação da conduta sob pena de aplicação de multa na próxima reincidência.
            </div>
          `}

          <p style="font-size:11px; color:var(--color-text-muted); margin-top:12px;">
            Fica assegurado ao condômino o prazo de 10 (dez) dias corridos para interposição de recurso por escrito direcionado ao Conselho Consultivo/Fiscal e ao Síndico.
          </p>
        </div>
      </div>
    `;

    window.UI.modal({
      title: `Notificação Formal - ${fn.type} (Apto ${fn.unit})`,
      size: 'md',
      content: content,
      buttons: [
        {
          label: 'Imprimir / Salvar PDF',
          className: 'btn-secondary',
          onClick: () => {
            window.print();
          }
        },
        { label: 'Fechar', className: 'btn-outline' }
      ]
    });
  },

  modalAlterarStatusMulta(fineId) {
    const fines = window.Storage.get('fines') || [];
    const fn = fines.find(f => f.id === fineId);
    if (!fn) return;

    const content = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <p style="font-size:13px; margin:0;">
          Alterando o status da infração para a <b>Unidade ${fn.unit}</b> (${fn.type}):
        </p>
        <div>
          <label class="form-label">Novo Status</label>
          <select id="modal-fine-status" class="form-control">
            <option value="Notificado" ${fn.status === 'Notificado' ? 'selected' : ''}>Notificado</option>
            <option value="Recorrido" ${fn.status === 'Recorrido' ? 'selected' : ''}>Recorrido (Aguardando análise de recurso)</option>
            <option value="Confirmado" ${fn.status === 'Confirmado' ? 'selected' : ''}>Confirmado (Recurso rejeitado ou prazo esgotado)</option>
            <option value="Pago" ${fn.status === 'Pago' ? 'selected' : ''}>Pago (Multa liquidada)</option>
            <option value="Cancelado" ${fn.status === 'Cancelado' ? 'selected' : ''}>Cancelado (Advertência/Multa anulada)</option>
          </select>
        </div>
        <div>
          <label class="form-label">Observações da Atualização</label>
          <textarea id="modal-fine-notes" class="form-control" rows="2" placeholder="Motivo da alteração de status ou decisão do recurso..."></textarea>
        </div>
      </div>
    `;

    window.UI.modal({
      title: 'Atualizar Status da Notificação',
      size: 'sm',
      content: content,
      buttons: [
        {
          label: 'Salvar Alteração',
          className: 'btn-primary',
          onClick: () => {
            const newStatus = document.getElementById('modal-fine-status').value;
            const notes = document.getElementById('modal-fine-notes').value.trim();

            fn.status = newStatus;
            if (notes) {
              fn.description += ` [Atualização ${new Date().toISOString().substring(0, 10)}: Status alterado para ${newStatus} - ${window.Security.sanitize(notes)}]`;
            }
            window.Storage.set('fines', fines);

            // Atualiza status no contas a receber se houver
            if (fn.type === 'Multa') {
              const receivables = window.Storage.get('receivables') || [];
              const rec = receivables.find(r => r.id === 'rec_fine_' + fn.id);
              if (rec) {
                if (newStatus === 'Pago') rec.status = 'Pago';
                if (newStatus === 'Cancelado') rec.status = 'Cancelado';
                window.Storage.set('receivables', receivables);
              }
            }

            window.Audit.log('STATUS_MULTA', 'financial', `Status da infração ${fn.id} (Apto ${fn.unit}) alterado para ${newStatus}`);
            window.UI.toast(`Status atualizado para '${newStatus}' com sucesso!`, 'success');

            const el = document.getElementById('financial-tab-content');
            if (el) this.renderFines(el);
          }
        },
        { label: 'Cancelar', className: 'btn-outline' }
      ]
    });
  }
};
// === FIM DO modules1.js ===
