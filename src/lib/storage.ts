// CONDOHUB — WRAPPER TIPADO DE LOCALSTORAGE

const PREFIX = 'condohub_';

const storage = {
  /**
   * Recupera um item do localStorage e faz parse de JSON.
   * Retorna null se a chave não existir ou em caso de erro.
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (e) {
      console.error(`[CondoHub Storage] get error for key "${key}":`, e);
      return null;
    }
  },

  /**
   * Serializa e salva um valor no localStorage.
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`[CondoHub Storage] set error for key "${key}":`, e);
    }
  },

  /**
   * Remove uma chave do localStorage.
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error(`[CondoHub Storage] remove error for key "${key}":`, e);
    }
  },

  /**
   * Remove todas as chaves com o prefixo 'condohub_'.
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('[CondoHub Storage] clear error:', e);
    }
  },

  /**
   * Retorna true se a chave existir no localStorage.
   */
  has(key: string): boolean {
    return localStorage.getItem(PREFIX + key) !== null;
  },
};

export default storage;
