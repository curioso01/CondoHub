// SISTEMA CORE: STORAGE, AUDIT, SECURITY, AUTH, UI, ROUTER

window.Storage = {
  prefix: 'condohub_',
  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage.get error', e);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      // Dispara eventos globais para atualização reativa em tempo real da aplicação
      window.dispatchEvent(new CustomEvent('condohub_storage', { detail: { key, value } }));
      if (key === 'receivables' || key === 'payables' || key === 'financial_months') {
        window.dispatchEvent(new CustomEvent('condohub_financial_change', { detail: { key, value } }));
      }
    } catch (e) {
      console.error('Storage.set error', e);
    }
  },
  remove(key) {
    localStorage.removeItem(this.prefix + key);
    window.dispatchEvent(new CustomEvent('condohub_storage', { detail: { key, value: null } }));
  },
  clear() {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(this.prefix)) localStorage.removeItem(k);
    });
  },
  seed() {
    if (!this.get('condo') && window.CondoSeed) {
      Object.keys(window.CondoSeed).forEach(k => {
        this.set(k, window.CondoSeed[k]);
      });
      console.log('CondoHub: Banco de dados local inicializado com sucesso.');
    }
  }
};

window.Audit = {
  formatDetails(details) {
    if (!details) return '';
    if (typeof details === 'string') {
      const trimmed = details.trim();
      if (trimmed === '' || trimmed === '{}' || trimmed === '{"sub":null}' || trimmed === 'null' || trimmed === 'undefined') {
        return '';
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          return this.formatDetails(parsed);
        }
      } catch (e) {
        return details;
      }
    }
    if (typeof details === 'object') {
      const labels = {
        unit: 'Unidade',
        unitId: 'Unidade',
        amount: 'Valor',
        supplier: 'Fornecedor',
        area: 'Área',
        date: 'Data',
        name: 'Nome',
        title: 'Título',
        status: 'Status',
        category: 'Categoria',
        method: 'Forma',
        count: 'Qtd',
        email: 'E-mail',
        role: 'Perfil',
        total: 'Total',
        pickedBy: 'Retirado por',
        opt: 'Opção de Voto',
        column: 'Fase'
      };
      const parts = [];
      for (const [k, v] of Object.entries(details)) {
        if (v !== null && v !== undefined && v !== '' && k !== 'sub' && k !== 'id' && k !== 'userId') {
          const label = labels[k] || k;
          const val = typeof v === 'number' && (k === 'amount' || k === 'total') 
            ? window.Security.maskMoney(v) 
            : v;
          parts.push(`${label}: ${val}`);
        }
      }
      return parts.join(' • ');
    }
    return String(details);
  },

  log(action, details = {}, module = 'Geral') {
    /* PRODUÇÃO: Enviar para servidor com assinatura HMAC-SHA256 para não-repúdio */
    const session = window.Storage ? window.Storage.get('session') : null;
    const user = session ? session.user : null;
    const logs = (window.Storage && window.Storage.get('audit_logs')) || [];
    const formatted = this.formatDetails(details);
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user ? user.id : 'anon',
      userName: user ? user.name : 'Sistema/Anônimo',
      role: user ? user.role : 'ANON',
      module: module,
      action: action,
      details: formatted,
      ip: '189.120.45.' + Math.floor(Math.random() * 200 + 10) /* Simulado */
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.length = 500;
    window.Storage.set('audit_logs', logs);
  },
  getLogs(filter = {}) {
    let logs = (window.Storage && window.Storage.get('audit_logs')) || [];
    // Filtrar entradas de navegação interna se houver alguma antiga
    logs = logs.filter(l => !l.action.startsWith('Acesso ao Módulo'));
    if (filter.module) logs = logs.filter(l => l.module === filter.module);
    if (filter.userId) logs = logs.filter(l => l.userId === filter.userId);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(l => (l.details && l.details.toLowerCase().includes(q)) || (l.action && l.action.toLowerCase().includes(q)) || (l.userName && l.userName.toLowerCase().includes(q)));
    }
    return logs.map(l => ({ ...l, details: this.formatDetails(l.details) }));
  }
};

window.Security = {
  sanitize(str) {
    /* PRODUÇÃO: Utilizar DOMPurify para HTML rico ou sanitização estrita no backend */
    if (str === null || str === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    return String(str).replace(/[&<>"'/]/g, s => map[s]);
  },

  validateCPF(cpf) {
    /* Algoritmo oficial de verificação de CPF (Módulo 11) */
    if (!cpf) return false;
    const clean = String(cpf).replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false; // Rejeita 111.111.111-11, etc.
    
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(10, 11))) return false;

    return true;
  },

  validateCNPJ(cnpj) {
    /* Algoritmo oficial de verificação de CNPJ */
    if (!cnpj) return false;
    const clean = String(cnpj).replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(clean)) return false;

    let size = clean.length - 2;
    let numbers = clean.substring(0, size);
    let digits = clean.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = clean.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  },

  validatePassword(pwd) {
    const errors = [];
    if (!pwd || pwd.length < 8) errors.push('Mínimo de 8 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos 1 letra maiúscula');
    if (!/[a-z]/.test(pwd)) errors.push('Pelo menos 1 letra minúscula');
    if (!/[0-9]/.test(pwd)) errors.push('Pelo menos 1 número');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push('Pelo menos 1 caractere especial');

    let strength = 'fraca';
    if (errors.length === 0) strength = 'forte';
    else if (errors.length <= 2 && pwd.length >= 6) strength = 'média';

    return {
      valid: errors.length === 0,
      strength: strength,
      errors: errors
    };
  },

  passwordStrengthBar(pwd) {
    const check = this.validatePassword(pwd || '');
    let color = '#E02424';
    let width = '25%';
    let label = 'Fraca';

    if (check.strength === 'média') {
      color = '#F59E0B';
      width = '60%';
      label = 'Média';
    } else if (check.strength === 'forte') {
      color = '#0E9F6E';
      width = '100%';
      label = 'Forte';
    }

    return `
      <div style="margin-top:6px;">
        <div style="height:4px; width:100%; background:var(--color-border); border-radius:2px; overflow:hidden;">
          <div style="height:100%; width:${width}; background:${color}; transition:all 200ms;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--color-text-muted); margin-top:3px;">
          <span>Força: <b style="color:${color};">${label}</b></span>
          ${check.errors.length ? `<span>${check.errors[0]}</span>` : '<span style="color:#0E9F6E;">✓ Senha segura</span>'}
        </div>
      </div>
    `;
  },

  maskCPF(v) {
    if (!v) return '';
    return String(v).replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  },

  maskCNPJ(v) {
    if (!v) return '';
    return String(v).replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  },

  maskPhone(v) {
    if (!v) return '';
    const clean = String(v).replace(/\D/g, '');
    if (clean.length > 10) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    }
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  },

  maskMoney(v) {
    if (v === null || v === undefined || v === '') return 'R$ 0,00';
    const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, '')) / 100;
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  maskPlate(v) {
    if (!v) return '';
    const clean = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 3 && !clean.includes('-') && /^[A-Z]{3}[0-9]/.test(clean)) {
      return clean.substring(0, 3) + '-' + clean.substring(3, 7);
    }
    return clean.substring(0, 8);
  }
};

