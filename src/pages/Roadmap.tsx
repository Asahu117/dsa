import { Link, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { TOPICS } from '../data/questions';
import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { Bar, Empty, PageTitle, QuestionList } from '../components/ui';
import { topicState, topicStats } from '../utils/planner';

export function Roadmap() {
  const qs = useQuestions(); const settings = useStore((s) => s.settings);
  return (<div><PageTitle>Roadmap</PageTitle><div className="mb-6"><QuestionList questions={qs} /></div>
    <h2 className="mb-3 font-semibold">Topics</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TOPICS.map((t, i) => { const s = topicStats(t.name, qs), state = topicState(i, qs, settings);
        return (<Link key={t.slug} to={`/roadmap/${t.slug}`} className="card transition hover:border-indigo-400"><div className="flex items-center justify-between"><p className="font-semibold">{i + 1}. {t.name}</p>
          <span className="flex items-center gap-1 text-xs text-slate-500">{state === 'locked' && <Lock size={12} />}{state === 'locked' ? 'Locked' : state === 'completed' ? 'Completed' : state === 'in-progress' ? 'In progress' : 'Not started'}</span></div>
          <p className="my-1 text-sm text-slate-500">{s.done} / {s.total} · {s.pct.toFixed(1)}%</p><Bar pct={s.pct} /></Link>); })}</div></div>);
}
export function TopicPage() {
  const { topic } = useParams(); const qs = useQuestions(); const t = TOPICS.find((x) => x.slug === topic);
  if (!t) return <Empty>Topic not found. <Link to="/roadmap" className="underline">Back to roadmap</Link></Empty>;
  const list = qs.filter((q) => q.topic === t.name), s = topicStats(t.name, qs);
  return (<div><Link to="/roadmap" className="text-sm text-indigo-600">← Roadmap</Link><PageTitle>{t.name}</PageTitle><p className="mb-1 text-sm text-slate-500">{s.done} / {s.total} · {s.pct.toFixed(1)}%</p><Bar pct={s.pct} className="mb-4" /><QuestionList questions={list} /></div>);
}
