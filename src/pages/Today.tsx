import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { Bar, Empty, Modal, PageTitle, QuestionCard, TargetPicker } from '../components/ui';
import { today } from '../utils/date';

export default function Today() {
  const qs = useQuestions(); const { plan, queues, dailyTargets, setTodayTarget, refreshQueue, resume, pause } = useStore(); const [m, setM] = useState(false);
  useEffect(() => { refreshQueue(); }, [refreshQueue]);
  const t = today(), target = dailyTargets[t] ?? plan.defaultTarget;
  if (plan.paused) return (<div><PageTitle>Today's Tasks</PageTitle><div className="card text-center"><p className="text-lg font-semibold">Plan Paused</p><p className="mb-3 text-sm text-slate-500">Resume when you're ready.</p><button className="btn btn-primary" onClick={() => setM(true)}>Resume Plan</button></div>
    {m && <Modal title="How many questions do you want to solve per day?" onClose={() => setM(false)}><TargetPicker current={plan.defaultTarget} onPick={(n) => { resume(n); setM(false); }} /></Modal>}</div>);
  const list = (queues[t] ?? []).map((id) => qs.find((q) => q.id === id)!).filter(Boolean), done = list.filter((q) => q.status === 'completed').length;
  return (<div><PageTitle right={<button className="btn" onClick={pause}>Pause Plan</button>}>Today's Tasks</PageTitle>
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Today's target (default: {plan.defaultTarget}/day)</p>
      <div className="mt-1 flex items-center gap-2"><button className="btn" aria-label="Decrease" onClick={() => setTodayTarget(target - 1)}><Minus size={14} /></button><span className="w-10 text-center text-xl font-semibold">{target}</span><button className="btn" aria-label="Increase" onClick={() => setTodayTarget(target + 1)}><Plus size={14} /></button></div></div>
      <div className="min-w-[10rem] flex-1"><p className="mb-1 text-sm">{done} / {list.length} completed</p><Bar pct={list.length ? (done / list.length) * 100 : 0} /></div></div>
    {target === 0 ? <Empty>Rest day: 0 questions. That's fine, progress isn't lost.</Empty> : list.length ? <div className="grid gap-3 lg:grid-cols-2">{list.map((q, i) => <div key={q.id}><p className="mb-1 text-xs text-slate-500">#{i + 1}</p><QuestionCard q={q} /></div>)}</div> : <Empty>Nothing left to assign. Roadmap complete!</Empty>}</div>);
}
