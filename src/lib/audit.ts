import { storage } from './storage';
import { AuditLog } from '../types';

export const audit = {
  log(
    userId: string,
    userName: string,
    action: string,
    module: string,
    details: Record<string, unknown> | string = {}
  ): void {
    const logs = storage.get<AuditLog[]>('audit_logs') || [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      createdAt: timestamp,
      userId: userId || 'anon',
      userName: userName || 'Sistema/Anônimo',
      action,
      module,
      details,
      ip: `189.120.45.${Math.floor(Math.random() * 200 + 10)}`
    };

    logs.unshift(newLog);
    if (logs.length > 500) {
      logs.length = 500;
    }
    storage.set('audit_logs', logs);
  },

  getLogs(): AuditLog[] {
    return storage.get<AuditLog[]>('audit_logs') || [];
  }
};
