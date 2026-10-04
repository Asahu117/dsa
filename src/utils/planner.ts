import { QUESTIONS, TOPICS } from '../data/questions';
import type { Activity, Persisted, Progress, QView, Settings, Status } from '../types';
import { addDays, today } from './date';

const st = (p: Record<string, Progress>, id: string): Status => p[id]?.status ?? 'not-started';
const open = (s: Status) => s === 'not-started' || s === 'in-progress';

/** Priority: unfinished (in-progress first) -> current topic -> roadmap order -> preferred difficulty. */
export function pickNext(progress: Record<string, Progress>, exclude: string[], n: number, pref: Settings['defaultDifficulty']): string[] {
  const ex = new Set(exclude);
  const cand = QUESTIONS.filter((q) => !ex.has(q.id) && open(st(progress, q.id)));
  if (!cand.length) return [];
  const cur = cand.filter((q) => q.topic === cand[0].topic);
  const rank = (q: typeof cur[0]) => (st(progress, q.id) === 'in-progress' ? 0 : pref !== 'Any' && q.difficulty === pref ? 1 : 2);
  const ordered = [...cur].sort((a, b) => rank(a) - rank(b) || a.order - b.order);
  const out = ordered.slice(0, n).map((q) => q.id);
  for (const q of cand) { if (out.length >= n) break; if (!out.includes(q.id)) out.push(q.id); }
  return out;
}

export const topicStats = (topic: string, views: QView[]) => {
  const qs = views.filter((q) => q.topic === topic);
  const done = qs.filter((q) => q.status === 'completed').length;
  return { total: qs.length, done, pct: qs.length ? (done / qs.length) * 100 : 0 };
};
export type TopicState = 'locked' | 'not-started' | 'in-progress' | 'completed';
export function topicState(i: number, views: QView[], s: Settings): TopicState {
  const cur = topicStats(TOPICS[i].name, views);
  if (cur.done === cur.total && cur.total > 0) return 'completed';
  if (views.some((q) => q.topic === TOPICS[i].name && q.status !== 'not-started')) return 'in-progress';
  if (s.autoUnlock && i > 0 && topicStats(TOPICS[i - 1].name, views).pct < s.unlockPercent) return 'locked';
  return 'not-started';
}
export const currentTopic = (views: QView[]) => TOPICS.find((t) => views.some((q) => q.topic === t.name && (q.status === 'not-started' || q.status === 'in-progress')));

export function streaks(a: Record<string, Activity>, paused: Record<string, boolean>, s: Settings) {
  const ok = (d: string) => { const x = a[d]; return !!x && (s.streakRequiresCompletion ? x.completed.length > 0 : x.completed.length + x.attempted.length + x.skipped.length > 0); };
  const t = today(); let d = ok(t) ? t : addDays(t, -1); let current = 0;
  for (let i = 0; i < 4000; i++) { if (ok(d)) current++; else if (!paused[d]) break; d = addDays(d, -1); }
  const days = Object.keys(a).filter(ok).sort(); let longest = 0;
  if (days.length) { let run = 0; for (let x = days[0]; x <= t; x = addDays(x, 1)) { if (ok(x)) { run++; longest = Math.max(longest, run); } else if (!paused[x]) run = 0; } }
  return { current, longest };
}

export interface Round { key: string; topic: string; subtopic: string; k: number; days: number; due: string; done: boolean; state: 'overdue' | 'today' | 'upcoming' | 'done'; questions: QView[] }
/** Section revision: each finished section is revisited at +3/7/15/30 days with a few important solved questions. */
export function revisionRounds(views: QView[], sections: Persisted['sections'], s: Settings): Round[] {
  const out: Round[] = [], t = today();
  const rank = (q: QView) => (q.isFavorite ? 0 : q.solveType === 'solution' ? 1 : q.solveType === 'hint' ? 2 : 3) * 10 + (q.difficulty === 'Hard' ? 0 : q.difficulty === 'Medium' ? 1 : 2);
  for (const [key, sec] of Object.entries(sections)) {
    const [topic, subtopic] = key.split('||');
    const pool = views.filter((q) => q.topic === topic && q.subtopic === subtopic && q.status === 'completed').sort((a, b) => rank(a) - rank(b) || a.order - b.order);
    s.intervals.forEach((days, k) => {
      const due = addDays(sec.startedOn, days), done = sec.done.includes(k), n = Math.min(s.revisionSize, pool.length);
      const questions = [...new Set(Array.from({ length: n }, (_, i) => pool[(k * n + i) % pool.length]))];
      out.push({ key, topic, subtopic, k, days, due, done, state: done ? 'done' : due < t ? 'overdue' : due === t ? 'today' : 'upcoming', questions });
    });
  }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}

/** Adaptive recommendation from recent performance. */
export function recommend(views: QView[]): { q?: QView; reason: string } {
  const unfinished = views.filter((q) => open(q.status));
  const recent = views.filter((q) => q.status === 'completed' && q.completedAt).sort((a, b) => b.completedAt!.localeCompare(a.completedAt!));
  const last5 = recent.slice(0, 5);
  if (last5.length >= 5 && last5.every((q) => q.difficulty === 'Easy' && q.solveType !== 'solution')) {
    const q = unfinished.find((x) => x.difficulty === 'Medium'); if (q) return { q, reason: 'You solved 5 Easy questions in a row. Try a Medium problem.' };
  }
  const lastMed = recent.filter((q) => q.difficulty === 'Medium').slice(0, 3);
  if (lastMed.length === 3 && lastMed.every((q) => q.solveType === 'solution')) {
    const q = unfinished.find((x) => x.topic === lastMed[0].topic && x.subtopic === lastMed[0].subtopic && x.difficulty !== 'Hard') ?? unfinished.find((x) => x.difficulty === 'Easy');
    if (q) return { q, reason: 'Recent Medium problems needed the solution. Reinforce this pattern with another problem.' };
  }
  return { q: unfinished[0], reason: 'Next in your roadmap.' };
}
export const snapshot = (s: Persisted): Persisted => ({ progress: s.progress, settings: s.settings, plan: s.plan, dailyTargets: s.dailyTargets, targetLog: s.targetLog, queues: s.queues, activity: s.activity, pausedDates: s.pausedDates, sections: s.sections, onboarded: s.onboarded, updatedAt: s.updatedAt });
