import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pause } from 'lucide-react';
import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { Bar, DiffBadge, Modal, PageTitle, PlatformLinks, QuestionCard, Stat, TargetPicker } from '../components/ui';
import { currentTopic, recommend, streaks, topicState, topicStats } from '../utils/planner';
import { TOPICS } from '../data/questions';
import { today } from '../utils/date';

export default function Dashboard() {
  const qs = useQuestions(); const nav = useNavigate();
  const { plan, queues, settings, activity, pausedDates, pause, resume, setDefaultTarget } = useStore();
  const [modal, setModal] = useState<'target' | 'resume' | null>(null);
  const c = (s: string) => qs.filter((q) => q.status === s).length, done = c('completed');
  const st = streaks(activity, pausedDates, settings), topic = currentTopic(qs), ts = topic ? topicStats(topic.name, qs) : null;
  const ids = queues[today()] ?? [], tq = ids.map((id) => qs.find((q) => q.id === id)!).filter(Boolean), tdone = tq.filter((q) => q.status === 'completed').length;
  const rec = recommend(qs); const topicsDone = TOPICS.filter((t, i) => topicState(i, qs, settings) === 'completed').length;
  return (<div className="space-y-4"><PageTitle right={<div className="flex gap-2">
    <button className="btn btn-primary" onClick={() => nav('/today')}>Start Today's Plan</button><button className="btn" onClick={() => setModal('target')}>Change Daily Target</button><button className="btn" onClick={() => nav('/revision')}>Review Questions</button>
    {!plan.paused && <button className="btn" onClick={pause}><Pause size={14} /> Pause Plan</button>}</div>}>Dashboard</PageTitle>
    {plan.paused && <div className="card flex flex-wrap items-center justify-between gap-2 border-amber-400"><div><p className="font-semibold">Plan Paused</p><p className="text-sm text-slate-500">Resume when you're ready. Your progress is safe.</p></div><button className="btn btn-primary" onClick={() => setModal('resume')}>Resume Plan</button></div>}
    <div className="card"><p className="text-sm text-slate-500">DSA Progress</p><p className="my-1 text-2xl font-semibold">{done} / {qs.length} <span className="text-base font-normal text-slate-500">({(qs.length ? (done / qs.length) * 100 : 0).toFixed(1)}%)</span></p><Bar pct={(done / qs.length) * 100} /></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><p className="text-sm text-slate-500">Currently learning</p>{topic && ts ? <><Link to={`/roadmap/${topic.slug}`} className="text-lg font-semibold hover:underline">{topic.name}</Link><p className="mb-2 text-sm text-slate-500">{ts.done} / {ts.total}</p><Bar pct={ts.pct} /></> : <p className="font-semibold">Roadmap complete 🎉</p>}</div>
      <div className="card"><p className="text-sm text-slate-500">Today's goal</p><p className="mb-2 text-lg font-semibold">{tdone} / {tq.length} completed</p><Bar pct={tq.length ? (tdone / tq.length) * 100 : 0} /><Link to="/today" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">Open today's tasks →</Link></div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Total" value={qs.length} /><Stat label="Completed" value={done} /><Stat label="In progress" value={c('in-progress')} /><Stat label="Remaining" value={qs.length - done - c('skipped')} />
      <Stat label="Skipped" value={c('skipped')} /><Stat label="Current streak" value={settings.streakEnabled ? st.current : '–'} /><Stat label="Longest streak" value={settings.streakEnabled ? st.longest : '–'} /><Stat label="Topics completed" value={topicsDone} /></div>
    {rec.q && <div className="card"><p className="text-sm text-slate-500">Continue learning · {rec.reason}</p><p className="mt-1 text-lg font-semibold">{rec.q.title}</p>
      <div className="my-2 flex items-center gap-2"><DiffBadge d={rec.q.difficulty} /><span className="text-xs text-slate-500">{rec.q.topic} → {rec.q.subtopic}</span></div><div className="flex flex-wrap gap-2"><PlatformLinks q={rec.q} /></div></div>}
    {tq.length > 0 && <div className="grid gap-3 lg:grid-cols-2">{tq.slice(0, 4).map((q) => <QuestionCard key={q.id} q={q} />)}</div>}
    {modal === 'target' && <Modal title="Default questions per day" onClose={() => setModal(null)}><TargetPicker current={plan.defaultTarget} onPick={(n) => { setDefaultTarget(n); setModal(null); }} /></Modal>}
    {modal === 'resume' && <Modal title="How many questions do you want to solve per day?" onClose={() => setModal(null)}><TargetPicker current={plan.defaultTarget} onPick={(n) => { resume(n); setModal(null); }} /></Modal>}</div>);
}
