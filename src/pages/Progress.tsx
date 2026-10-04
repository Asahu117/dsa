import { useState } from 'react';
import { TOPICS } from '../data/questions';
import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { Bar, PageTitle, Stat } from '../components/ui';
import { streaks, topicStats } from '../utils/planner';
import { addDays, fmt, today } from '../utils/date';

export function Progress() {
  const qs = useQuestions(); const { settings, activity, pausedDates } = useStore(); const st = streaks(activity, pausedDates, settings);
  const t = today(), wk = [...Array(7)].map((_, i) => addDays(t, -i)), mo = t.slice(0, 7), sum = (f: (d: string) => boolean) => Object.entries(activity).filter(([d]) => f(d)).reduce((n, [, a]) => n + a.completed.length, 0);
  const done = qs.filter((q) => q.status === 'completed').length;
  return (<div className="space-y-4"><PageTitle>Progress</PageTitle>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Overall" value={`${((done / qs.length) * 100).toFixed(1)}%`} /><Stat label="Last 7 days" value={sum((d) => wk.includes(d))} /><Stat label="This month" value={sum((d) => d.startsWith(mo))} /><Stat label="Current streak" value={st.current} /></div>
    <div className="card"><h2 className="mb-3 font-semibold">By difficulty</h2>{(['Easy', 'Medium', 'Hard'] as const).map((d) => { const a = qs.filter((q) => q.difficulty === d), c = a.filter((q) => q.status === 'completed').length; return <div key={d} className="mb-3"><p className="mb-1 text-sm">{d}: {c} / {a.length}</p><Bar pct={a.length ? (c / a.length) * 100 : 0} /></div>; })}</div>
    <div className="card"><h2 className="mb-3 font-semibold">By topic</h2>{TOPICS.map((tp) => { const s = topicStats(tp.name, qs); return <div key={tp.slug} className="mb-3"><p className="mb-1 text-sm">{tp.name}: {s.done} / {s.total}</p><Bar pct={s.pct} /></div>; })}</div></div>);
}
export function Calendar() {
  const { activity, targetLog } = useStore(); const qs = useQuestions(); const [m, setM] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); const [sel, setSel] = useState(today());
  const first = (m.getDay() + 6) % 7, days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), a = activity[sel], tg = targetLog[sel];
  const names = (ids: string[] = []) => ids.map((id) => qs.find((q) => q.id === id)?.title).join(', ');
  return (<div><PageTitle right={<div className="flex items-center gap-2"><button className="btn" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))}>←</button><span className="w-36 text-center font-medium">{m.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button className="btn" onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))}>→</button></div>}>Calendar</PageTitle>
    <div className="card"><div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d}>{d}</div>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">{[...Array(first)].map((_, i) => <div key={'e' + i} />)}{[...Array(days)].map((_, i) => { const d = fmt(new Date(m.getFullYear(), m.getMonth(), i + 1)), x = activity[d];
        return <button key={d} onClick={() => setSel(d)} className={`aspect-square rounded-lg border text-sm ${sel === d ? 'border-indigo-500' : 'border-transparent'} ${x?.completed.length ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{i + 1}{x?.completed.length ? ' ✓' : ''}</button>; })}</div></div>
    <div className="card mt-4"><h2 className="mb-2 font-semibold">{sel}</h2><div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5"><p>Completed: <b>{a?.completed.length ?? 0}</b></p><p>Attempted: <b>{a?.attempted.length ?? 0}</b></p><p>Skipped: <b>{a?.skipped.length ?? 0}</b></p><p>Target: <b>{tg ?? '–'}</b></p><p>Completion: <b>{tg ? Math.round(((a?.completed.length ?? 0) / tg) * 100) : 0}%</b></p></div>
      {a?.completed.length ? <p className="mt-2 text-xs text-slate-500">Solved: {names(a.completed)}</p> : null}</div></div>);
}
