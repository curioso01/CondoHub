export interface PasswordValidationResult {
  valid: boolean;
  strength: 'fraca' | 'média' | 'forte' | 'muito forte';
  errors: string[];
}

export const security = {
  sanitize(str: unknown): string {
    if (str === null || str === undefined) return '';
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return String(str).replace(/[&<>"'/]/g, s => map[s] || s);
  },

  validateCPF(cpf: string): boolean {
    if (!cpf) return false;
    const clean = String(cpf).replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    let rest: number;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(9, 10), 10)) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(10, 11), 10)) return false;

    return true;
  },

  validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    const clean = String(cnpj).replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(clean)) return false;

    const size = clean.length - 2;
    const numbers = clean.substring(0, size);
    const digits = clean.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0), 10)) return false;

    const size2 = size + 1;
    const numbers2 = clean.substring(0, size2);
    sum = 0;
    pos = size2 - 7;
    for (let i = size2; i >= 1; i--) {
      sum += parseInt(numbers2.charAt(size2 - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1), 10)) return false;

    return true;
  },

  validatePassword(pwd: string): PasswordValidationResult {
    const errors: string[] = [];
    if (!pwd || pwd.length < 8) errors.push('Mínimo de 8 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos 1 letra maiúscula');
    if (!/[a-z]/.test(pwd)) errors.push('Pelo menos 1 letra minúscula');
    if (!/[0-9]/.test(pwd)) errors.push('Pelo menos 1 número');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) errors.push('Pelo menos 1 caractere especial');

    let strength: 'fraca' | 'média' | 'forte' | 'muito forte' = 'fraca';
    if (errors.length === 0) {
      strength = pwd.length >= 12 ? 'muito forte' : 'forte';
    } else if (errors.length <= 2 && pwd.length >= 6) {
      strength = 'média';
    }

    return {
      valid: errors.length === 0,
      strength,
      errors
    };
  },

  maskCPF(v: string): string {
    if (!v) return '';
    return String(v)
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  },

  maskCNPJ(v: string): string {
    if (!v) return '';
    return String(v)
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  },

  maskPhone(v: string): string {
    if (!v) return '';
    const clean = String(v).replace(/\D/g, '');
    if (clean.length > 10) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    }
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  },

  maskMoney(v: unknown): string {
    if (v === null || v === undefined || v === '') return 'R$ 0,00';
    const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, '')) / 100;
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  maskPlate(v: string): string {
    if (!v) return '';
    const clean = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 3 && !clean.includes('-') && /^[A-Z]{3}[0-9]/.test(clean)) {
      return clean.substring(0, 3) + '-' + clean.substring(3, 7);
    }
    return clean.substring(0, 8);
  }
};