window.PERMISSIONS = {
  dashboard:     ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  financial:     ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  maintenance:   ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  assemblies:    ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR'],
  communications:['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  access:        ['SUPER_ADMIN', 'SINDICO', 'PORTEIRO'],
  reservations:  ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  occurrences:   ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO', 'MORADOR', 'PORTEIRO'],
  registry:      ['SUPER_ADMIN', 'SINDICO'],
  reports:       ['SUPER_ADMIN', 'SINDICO', 'CONSELHEIRO'],
  settings:      ['SUPER_ADMIN', 'SINDICO'],
  portal:        ['MORADOR']
};

window.Auth = {
  _users: [
    { id: 'u1', name: 'Carlos Mendonça', email: 'sindico@condohub.com', passwordHash: btoa('salt_condo_' + 'Sindico@2024'), role: 'SINDICO', avatar: 'CM', condoId: 'c1' },
    { id: 'u2', name: 'Ana Paula Ramos', email: 'morador@condohub.com', passwordHash: btoa('salt_condo_' + 'Morador@2024'), role: 'MORADOR', avatar: 'AP', condoId: 'c1', unitId: 'A101' },
    { id: 'u3', name: 'Roberto Silva', email: 'porteiro@condohub.com', passwordHash: btoa('salt_condo_' + 'Porteiro@2024'), role: 'PORTEIRO', avatar: 'RS', condoId: 'c1' },
    { id: 'u4', name: 'Admin Sistema', email: 'admin@condohub.com', passwordHash: btoa('salt_condo_' + 'Admin@2024'), role: 'SUPER_ADMIN', avatar: 'AD', condoId: 'c1' },
    { id: 'u5', name: 'Eduardo Silveira Santos', email: 'conselheiro@condohub.com', passwordHash: btoa('salt_condo_' + 'Conselho@2024'), role: 'CONSELHEIRO', avatar: 'ES', condoId: 'c1', unitId: 'C101' }
  ],

  _attempts: {},

  getRateLimit(email) {
    const key = (email || '').toLowerCase().trim();
    const entry = this._attempts[key];
    if (!entry) return { blocked: false, waitSeconds: 0 };
    const now = Date.now();
    if (entry.count >= 5) {
      const elapsed = Math.floor((now - entry.lastAttempt) / 1000);
      if (elapsed < 30) {
        return { blocked: true, waitSeconds: 30 - elapsed };
      } else {
        delete this._attempts[key];
        return { blocked: false, waitSeconds: 0 };
      }
    }
    return { blocked: false, waitSeconds: 0 };
  },

  recordAttempt(email, success) {
    const key = (email || '').toLowerCase().trim();
    if (success) {
      delete this._attempts[key];
      return;
    }
    if (!this._attempts[key]) {
      this._attempts[key] = { count: 1, lastAttempt: Date.now() };
    } else {
      this._attempts[key].count += 1;
      this._attempts[key].lastAttempt = Date.now();
    }
  },

  login(email, password) {
    /* PRODUÇÃO: Autenticação via endpoint HTTPS seguro com hash Argon2/Bcrypt no servidor e cookies HttpOnly */
    const normalizedEmail = (email || '').toLowerCase().trim();
    const rate = this.getRateLimit(normalizedEmail);
    if (rate.blocked) {
      return {
        success: false,
        error: `Muitas tentativas sem sucesso. Por segurança, aguarde ${rate.waitSeconds}s para tentar novamente.`
      };
    }

    const hashed = btoa('salt_condo_' + password);
    const user = this._users.find(u => u.email.toLowerCase() === normalizedEmail && u.passwordHash === hashed);

    if (!user) {
      this.recordAttempt(normalizedEmail, false);
      window.Audit.log('Falha de Login', { email: normalizedEmail }, 'Autenticação');
      return {
        success: false,
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      };
    }

    this.recordAttempt(normalizedEmail, true);
    const token = this.generateToken(user);
    window.Storage.set('session', { token, user });
    window.Audit.log('Login Bem-Sucedido', { userId: user.id, email: user.email, role: user.role }, 'Autenticação');
    return { success: true, user, token };
  },

  logout() {
    const session = window.Storage ? window.Storage.get('session') : null;
    const user = session ? session.user : null;
    if (window.Storage) window.Storage.remove('session');
    if (user && window.Audit) {
      window.Audit.log('Logout Realizado', { userId: user.id }, 'Autenticação');
    }
    if (window.Router) window.Router.showLogin();
  },

  checkSession() {
    const session = window.Storage ? window.Storage.get('session') : null;
    if (!session || !session.token) return null;
    if (!this.validateToken(session.token)) {
      if (window.Storage) window.Storage.remove('session');
      if (window.UI) window.UI.toast('Sua sessão expirou por segurança (limite 8h). Faça login novamente.', 'warning');
      if (window.Router) window.Router.showLogin();
      return null;
    }
    return session.user;
  },

  generateToken(user) {
    // JWT Simulado: header.payload.signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      uid: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
    }));
    const signature = btoa('mock_signature_' + user.id);
    return `${header}.${payload}.${signature}`;
  },

  validateToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  },

  hasPermission(role, module) {
    if (role === 'SUPER_ADMIN') return true;
    const allowed = window.PERMISSIONS[module];
    return allowed ? allowed.includes(role) : false;
  }
};

