// All persistence lives here. Swap these functions for API calls (Spring Boot/JWT) later.
import type { Persisted } from '../types';
const KEY = 'dsa-os-v2';
export const loadProgress = (): Partial<Persisted> | null => {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};
export const saveProgress = (p: Persisted) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota */ } };
export const resetData = () => localStorage.removeItem(KEY);
export const exportData = (p: Persisted) => {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...p }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dsa-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
};
export const parseImport = (text: string): Partial<Persisted> => {
  const o = JSON.parse(text);
  if (!o || typeof o !== 'object' || !o.progress || !o.settings) throw new Error('Not a valid DSA OS export file');
  return o;
};
