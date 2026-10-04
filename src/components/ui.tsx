import { useEffect, useState, type ReactNode } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { QView, SolveType } from '../types';
import { useStore } from '../store/useStore';
import { SOURCES } from '../data/questions';

export const Bar = ({ pct, className = '' }: { pct: number; className?: string }) => (
  <div className={`h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} role="progressbar" aria-valuenow={Math.round(pct)}>
    <div className="h-2 rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>);
export const Stat = ({ label, value }: { label: string; value: ReactNode }) => (<div className="card"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>);
export const Empty = ({ children }: { children: ReactNode }) => <div className="card py-10 text-center text-sm text-slate-500">{children}</div>;
export const PageTitle = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (<div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h1 className="text-xl font-semibold">{children}</h1>{right}</div>);

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}><h2 className="mb-3 text-lg font-semibold">{title}</h2>{children}</div></div>);
}
export const ConfirmDialog = ({ title, text, onConfirm, onClose }: { title: string; text: string; onConfirm: () => void; onClose: () => void }) => (
  <Modal title={title} onClose={onClose}><p className="mb-4 text-sm text-slate-500">{text}</p><div className="flex justify-end gap-2"><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { onConfirm(); onClose(); }}>Confirm</button></div></Modal>);

export function TargetPicker({ onPick, current }: { onPick: (n: number) => void; current?: number }) {
  const [custom, setCustom] = useState(current ?? 7);
  return (<div><div className="flex flex-wrap gap-2">{[1, 3, 5, 10].map((n) => <button key={n} className={`btn ${current === n ? 'btn-primary' : ''}`} onClick={() => onPick(n)}>{n}</button>)}</div>
    <div className="mt-3 flex items-center gap-2"><span className="text-sm text-slate-500">Custom</span><input type="number" min={0} max={50} className="input w-20" value={custom} onChange={(e) => setCustom(+e.target.value)} /><button className="btn" onClick={() => onPick(custom)}>Set</button></div></div>);
}
const diffCls = { Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' };
export const DiffBadge = ({ d }: { d: QView['difficulty'] }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffCls[d]}`}>{d}</span>;
const stCls: Record<string, string> = { completed: 'text-emerald-600', 'in-progress': 'text-indigo-500', skipped: 'text-slate-400', 'not-started': 'text-slate-400' };
export const StatusBadge = ({ s }: { s: QView['status'] }) => <span className={`text-xs font-medium ${stCls[s]}`}>● {s.replace('-', ' ')}</span>;

export function PlatformLinks({ q }: { q: QView }) {
  const l: [string, string | undefined][] = [['LeetCode', q.platforms.leetcode], ['GFG', q.platforms.gfg], ['Coding Ninjas', q.platforms.codingNinjas]];
  const setStatus = useStore((s) => s.setStatus);
  return (<>{l.filter(([, u]) => u).map(([n, u]) => (
    <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="btn" onClick={() => q.status === 'not-started' && setStatus(q.id, 'in-progress')}>{n} <ExternalLink size={13} /></a>))}</>);
}
const solveOpts: [SolveType, string][] = [['independent', 'Solved independently'], ['hint', 'Solved with hint'], ['solution', 'Solved after seeing solution']];
export function CompleteModal({ q, onClose }: { q: QView; onClose: () => void }) {
  const setStatus = useStore((s) => s.setStatus);
  const go = (t?: SolveType) => { setStatus(q.id, 'completed', t); onClose(); };
  return (<Modal title="How did you solve this?" onClose={onClose}><div className="flex flex-col gap-2">
    {solveOpts.map(([t, l]) => <button key={t} className="btn justify-center" onClick={() => go(t)}>{l}</button>)}
    <button className="btn btn-primary justify-center" onClick={() => go()}>Just mark complete</button></div></Modal>);
}
export function QuestionCard({ q }: { q: QView }) {
  const { setStatus, toggleFav } = useStore(); const [open, setOpen] = useState(false);
  return (<div className="card"><div className="flex items-start justify-between gap-3"><div>
    <Link to={`/question/${q.id}`} className="font-semibold hover:underline">{q.title}</Link><p className="text-xs text-slate-500">{q.topic} → {q.subtopic}</p></div>
    <button aria-label="Toggle favorite" onClick={() => toggleFav(q.id)}><Star size={18} className={q.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} /></button></div>
    <div className="mt-2 flex items-center gap-3"><DiffBadge d={q.difficulty} /><StatusBadge s={q.status} /></div>
    <div className="mt-3 flex flex-wrap gap-2"><PlatformLinks q={q} /></div>
    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
      {q.status === 'completed' ? <button className="btn" onClick={() => setStatus(q.id, 'not-started')}>Undo</button> : <button className="btn btn-primary" onClick={() => setOpen(true)}>✓ Complete</button>}
      <button className="btn" onClick={() => setStatus(q.id, 'in-progress')}>In Progress</button>
      <button className="btn" onClick={() => setStatus(q.id, q.status === 'skipped' ? 'not-started' : 'skipped')}>{q.status === 'skipped' ? 'Unskip' : 'Skip'}</button></div>
    {open && <CompleteModal q={q} onClose={() => setOpen(false)} />}</div>);
}
export function QuestionList({ questions, showFilters = true }: { questions: QView[]; showFilters?: boolean }) {
  const [f, setF] = useState({ search: '', diff: '', status: '', platform: '', fav: false, source: '', sort: 'order' });
  let list = questions.filter((q) => (!f.search || (q.title + q.topic + q.subtopic).toLowerCase().includes(f.search.toLowerCase())) && (!f.diff || q.difficulty === f.diff) && (!f.status || q.status === f.status)
    && (!f.platform || q.platforms[f.platform as 'leetcode']) && (!f.fav || q.isFavorite) && (!f.source || q.sources.includes(f.source)));
  const dr = { Easy: 0, Medium: 1, Hard: 2 };
  list = [...list].sort((a, b) => f.sort === 'difficulty' ? dr[a.difficulty] - dr[b.difficulty] || a.order - b.order : f.sort === 'status' ? a.status.localeCompare(b.status) : f.sort === 'recent' ? (b.completedAt ?? '').localeCompare(a.completedAt ?? '') : a.order - b.order);
  const sel = (k: keyof typeof f, opts: [string, string][]) => <select aria-label={k} className="input" value={f[k] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  return (<div>{showFilters && <div className="mb-4 flex flex-wrap gap-2">
    <input className="input min-w-[10rem] flex-1" placeholder="Search questions…" aria-label="Search" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
    {sel('diff', [['', 'Difficulty'], ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']])}
    {sel('status', [['', 'Status'], ['not-started', 'Not started'], ['in-progress', 'In progress'], ['completed', 'Completed'], ['skipped', 'Skipped']])}
    {sel('platform', [['', 'Platform'], ['leetcode', 'LeetCode'], ['gfg', 'GFG'], ['codingNinjas', 'Coding Ninjas']])}
    {sel('sort', [['order', 'Roadmap order'], ['difficulty', 'Difficulty'], ['status', 'Status'], ['recent', 'Recently completed']])}
    <label className="btn" title="Important questions are prioritised in revision"><input type="checkbox" checked={f.fav} onChange={(e) => setF({ ...f, fav: e.target.checked })} /> ★ Important</label>
    {SOURCES.length > 1 && sel('source', [['', 'All sheets'], ...SOURCES.map((x): [string, string] => [x, x])])}</div>}
    {list.length ? <div className="grid gap-3 lg:grid-cols-2">{list.map((q) => <QuestionCard key={q.id} q={q} />)}</div> : <Empty>No questions match.</Empty>}</div>);
}
