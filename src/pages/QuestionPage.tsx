import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { CompleteModal, DiffBadge, Empty, PlatformLinks, QuestionCard, StatusBadge } from '../components/ui';
import type { SolveType } from '../types';

export default function QuestionPage() {
  const { id } = useParams(); const q = useQuestions().find((x) => x.id === id); const { setNotes, setSolveType, setStatus } = useStore(); const [open, setOpen] = useState(false);
  if (!q) return <Empty>Question not found. <Link to="/roadmap" className="underline">Back to roadmap</Link></Empty>;
  return (<div className="space-y-4"><Link to={`/roadmap`} className="text-sm text-indigo-600">← Roadmap</Link>
    <div className="card"><h1 className="text-xl font-semibold">{q.title}</h1><p className="text-sm text-slate-500">{q.topic} → {q.subtopic}</p><div className="my-2 flex flex-wrap items-center gap-3"><DiffBadge d={q.difficulty} /><StatusBadge s={q.status} /><span className="text-xs text-slate-500">{q.sources.join(' · ')}</span></div>
      <div className="flex flex-wrap gap-2"><PlatformLinks q={q} /></div>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => setOpen(true)}>✓ Complete</button><button className="btn" onClick={() => setStatus(q.id, 'in-progress')}>In Progress</button><button className="btn" onClick={() => setStatus(q.id, 'skipped')}>Skip</button><button className="btn" onClick={() => setStatus(q.id, 'not-started')}>Reset</button></div></div>
    <div className="card"><label className="mb-1 block text-sm font-medium" htmlFor="sv">How did you solve it?</label>
      <select id="sv" className="input" value={q.solveType ?? ''} onChange={(e) => e.target.value && setSolveType(q.id, e.target.value as SolveType)}><option value="">Not recorded</option><option value="independent">Solved independently</option><option value="hint">Solved with hint</option><option value="solution">Solved after seeing solution</option></select></div>
    <div className="card"><label className="mb-1 block text-sm font-medium" htmlFor="nt">Notes</label><textarea id="nt" rows={5} className="input w-full" placeholder="Approach, edge cases…" value={q.notes ?? ''} onChange={(e) => setNotes(q.id, e.target.value)} /></div>
    <div className="hidden"><QuestionCard q={q} /></div>{open && <CompleteModal q={q} onClose={() => setOpen(false)} />}</div>);
}
