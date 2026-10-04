import { create } from 'zustand';
export const useCloud = create<{ user: string | null; status: 'idle' | 'syncing' | 'synced' | 'error'; error?: string }>(() => ({ user: null, status: 'idle' }));
