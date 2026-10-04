import { create } from 'zustand';
import type { Persisted, Progress, SolveType, Status, Settings } from '../types';
import { loadProgress, saveProgress, resetData, parseImport } from '../services/storage';
import { addDays, today } from '../utils/date';
import { pickNext, snapshot } from '../utils/planner';
import { QUESTIONS, sectionKey } from '../data/questions';

export const blank = (): Progress => ({ status: 'not-started', revisionCount: 0, isFavorite: false });
export const DEFAULTS: Persisted = {
  progress: {}, plan: { paused: false, defaultTarget: 5 }, dailyTargets: {}, targetLog: {}, queues: {}, activity: {}, pausedDates: {}, sections: {}, onboarded: false,
  settings: { theme: 'system', streakEnabled: true, streakRequiresCompletion: true, autoUnlock: true, unlockPercent: 60, intervals: [3, 7, 15, 30], revisionSize: 5, defaultDifficulty: 'Any' },
};
const merge = (l: Partial<Persisted> | null): Persisted => ({ ...DEFAULTS, ...(l ?? {}), settings: { ...DEFAULTS.settings, ...(l?.settings ?? {}) }, plan: { ...DEFAULTS.plan, ...(l?.plan ?? {}) } });

interface Actions {
  refreshQueue(): void; onboard(target: number): void; setStatus(id: string, s: Status, solve?: SolveType): void;
  toggleFav(id: string): void; setNotes(id: string, n: string): void; setSolveType(id: string, t: SolveType): void;
  setTodayTarget(n: number): void; setDefaultTarget(n: number): void; pause(): void; resume(target: number): void;
  completeRound(key: string, k: number): void; updateSettings(p: Partial<Settings>): void; importJson(text: string): void; reset(): void; applyRemote(d: Partial<Persisted>, at: string): void;
}
export const useStore = create<Persisted & Actions>((set, get) => {
  const commit = (p: Partial<Persisted>) => { set({ ...p, updatedAt: new Date().toISOString() }); saveProgress(snapshot(get())); };
  return {
    ...merge(loadProgress()),
    refreshQueue() {
      const s = get(); if (s.plan.paused || !s.onboarded) return;
      const t = today(), target = s.dailyTargets[t] ?? s.plan.defaultTarget;
      const q = [...(s.queues[t] ?? [])]; const stat = (id: string) => s.progress[id]?.status ?? 'not-started';
      let need = target - q.filter((id) => stat(id) !== 'skipped').length;
      for (let i = q.length - 1; i >= 0 && need < 0; i--) if (stat(q[i]) === 'not-started') { q.splice(i, 1); need++; }
      if (need > 0) q.push(...pickNext(s.progress, q, need, s.settings.defaultDifficulty));
      if (JSON.stringify(q) !== JSON.stringify(s.queues[t] ?? []) || s.targetLog[t] !== target) commit({ queues: { ...s.queues, [t]: q }, targetLog: { ...s.targetLog, [t]: target } });
    },
    onboard(target) { commit({ onboarded: true, plan: { paused: false, defaultTarget: target } }); get().refreshQueue(); },
    setStatus(id, status, solve) {
      const s = get(), t = today(), prev = s.progress[id] ?? blank(), next: Progress = { ...prev, status };
      const act = { ...(s.activity[t] ?? { completed: [], attempted: [], skipped: [] }) }; const acts = { ...s.activity };
      const add = (arr: string[]) => (arr.includes(id) ? arr : [...arr, id]);
      if (prev.status === 'completed' && status !== 'completed') {
        if (prev.completedOn && acts[prev.completedOn]) acts[prev.completedOn] = { ...acts[prev.completedOn], completed: acts[prev.completedOn].completed.filter((x) => x !== id) };
        act.completed = act.completed.filter((x) => x !== id); delete next.completedAt; delete next.completedOn; next.revisionCount = 0;
      }
      if (status === 'completed' && prev.status !== 'completed') {
        next.completedAt = new Date().toISOString(); next.completedOn = t; next.solveType = solve ?? prev.solveType; next.revisionCount = 0;
        act.completed = add(act.completed);
      }
      if (status === 'in-progress') { act.attempted = add(act.attempted); next.attempted = true; }
      if (status === 'skipped') act.skipped = add(act.skipped);
      acts[t] = act; commit({ progress: { ...s.progress, [id]: next }, activity: acts });
      const q = QUESTIONS.find((x) => x.id === id);
      if (q && status === 'completed') { // section finished -> start its 3/7/15/30 revision cycle
        const key = sectionKey(q.topic, q.subtopic), cur = get(), live = QUESTIONS.filter((x) => x.topic === q.topic && x.subtopic === q.subtopic && cur.progress[x.id]?.status !== 'skipped');
        if (!cur.sections[key] && live.every((x) => cur.progress[x.id]?.status === 'completed')) commit({ sections: { ...cur.sections, [key]: { startedOn: t, done: [] } } });
      }
      get().refreshQueue();
    },
    toggleFav(id) { const s = get(), p = s.progress[id] ?? blank(); commit({ progress: { ...s.progress, [id]: { ...p, isFavorite: !p.isFavorite } } }); },
    setNotes(id, notes) { const s = get(), p = s.progress[id] ?? blank(); commit({ progress: { ...s.progress, [id]: { ...p, notes } } }); },
    setSolveType(id, solveType) { const s = get(), p = s.progress[id] ?? blank(); commit({ progress: { ...s.progress, [id]: { ...p, solveType } } }); },
    setTodayTarget(n) { const s = get(); commit({ dailyTargets: { ...s.dailyTargets, [today()]: Math.max(0, Math.min(50, n)) } }); get().refreshQueue(); },
    setDefaultTarget(n) { const s = get(); commit({ plan: { ...s.plan, defaultTarget: Math.max(0, Math.min(50, n)) } }); get().refreshQueue(); },
    pause() { const s = get(); commit({ plan: { ...s.plan, paused: true, pausedAt: today() } }); },
    resume(target) {
      const s = get(), t = today(), pd = { ...s.pausedDates };
      if (s.plan.pausedAt) for (let d = s.plan.pausedAt; d < t; d = addDays(d, 1)) pd[d] = true;
      const dt = { ...s.dailyTargets }; delete dt[t];
      commit({ plan: { paused: false, defaultTarget: target }, pausedDates: pd, dailyTargets: dt }); get().refreshQueue();
    },
    completeRound(key, k) { const s = get(), sec = s.sections[key]; if (sec && !sec.done.includes(k)) commit({ sections: { ...s.sections, [key]: { ...sec, done: [...sec.done, k] } } }); },
    updateSettings(p) { const s = get(); commit({ settings: { ...s.settings, ...p } }); },
    importJson(text) { commit(merge(parseImport(text))); get().refreshQueue(); },
    reset() { resetData(); set(merge(null)); commit({}); },
    applyRemote(d, at) { set({ ...merge(d), updatedAt: at }); saveProgress(snapshot(get())); get().refreshQueue(); },
  };
});
