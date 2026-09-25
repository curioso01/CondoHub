// CONDOHUB — SEGURANÇA: SANITIZAÇÃO, VALIDAÇÃO E MÁSCARAS
// Portado fielmente de src/condo/core.js → window.Security

import type { PasswordValidation } from '../types';

/**
 * Sanitiza string contra XSS escaping HTML entities.
 * PRODUÇÃO: usar DOMPurify para HTML rico ou sanitização no backend.
 */
export function sanitize(str: unknown): string {
  if (str === null || str === undefined) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return String(str).replace(/[&<>"'/]/g, s => map[s] ?? s);
}

/**
 * Valida CPF pelo algoritmo oficial Módulo 11.
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  const clean = String(cpf).replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(clean.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

/**
 * Valida CNPJ pelo algoritmo oficial.
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const clean = String(cnpj).replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size += 1;
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
}

/**
 * Valida senha com critérios de segurança.
 * Retorna { valid, strength, errors[] }.
 */
export function validatePassword(pwd: string): PasswordValidation {
  const errors: string[] = [];
  if (!pwd || pwd.length < 8) errors.push('Mínimo de 8 caracteres');
  if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos 1 letra maiúscula');
  if (!/[a-z]/.test(pwd)) errors.push('Pelo menos 1 letra minúscula');
  if (!/[0-9]/.test(pwd)) errors.push('Pelo menos 1 número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
    errors.push('Pelo menos 1 caractere especial');

  let strength: PasswordValidation['strength'] = 'fraca';
  if (errors.length === 0) strength = 'forte';
  else if (errors.length <= 2 && pwd.length >= 6) strength = 'média';

  return { valid: errors.length === 0, strength, errors };
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(v: string): string {
  if (!v) return '';
  return String(v)
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
}

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export function maskCNPJ(v: string): string {
  if (!v) return '';
  return String(v)
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
}

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(v: string): string {
  if (!v) return '';
  const clean = String(v).replace(/\D/g, '');
  if (clean.length > 10) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  }
  return clean.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
}

/**
 * Formata número como moeda brasileira: R$ 1.234,56
 */
export function maskMoney(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return 'R$ 0,00';
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, '')) / 100;
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Aplica máscara de placa de veículo: ABC-1234 ou ABC1D23 (Mercosul)
 */
export function maskPlate(v: string): string {
  if (!v) return '';
  const clean = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length > 3 && /^[A-Z]{3}[0-9]/.test(clean)) {
    return (clean.substring(0, 3) + '-' + clean.substring(3, 7)).substring(0, 8);
  }
  return clean.substring(0, 8);
}

/**
 * Retorna timestamp relativo amigável ("há 2h", "há 3 dias", etc.)
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr.replace(' ', 'T'));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `há ${diffMin}min`;
  if (diffHrs < 24) return `há ${diffHrs}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 30) return `há ${diffDays} dias`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
  const diffYears = Math.floor(diffMonths / 12);
  return `há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
}

/**
 * Gera um ID único com prefixo.
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Formata data ISO (YYYY-MM-DD) para pt-BR (DD/MM/YYYY).
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export const security = {
  sanitize,
  validateCPF,
  validateCNPJ,
  validatePassword,
  maskCPF,
  maskCNPJ,
  maskPhone,
  maskMoney,
  maskPlate,
  timeAgo,
  generateId,
  formatDate,
};

