// Offline-first sync: localStorage stays the source for the UI; the newest copy (by updatedAt) wins.
import { supabase } from './cloud';

import { useStore } from '../store/useStore';
import { useCloud } from '../store/useCloud';
import { snapshot } from '../utils/planner';
let lastPushed: string | undefined; let timer: number | undefined;
const fail = (e: unknown) => useCloud.setState({ status: 'error', error: (e as Error).message ?? String(e) });

async function push() {
  const s = useStore.getState(); if (!supabase || !s.updatedAt) return;
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
  useCloud.setState({ status: 'syncing', error: undefined });
  const { error } = await supabase.from('progress').upsert({ user_id: user.id, data: snapshot(s), updated_at: s.updatedAt });
  if (error) return fail(error); lastPushed = s.updatedAt; useCloud.setState({ status: 'synced' });
}
export async function syncNow() {
  if (!supabase) return;
  try {
    useCloud.setState({ status: 'syncing', error: undefined });
    const { data, error } = await supabase.from('progress').select('data, updated_at').maybeSingle(); if (error) throw error;
    const local = useStore.getState().updatedAt, rAt = data ? Date.parse(data.updated_at) : 0, lAt = local ? Date.parse(local) : 0;
    if (data && rAt > lAt) { useStore.getState().applyRemote(data.data, new Date(rAt).toISOString()); lastPushed = useStore.getState().updatedAt; useCloud.setState({ status: 'synced' }); }
    else if (lAt > rAt) await push(); else useCloud.setState({ status: 'synced' });
  } catch (e) { fail(e); }
}
export function initSync() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    useCloud.setState({ user: session?.user.email ?? null });
    if (session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) void syncNow();
  });
  useStore.subscribe((s) => {
    if (!useCloud.getState().user || !s.updatedAt || s.updatedAt === lastPushed) return;
    clearTimeout(timer); timer = window.setTimeout(() => void push(), 1500);
  });
}