window.UI = {
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'warning') iconName = 'alert-circle';

    el.innerHTML = `
      <span style="display:flex; align-items:center;">${window.UI.icon(iconName, 18)}</span>
      <span style="flex:1;">${window.Security.sanitize(message)}</span>
      <button style="background:none; border:none; cursor:pointer; color:var(--color-text-muted);" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 200ms';
      setTimeout(() => el.remove(), 200);
    }, 4000);
  },

  modal({ title, content, buttons = [], size = 'md', onClose = null }) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-overlay" id="active-modal-overlay">
        <div class="modal-dialog modal-${size}" id="active-modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">${window.Security.sanitize(title)}</h3>
            <button class="modal-close-btn" id="modal-close-x-btn">${window.UI.icon('x', 20)}</button>
          </div>
          <div class="modal-body">${content}</div>
          ${buttons && buttons.length ? `
            <div class="modal-footer">
              ${buttons.map((b, idx) => `
                <button class="btn ${b.className || 'btn-outline'}" id="modal-btn-${idx}">
                  ${b.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const overlay = document.getElementById('active-modal-overlay');
    const closeBtn = document.getElementById('modal-close-x-btn');

    const closeModal = () => {
      container.innerHTML = '';
      document.removeEventListener('keydown', handleKey);
      if (onClose) onClose();
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKey);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    closeBtn.addEventListener('click', closeModal);

    buttons.forEach((b, idx) => {
      const btnEl = document.getElementById(`modal-btn-${idx}`);
      if (btnEl) {
        btnEl.addEventListener('click', (e) => {
          if (b.onClick) b.onClick(closeModal, e);
          else closeModal();
        });
      }
    });

    if (window.lucide) window.lucide.createIcons();
    return closeModal;
  },

  closeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  },

  confirm(message, onConfirm, onCancel = null) {
    this.modal({
      title: 'Confirmação',
      size: 'sm',
      content: `<p style="font-size:14px; color:var(--color-text);">${window.Security.sanitize(message)}</p>`,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline', onClick: (close) => { close(); if (onCancel) onCancel(); } },
        { label: 'Confirmar', className: 'btn-primary', onClick: (close) => { close(); if (onConfirm) onConfirm(); } }
      ]
    });
  },

  confirmDestruct(message, onConfirm) {
    const contentHtml = `
      <p style="font-size:14px; color:var(--color-text); margin-bottom:12px;">${window.Security.sanitize(message)}</p>
      <p style="font-size:12px; color:var(--color-danger); font-weight:600; margin-bottom:12px;">Esta ação é irreversível. Digite "<b>CONFIRMAR</b>" abaixo para prosseguir:</p>
      <input type="text" id="destruct-input-confirm" class="form-control" placeholder="CONFIRMAR" autocomplete="off" />
    `;

    this.modal({
      title: 'Ação Destrutiva',
      size: 'sm',
      content: contentHtml,
      buttons: [
        { label: 'Cancelar', className: 'btn-outline', onClick: (close) => close() },
        {
          label: 'Excluir Definitivamente',
          className: 'btn-danger',
          onClick: (close) => {
            const input = document.getElementById('destruct-input-confirm');
            if (input && input.value.trim() === 'CONFIRMAR') {
              close();
              if (onConfirm) onConfirm();
            } else {
              window.UI.toast('Digite exatamente "CONFIRMAR" para autorizar a exclusão.', 'error');
            }
          }
        }
      ]
    });
  },

  setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span style="display:inline-block; animation:spin 1s linear infinite; margin-right:6px;">↻</span> Carregando...`;
    } else {
      btn.disabled = false;
      if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
    }
  },

  pageLoading(show) {
    let loader = document.getElementById('global-page-loader');
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-page-loader';
        loader.style.cssText = 'position:fixed; top:0; left:0; right:0; height:3px; background:var(--color-primary); z-index:9999; animation:pulseDanger 1s infinite;';
        document.body.appendChild(loader);
      }
    } else {
      if (loader) loader.remove();
    }
  },

  badge(status) {
    const map = {
      'Pago': 'success',
      'Confirmada': 'success',
      'Resolvida': 'success',
      'Aprovada': 'success',
      'Ativo': 'success',
      'Em dia': 'success',
      'Concluída': 'info',
      'Pendente': 'warning',
      'Em análise': 'warning',
      'Aguardando Retirada': 'warning',
      'Aguardando aprovação': 'warning',
      'Em providência': 'warning',
      'Em aprovação': 'warning',
      'Proximo': 'warning',
      'Vencendo em 30 dias': 'warning',
      'Vencido': 'danger',
      'Urgente': 'danger',
      'Inadimplente': 'danger',
      'Cancelada': 'muted',
      'Arquivada': 'muted',
      'Saiu': 'muted',
      'Vaga': 'muted',
      'Dentro': 'info',
      'Retirado': 'success',
      'Aberta': 'info',
      'Em Execução': 'info',
      'Em Reforma': 'warning',
      'Ocupada': 'success',
      'Válido': 'success'
    };
    const color = map[status] || 'muted';
    const isUrgent = status === 'Urgente' ? 'badge-urgent-pulse' : '';
    return `<span class="badge badge-${color} ${isUrgent}">${window.Security.sanitize(status)}</span>`;
  },

  pagination({ total, page = 1, perPage = 10, onPageChange }) {
    const totalPages = Math.ceil(total / perPage) || 1;
    let html = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:16px; font-size:13px; color:var(--color-text-muted);">
        <span>Mostrando página <b>${page}</b> de <b>${totalPages}</b> (Total: ${total} registros)</span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-outline" ${page <= 1 ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${page - 1})">Anterior</button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button class="btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}" onclick="(${onPageChange.toString()})(${p})">${p}</button>
          `).join('')}
          <button class="btn btn-sm btn-outline" ${page >= totalPages ? 'disabled' : ''} onclick="(${onPageChange.toString()})(${page + 1})">Próxima</button>
        </div>
      </div>
    `;
    return html;
  },

  icon(name, size = 16, className = '') {
    // Renderiza data-lucide com fallback para quando lucide.createIcons rodar
    return `<i data-lucide="${name}" style="width:${size}px; height:${size}px; display:inline-block; vertical-align:middle;" class="${className}"></i>`;
  }
};

window.Router = {
  currentModule: null,
  currentSub: null,

  navigate(module, sub = null) {
    const user = window.Auth.checkSession();
    if (!user) {
      this.showLogin();
      return;
    }

    // Redirecionamento amigável para Morador
    if (user.role === 'MORADOR') {
      if (module === 'financial') {
        module = 'portal';
        sub = 'financeiro';
      } else if (!['portal', 'reservations', 'occurrences', 'communications', 'assemblies'].includes(module)) {
        window.UI.toast('Acesso restrito à administração do condomínio.', 'warning');
        module = 'portal';
        sub = 'apartamento';
      }
    } else if (user.role === 'PORTEIRO') {
      if (!['access', 'occurrences', 'reservations', 'communications'].includes(module)) {
        window.UI.toast('Acesso restrito da portaria.', 'warning');
        module = 'access';
        sub = 'portaria';
      }
    }

    // Validação estrita de permissão RBAC
    const permModule = module === 'portal' ? 'portal' : module;
    if (!window.Auth.hasPermission(user.role, permModule)) {
      window.UI.toast('Acesso não autorizado para o seu perfil.', 'error');
      return;
    }

    this.currentModule = module;
    this.currentSub = sub;

    // Atualizar breadcrumbs
    this.updateBreadcrumb(module, sub);

    // Atualizar sidebar ativa
    this.updateSidebarActive(module, sub);

    // Fechar sidebar mobile se aberta
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Renderizar conteúdo do módulo
    const content = document.getElementById('content-area');
    if (content) {
      content.innerHTML = '';
      if (window.Modules && window.Modules[module]) {
        window.Modules[module].render(content, sub);
      } else {
        content.innerHTML = `
          <div class="card" style="text-align:center; padding:40px;">
            <h3>Módulo em carregamento...</h3>
          </div>
        `;
      }
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateBreadcrumb(module, sub) {
    const el = document.getElementById('header-breadcrumb');
    if (!el) return;
    const names = {
      dashboard: 'Dashboard Geral',
      financial: 'Gestão Financeira',
      maintenance: 'Manutenção & Obras',
      assemblies: 'Assembleias & Votações',
      communications: 'Mural de Comunicados',
      access: 'Portaria & Controle de Acesso',
      reservations: 'Reservas de Áreas Comuns',
      occurrences: 'Ocorrências & Ouvidoria',
      registry: 'Cadastro do Condomínio',
      reports: 'Prestação de Contas & Relatórios',
      settings: 'Configurações do Sistema',
      portal: 'Portal do Condômino'
    };
    const modName = names[module] || module;
    el.innerHTML = `
      <span>CondoHub</span>
      <span>/</span>
      <span class="breadcrumb-current">${modName} ${sub ? ' - ' + sub : ''}</span>
    `;
  },

  updateSidebarActive(module, sub) {
    document.querySelectorAll('.nav-item').forEach(el => {
      const targetMod = el.getAttribute('data-module');
      const targetSub = el.getAttribute('data-sub');
      if (targetSub) {
        if (targetMod === module && targetSub === sub) el.classList.add('active');
        else el.classList.remove('active');
      } else {
        if (targetMod === module && (!sub || !document.querySelector(`.nav-item[data-module="${module}"][data-sub="${sub}"]`))) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  },

  showLogin() {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');
    if (loginScreen && appScreen) {
      loginScreen.style.display = 'flex';
      appScreen.style.display = 'none';
    }
  },

  showApp() {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');
    if (loginScreen && appScreen) {
      loginScreen.style.display = 'none';
      appScreen.style.display = 'flex';
    }
    this.renderSidebar();
    this.renderHeaderUser();
    if (window.Notifications) {
      window.Notifications.init();
    }
  },

  renderSidebar() {
    const user = window.Auth.checkSession();
    if (!user) return;

    // Atualizar dados do usuário no rodapé da Sidebar
    const sideAvatar = document.getElementById('sidebar-user-avatar');
    const sideName = document.getElementById('sidebar-user-name');
    const sideRole = document.getElementById('sidebar-user-role');
    if (sideAvatar) sideAvatar.textContent = user.avatar || user.name.substring(0, 2).toUpperCase();
    if (sideName) sideName.textContent = user.name;
    if (sideRole) {
      const rolesMap = {
        'SINDICO': '👑 SÍNDICO GERAL',
        'SUPER_ADMIN': '⚡ SUPER ADMIN',
        'MORADOR': `🏠 MORADOR (${user.unitId || 'A101'})`,
        'PORTEIRO': '🛡️ PORTARIA / RONDA',
        'CONSELHEIRO': '📋 CONSELHO FISCAL'
      };
      sideRole.textContent = rolesMap[user.role] || user.role;
    }

    const nav = document.getElementById('sidebar-nav-container');
    if (!nav) return;

    if (user.role === 'MORADOR') {
      // Sidebar focada nas necessidades do morador
      nav.innerHTML = `
        <div class="nav-section-title">Portal do Condômino</div>
        <a class="nav-item" data-module="portal" data-sub="apartamento" onclick="Router.navigate('portal', 'apartamento')">
          ${window.UI.icon('home', 18)} <span>Meu Apartamento</span>
        </a>
        <a class="nav-item" data-module="portal" data-sub="financeiro" onclick="Router.navigate('portal', 'financeiro')">
          ${window.UI.icon('dollar-sign', 18)} <span>Minhas Taxas & Boletos</span>
        </a>
        <a class="nav-item" data-module="communications" onclick="Router.navigate('communications')">
          ${window.UI.icon('bell', 18)} <span>Mural de Comunicados</span>
        </a>
        <a class="nav-item" data-module="reservations" onclick="Router.navigate('reservations')">
          ${window.UI.icon('calendar', 18)} <span>Reservas de Espaços</span>
        </a>
        <a class="nav-item" data-module="occurrences" onclick="Router.navigate('occurrences')">
          ${window.UI.icon('message-square', 18)} <span>Livro de Ocorrências</span>
        </a>
        <a class="nav-item" data-module="assemblies" onclick="Router.navigate('assemblies')">
          ${window.UI.icon('vote', 18)} <span>Votações & Assembleias</span>
        </a>
        <a class="nav-item" data-module="portal" data-sub="documentos" onclick="Router.navigate('portal', 'documentos')">
          ${window.UI.icon('file-text', 18)} <span>Documentos & Atas</span>
        </a>
        <a class="nav-item" data-module="portal" data-sub="perfil" onclick="Router.navigate('portal', 'perfil')">
          ${window.UI.icon('user', 18)} <span>Meu Perfil</span>
        </a>
      `;
    } else if (user.role === 'PORTEIRO') {
      nav.innerHTML = `
        <div class="nav-section-title">Operação de Portaria</div>
        <a class="nav-item" data-module="access" data-sub="portaria" onclick="Router.navigate('access', 'portaria')">
          ${window.UI.icon('shield', 18)} <span>Controle de Portaria</span>
        </a>
        <a class="nav-item" data-module="access" data-sub="visitors" onclick="Router.navigate('access', 'visitors')">
          ${window.UI.icon('users', 18)} <span>Visitantes & Prestadores</span>
        </a>
        <a class="nav-item" data-module="access" data-sub="packages" onclick="Router.navigate('access', 'packages')">
          ${window.UI.icon('package', 18)} <span>Guarda de Encomendas</span>
        </a>
        <a class="nav-item" data-module="occurrences" onclick="Router.navigate('occurrences')">
          ${window.UI.icon('alert-triangle', 18)} <span>Ocorrências de Turno</span>
        </a>
        <a class="nav-item" data-module="reservations" onclick="Router.navigate('reservations')">
          ${window.UI.icon('calendar', 18)} <span>Reservas do Dia</span>
        </a>
        <a class="nav-item" data-module="communications" onclick="Router.navigate('communications')">
          ${window.UI.icon('bell', 18)} <span>Mural de Comunicados</span>
        </a>
      `;
    } else if (user.role === 'CONSELHEIRO') {
      nav.innerHTML = `
        <div class="nav-section-title">Conselho Fiscal</div>
        <a class="nav-item" data-module="financial" onclick="Router.navigate('financial')">
          ${window.UI.icon('dollar-sign', 18)} <span>Gestão Financeira</span>
        </a>
        <a class="nav-item" data-module="reports" onclick="Router.navigate('reports')">
          ${window.UI.icon('file-text', 18)} <span>Prestação de Contas</span>
        </a>
        <a class="nav-item" data-module="assemblies" onclick="Router.navigate('assemblies')">
          ${window.UI.icon('users', 18)} <span>Assembleias & Atas</span>
        </a>
        <a class="nav-item" data-module="occurrences" onclick="Router.navigate('occurrences')">
          ${window.UI.icon('alert-triangle', 18)} <span>Livro de Ocorrências</span>
        </a>
        <a class="nav-item" data-module="settings" onclick="Router.navigate('settings')">
          ${window.UI.icon('settings', 18)} <span>Configurações & Auditoria</span>
        </a>
      `;
    } else {
      // Síndico e Administradores com privilégios completos
      let items = [];

      if (window.Auth.hasPermission(user.role, 'dashboard')) {
        items.push(`<a class="nav-item" data-module="dashboard" onclick="Router.navigate('dashboard')">${window.UI.icon('layout-dashboard', 18)} <span>Dashboard</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'financial')) {
        items.push(`<a class="nav-item" data-module="financial" onclick="Router.navigate('financial')">${window.UI.icon('dollar-sign', 18)} <span>Gestão Financeira</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'maintenance')) {
        items.push(`<a class="nav-item" data-module="maintenance" onclick="Router.navigate('maintenance')">${window.UI.icon('wrench', 18)} <span>Manutenção Predial</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'assemblies')) {
        items.push(`<a class="nav-item" data-module="assemblies" onclick="Router.navigate('assemblies')">${window.UI.icon('users', 18)} <span>Assembleias & Atas</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'communications')) {
        items.push(`<a class="nav-item" data-module="communications" onclick="Router.navigate('communications')">${window.UI.icon('bell', 18)} <span>Mural de Comunicados</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'access')) {
        items.push(`<a class="nav-item" data-module="access" onclick="Router.navigate('access')">${window.UI.icon('shield', 18)} <span>Portaria & Acesso</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'reservations')) {
        items.push(`<a class="nav-item" data-module="reservations" onclick="Router.navigate('reservations')">${window.UI.icon('calendar', 18)} <span>Gestão de Reservas</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'occurrences')) {
        items.push(`<a class="nav-item" data-module="occurrences" onclick="Router.navigate('occurrences')">${window.UI.icon('alert-triangle', 18)} <span>Ocorrências & Livro</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'registry')) {
        items.push(`<a class="nav-item" data-module="registry" onclick="Router.navigate('registry')">${window.UI.icon('building-2', 18)} <span>Cadastro Geral</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'reports')) {
        items.push(`<a class="nav-item" data-module="reports" onclick="Router.navigate('reports')">${window.UI.icon('file-text', 18)} <span>Prestação de Contas</span></a>`);
      }
      if (window.Auth.hasPermission(user.role, 'settings')) {
        items.push(`<a class="nav-item" data-module="settings" onclick="Router.navigate('settings')">${window.UI.icon('settings', 18)} <span>Configurações & Auditoria</span></a>`);
      }

      nav.innerHTML = `
        <div class="nav-section-title">Administração Geral</div>
        ${items.join('')}
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderHeaderUser() {
    const user = window.Auth.checkSession();
    if (!user) return;
    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    if (avatarEl) avatarEl.textContent = user.avatar || user.name.substring(0, 2).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      const rolesMap = {
        'SINDICO': 'Síndico Geral',
        'SUPER_ADMIN': 'Super Admin',
        'MORADOR': `Morador (${user.unitId || 'A101'})`,
        'PORTEIRO': 'Portaria / Ronda',
        'CONSELHEIRO': 'Conselho Fiscal'
      };
      roleEl.textContent = rolesMap[user.role] || user.role;
    }
  },

  init() {
    window.Storage.seed();
    const user = window.Auth.checkSession();
    if (user) {
      this.showApp();
      const defaultMod = user.role === 'MORADOR' ? 'portal' : (user.role === 'PORTEIRO' ? 'access' : 'dashboard');
      this.navigate(defaultMod);
    } else {
      this.showLogin();
    }
    if (window.Notifications) {
      window.Notifications.init();
    }
  }
};

// ==========================================
// SISTEMA DE NOTIFICAÇÕES IN-APP (EM TEMPO REAL)
// ==========================================
window.Notifications = {
  get() {
    return window.Storage.get('notifications') || [];
  },

  set(list) {
    window.Storage.set('notifications', list);
    this.updateBadge();
  },

  sync() {
    let list = this.get();
    let hasChanges = false;
    const existingIds = new Set(list.map(n => n.id));

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const nowStr = now.toISOString().substring(0, 10);
    const threeDaysStr = threeDaysFromNow.toISOString().substring(0, 10);

    // 1. Cobranças / Receivables vencendo em 3 dias ou vencidas
    const receivables = window.Storage.get('receivables') || [];
    receivables.forEach(r => {
      if (r.status === 'Pendente' || r.status === 'Vencido') {
        const isExpiring = r.dueDate <= threeDaysStr;
        if (isExpiring) {
          const id = 'notif_rec_' + r.id;
          if (!existingIds.has(id)) {
            const isOverdue = r.dueDate < nowStr || r.status === 'Vencido';
            list.unshift({
              id,
              type: 'financeiro',
              title: isOverdue ? 'Boleto Vencido' : 'Boleto Vencendo em 3 Dias',
              message: `Unidade ${r.unit} (${window.Security.sanitize(r.resident)}): ${r.description} - ${window.Security.maskMoney(r.amount)} com vencimento em ${r.dueDate}.`,
              date: r.dueDate,
              read: false,
              module: 'financial',
              sub: 'receber'
            });
            existingIds.add(id);
            hasChanges = true;
          }
        }
      }
    });

    // 2. Ocorrências abertas / em análise
    const occurrences = window.Storage.get('occurrences') || [];
    occurrences.forEach(o => {
      if (o.status !== 'Resolvida' && o.status !== 'Arquivada') {
        const id = 'notif_occ_' + o.id;
        if (!existingIds.has(id)) {
          list.unshift({
            id,
            type: 'ocorrência',
            title: `Nova Ocorrência: ${window.Security.sanitize(o.title || o.category || 'Aberto')}`,
            message: `Unidade ${o.complainingUnit || o.unit || 'Geral'}: ${(o.description || '').substring(0, 80)}...`,
            date: o.date || nowStr,
            read: false,
            module: 'occurrences',
            sub: null
          });
          existingIds.add(id);
          hasChanges = true;
        }
      }
    });

    // 3. Reservas aprovadas / confirmadas / recusadas
    const reservations = window.Storage.get('reservations') || [];
    reservations.forEach(res => {
      const id = 'notif_res_' + res.id + '_' + res.status;
      if (!existingIds.has(id)) {
        list.unshift({
          id,
          type: 'reserva',
          title: `Reserva ${res.status}: ${res.areaName || 'Área Comum'}`,
          message: `Data: ${res.date} • Horário: ${res.timeSlot} • Solicitante: ${res.resident} (${res.unit})`,
          date: res.date || nowStr,
          read: false,
          module: 'reservations',
          sub: null
        });
        existingIds.add(id);
        hasChanges = true;
      }
    });

    // 4. Manutenções / OS muda de status
    const orders = window.Storage.get('maintenance_orders') || [];
    orders.forEach(ord => {
      const id = 'notif_ord_' + ord.id + '_' + (ord.status || ord.column);
      if (!existingIds.has(id)) {
        list.unshift({
          id,
          type: 'manutenção',
          title: `OS ${ord.status || 'Atualizada'}: ${window.Security.sanitize(ord.title)}`,
          message: `Local: ${ord.area || 'Predial'} • Fornecedor: ${ord.supplier || 'Equipe Interna'} • Prioridade: ${ord.priority || 'Normal'}`,
          date: ord.date || nowStr,
          read: false,
          module: 'maintenance',
          sub: 'orders'
        });
        existingIds.add(id);
        hasChanges = true;
      }
    });

    if (hasChanges || !window.Storage.get('notifications')) {
      if (list.length > 50) list.length = 50;
      window.Storage.set('notifications', list);
    }

    this.updateBadge();
    return list;
  },

  add(notif) {
    const list = this.get();
    const newNotif = {
      id: notif.id || ('notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      type: notif.type || 'geral',
      title: notif.title || 'Notificação',
      message: notif.message || '',
      date: notif.date || new Date().toISOString().substring(0, 10),
      read: false,
      module: notif.module || 'dashboard',
      sub: notif.sub || null
    };
    list.unshift(newNotif);
    if (list.length > 50) list.length = 50;
    this.set(list);
  },

  getUnreadCount() {
    const list = this.get();
    return list.filter(n => !n.read).length;
  },

  markAllAsRead() {
    const list = this.get().map(n => ({ ...n, read: true }));
    this.set(list);
    window.UI.toast('Todas as notificações foram marcadas como lidas.', 'info');
    const modalEl = document.getElementById('notifications-modal-list');
    if (modalEl) {
      this.renderListInModal(modalEl);
    }
  },

  markAsRead(id) {
    const list = this.get().map(n => n.id === id ? { ...n, read: true } : n);
    this.set(list);
    const modalEl = document.getElementById('notifications-modal-list');
    if (modalEl) {
      this.renderListInModal(modalEl);
    }
  },

  updateBadge() {
    const unread = this.getUnreadCount();
    const badge = document.getElementById('notification-badge-dot') || document.getElementById('header-notifications-badge');
    if (badge) {
      if (unread > 0) {
        badge.style.display = 'flex';
        badge.textContent = unread > 99 ? '99+' : unread;
        badge.style.cssText = 'position:absolute; top:2px; right:2px; min-width:18px; height:18px; padding:0 4px; border-radius:10px; background:var(--color-danger); color:#FFFFFF; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; border:2px solid var(--color-surface); pointer-events:none; z-index:2;';
      } else {
        badge.style.display = 'none';
        badge.textContent = '';
      }
    }
  },

  getTypeInfo(type) {
    const map = {
      financeiro: { icon: 'dollar-sign', color: '#DC2626', bg: '#FEE2E2', label: 'Financeiro' },
      ocorrência: { icon: 'alert-triangle', color: '#D97706', bg: '#FEF3C7', label: 'Ocorrência' },
      reserva: { icon: 'calendar', color: '#2563EB', bg: '#DBEAFE', label: 'Reserva' },
      manutenção: { icon: 'wrench', color: '#7C3AED', bg: '#EDE9FE', label: 'Manutenção' }
    };
    return map[type] || { icon: 'bell', color: '#4B5563', bg: '#F3F4F6', label: 'Geral' };
  },

  renderListInModal(container) {
    const list = this.get();
    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 16px; color:var(--color-text-muted);">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--color-bg); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color:var(--color-text-muted);">
            ${window.UI.icon('bell', 24)}
          </div>
          <p style="font-weight:600; font-size:14px; margin-bottom:4px;">Nenhuma notificação no momento</p>
          <p style="font-size:12px;">Você está em dia com todas as novidades do condomínio.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const info = this.getTypeInfo(item.type);
      const isUnread = !item.read;
      return `
        <div class="notification-item" style="display:flex; gap:12px; padding:12px; border-bottom:1px solid var(--color-border); border-radius:6px; cursor:pointer; background:${isUnread ? 'rgba(37,99,235,0.05)' : 'transparent'}; transition:background 150ms;" onclick="window.Notifications.handleItemClick('${item.id}', '${item.module}', '${item.sub || ''}')">
          <div style="width:36px; height:36px; border-radius:8px; background:${info.bg}; color:${info.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${window.UI.icon(info.icon, 18)}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="badge" style="font-size:10px; background:${info.bg}; color:${info.color}; font-weight:700;">${info.label}</span>
                <b style="font-size:13px; color:var(--color-text);">${window.Security.sanitize(item.title)}</b>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; color:var(--color-text-muted); white-space:nowrap;">${item.date}</span>
                ${isUnread ? '<span style="width:8px; height:8px; border-radius:50%; background:var(--color-primary); display:inline-block;" title="Não lida"></span>' : ''}
              </div>
            </div>
            <p style="font-size:12px; color:var(--color-text-muted); margin:4px 0 0; line-height:1.4;">${window.Security.sanitize(item.message)}</p>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  handleItemClick(id, module, sub) {
    this.markAsRead(id);
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    if (window.Router) {
      window.Router.navigate(module, sub || null);
    }
  },

  openModal() {
    this.sync();
    const unread = this.getUnreadCount();
    const content = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--color-border);">
        <span style="font-size:13px; color:var(--color-text-muted);">
          <b>${unread}</b> ${unread === 1 ? 'não lida' : 'não lidas'}
        </span>
        <button class="btn btn-sm btn-outline" onclick="window.Notifications.markAllAsRead()">
          Marcar todas como lidas
        </button>
      </div>
      <div id="notifications-modal-list" style="max-height:380px; overflow-y:auto; display:flex; flex-direction:column; gap:4px;">
      </div>
    `;

    window.UI.modal({
      title: 'Notificações do Condomínio',
      size: 'md',
      content: content,
      buttons: [
        { label: 'Fechar', className: 'btn-outline' }
      ]
    });

    setTimeout(() => {
      const listEl = document.getElementById('notifications-modal-list');
      if (listEl) this.renderListInModal(listEl);
    }, 50);
  },

  init() {
    this.sync();
    this.updateBadge();
    window.addEventListener('condohub_storage', (e) => {
      if (e.detail && ['receivables', 'occurrences', 'reservations', 'maintenance_orders'].includes(e.detail.key)) {
        this.sync();
      }
    });
  }
};

// ==========================================
// PESQUISA GLOBAL FUNCIONAL MULTI-MÓDULOS
// ==========================================
window.openGlobalSearchModal = function() {
  const content = `
    <div style="margin-bottom:14px;">
      <input type="text" id="global-search-input" class="form-control" placeholder="Buscar morador, unidade, boleto, ocorrência, OS, comunicado, visitante..." oninput="window.executeGlobalSearch(this.value)" autofocus style="font-size:14px; padding:10px 14px;" />
    </div>
    <div id="global-search-results" style="max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
      <p style="font-size:12px; color:var(--color-text-muted); text-align:center; padding:24px 0;">
        Digite ao menos 3 caracteres para pesquisar em tempo real em todo o sistema.
      </p>
    </div>
  `;

  window.UI.modal({
    title: 'Pesquisa Global no Condomínio',
    size: 'lg',
    content: content,
    buttons: [
      { label: 'Fechar', className: 'btn-outline' }
    ]
  });

  setTimeout(() => {
    const inp = document.getElementById('global-search-input');
    if (inp) inp.focus();
  }, 100);
};

window.executeGlobalSearch = function(query) {
  const resEl = document.getElementById('global-search-results');
  if (!resEl) return;
  query = (query || '').toLowerCase().trim();

  if (query.length < 3) {
    resEl.innerHTML = '<p style="font-size:12px; color:var(--color-text-muted); text-align:center; padding:24px 0;">Digite ao menos 3 caracteres para pesquisar em tempo real em todo o sistema.</p>';
    return;
  }

  const groups = {
    residents: { title: 'Moradores & Unidades', icon: 'users', color: '#2563EB', items: [] },
    receivables: { title: 'Contas a Receber & Boletos', icon: 'dollar-sign', color: '#0E9F6E', items: [] },
    occurrences: { title: 'Livro de Ocorrências', icon: 'alert-triangle', color: '#D97706', items: [] },
    work_orders: { title: 'Ordens de Serviço & Manutenção', icon: 'wrench', color: '#7C3AED', items: [] },
    announcements: { title: 'Mural de Comunicados', icon: 'bell', color: '#0284C7', items: [] },
    visitors: { title: 'Portaria & Visitantes', icon: 'shield', color: '#DC2626', items: [] }
  };

  // 1. residents (nome, unidade)
  const residents = window.Storage.get('residents') || [];
  residents.forEach(r => {
    const nameMatch = (r.name || '').toLowerCase().includes(query);
    const unitMatch = (r.unit || '').toLowerCase().includes(query);
    if (nameMatch || unitMatch) {
      groups.residents.items.push({
        title: `${r.name} (${r.unit})`,
        subtitle: `Bloco ${r.block || '-'} • Telefone: ${window.Security.maskPhone(r.phone || '')} • ${r.role || 'Morador'}`,
        badge: r.status || 'Ativo',
        badgeType: r.status === 'Inadimplente' ? 'danger' : 'success',
        module: 'registry',
        sub: 'residents'
      });
    }
  });

  // 2. receivables (morador, unidade)
  const receivables = window.Storage.get('receivables') || [];
  receivables.forEach(rec => {
    const resMatch = (rec.resident || '').toLowerCase().includes(query);
    const unitMatch = (rec.unit || '').toLowerCase().includes(query);
    const descMatch = (rec.description || '').toLowerCase().includes(query);
    if (resMatch || unitMatch || descMatch) {
      groups.receivables.items.push({
        title: `${rec.unit} — ${rec.resident}`,
        subtitle: `${rec.description || 'Taxa'} • Vencimento: ${rec.dueDate} • Valor: ${window.Security.maskMoney(rec.amount)}`,
        badge: rec.status || 'Pendente',
        badgeType: rec.status === 'Pago' ? 'success' : (rec.status === 'Vencido' ? 'danger' : 'warning'),
        module: 'financial',
        sub: 'receber'
      });
    }
  });

  // 3. occurrences (descrição)
  const occurrences = window.Storage.get('occurrences') || [];
  occurrences.forEach(occ => {
    const descMatch = (occ.description || '').toLowerCase().includes(query);
    const titleMatch = (occ.title || '').toLowerCase().includes(query);
    if (descMatch || titleMatch) {
      groups.occurrences.items.push({
        title: occ.title || `Ocorrência Unidade ${occ.complainingUnit || occ.unit || 'Comum'}`,
        subtitle: `${(occ.description || '').substring(0, 90)}... • Data: ${occ.date || '-'}`,
        badge: occ.status || 'Aberta',
        badgeType: occ.status === 'Resolvida' ? 'success' : (occ.priority === 'Urgente' ? 'danger' : 'warning'),
        module: 'occurrences',
        sub: null
      });
    }
  });

  // 4. work_orders / maintenance_orders (título)
  const orders = window.Storage.get('maintenance_orders') || [];
  orders.forEach(ord => {
    const titleMatch = (ord.title || '').toLowerCase().includes(query);
    const suppMatch = (ord.supplier || '').toLowerCase().includes(query);
    if (titleMatch || suppMatch) {
      groups.work_orders.items.push({
        title: ord.title,
        subtitle: `Local: ${ord.area || 'Predial'} • Fornecedor: ${ord.supplier || 'Interno'} • Previsão: ${ord.date || '-'}`,
        badge: ord.status || 'Pendente',
        badgeType: ord.status === 'Concluída' ? 'success' : 'info',
        module: 'maintenance',
        sub: 'orders'
      });
    }
  });

  // 5. announcements (título)
  const announcements = window.Storage.get('announcements') || [];
  announcements.forEach(ann => {
    const titleMatch = (ann.title || '').toLowerCase().includes(query);
    const contentMatch = (ann.content || '').toLowerCase().includes(query);
    if (titleMatch || contentMatch) {
      groups.announcements.items.push({
        title: ann.title,
        subtitle: `${ann.category || 'Geral'} • Data: ${ann.date || '-'} • ${(ann.content || '').substring(0, 80)}...`,
        badge: ann.priority || 'Normal',
        badgeType: ann.priority === 'Alta' ? 'danger' : 'info',
        module: 'communications',
        sub: null
      });
    }
  });

  // 6. visitors (nome)
  const visitors = window.Storage.get('visitors') || [];
  visitors.forEach(vis => {
    const nameMatch = (vis.name || '').toLowerCase().includes(query);
    const unitMatch = (vis.unit || '').toLowerCase().includes(query);
    if (nameMatch || unitMatch) {
      groups.visitors.items.push({
        title: `${vis.name} → Unidade ${vis.unit}`,
        subtitle: `Tipo: ${vis.type || 'Visitante'} • Entrada: ${vis.entryDate || vis.date || '-'} ${vis.entryTime || vis.time || ''} • Doc: ${vis.doc || '-'}`,
        badge: vis.status || 'Dentro',
        badgeType: vis.status === 'Dentro' ? 'info' : 'muted',
        module: 'access',
        sub: 'visitors'
      });
    }
  });

  const activeGroups = Object.values(groups).filter(g => g.items.length > 0);

  if (activeGroups.length === 0) {
    resEl.innerHTML = `<p style="font-size:12px; color:var(--color-text-muted); text-align:center; padding:24px 0;">Nenhum resultado encontrado para "<b>${window.Security.sanitize(query)}</b>".</p>`;
    return;
  }

  resEl.innerHTML = activeGroups.map(g => `
    <div style="background:var(--color-bg); border-radius:8px; padding:12px; border:1px solid var(--color-border);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--color-border);">
        <span style="color:${g.color}; display:flex;">${window.UI.icon(g.icon, 16)}</span>
        <b style="font-size:12px; text-transform:uppercase; color:var(--color-text-muted); letter-spacing:0.5px;">${g.title} (${g.items.length})</b>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${g.items.map(item => `
          <div class="search-result-item" style="padding:8px 10px; border-radius:6px; background:var(--color-surface); cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:12px; transition:all 150ms;" onclick="window.handleGlobalSearchResultClick('${item.module}', '${item.sub || ''}')">
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:center; gap:6px;">
                <b style="font-size:13px; color:var(--color-text);">${window.Security.sanitize(item.title)}</b>
                ${item.badge ? `<span class="badge badge-${item.badgeType}" style="font-size:10px;">${item.badge}</span>` : ''}
              </div>
              <p style="font-size:11px; color:var(--color-text-muted); margin:2px 0 0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${window.Security.sanitize(item.subtitle)}</p>
            </div>
            <span style="font-size:11px; color:var(--color-primary); font-weight:600; white-space:nowrap; display:flex; align-items:center; gap:4px;">
              Acessar ${window.UI.icon('arrow-right', 12)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
};

window.handleGlobalSearchResultClick = function(module, sub) {
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
  if (window.Router) {
    window.Router.navigate(module, sub || null);
  }
};

window.openNotificationsModal = function() {
  if (window.Notifications) {
    window.Notifications.openModal();
  }
};

// === FIM DO core.js ===
