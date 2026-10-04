import { useQuestions } from '../hooks';
import { useStore } from '../store/useStore';
import { DiffBadge, Empty, PageTitle, PlatformLinks, QuestionList } from '../components/ui';
import { revisionRounds, type Round } from '../utils/planner';
import { Link } from 'react-router-dom';

export function Revision() {
  const qs = useQuestions(); const { settings, sections, completeRound } = useStore(); const rounds = revisionRounds(qs, sections, settings);
  const card = (r: Round) => (<div key={r.key + r.k} className="card"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{r.subtopic} <span className="font-normal text-slate-500">· {r.topic}</span></p>
    <p className="text-xs text-slate-500">Round {r.k + 1} (day {r.days}) · due {r.due}</p></div>{!r.done && <button className="btn btn-primary" onClick={() => completeRound(r.key, r.k)}>Mark round done</button>}</div>
    <div className="mt-3 space-y-2">{r.questions.map((q) => (<div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-2 dark:border-slate-800"><div className="flex items-center gap-2"><Link to={`/question/${q.id}`} className="text-sm font-medium hover:underline">{q.title}</Link><DiffBadge d={q.difficulty} /></div><div className="flex gap-2"><PlatformLinks q={q} /></div></div>))}</div></div>);
  const sec = (title: string, list: Round[]) => (<section className="mb-5"><h2 className="mb-2 font-semibold">{title} ({list.length})</h2>{list.length ? <div className="space-y-3">{list.map(card)}</div> : <Empty>Nothing here.</Empty>}</section>);
  return (<div><PageTitle>Revision</PageTitle><p className="mb-4 text-sm text-slate-500">When you finish a section, it returns after {settings.intervals.join(', ')} days with up to {settings.revisionSize} important questions you've already solved. Starred, hint and solution-assisted questions come first.</p>
    {sec('Overdue', rounds.filter((r) => r.state === 'overdue'))}{sec('Due Today', rounds.filter((r) => r.state === 'today'))}{sec('Upcoming', rounds.filter((r) => r.state === 'upcoming'))}{sec('Completed Rounds', rounds.filter((r) => r.done))}
    <section><h2 className="mb-2 font-semibold">Skipped Questions</h2><QuestionList questions={qs.filter((q) => q.status === 'skipped')} showFilters={false} /></section></div>);
}
export function Favorites() { const qs = useQuestions().filter((q) => q.isFavorite); return (<div><PageTitle>Important</PageTitle>{qs.length ? <QuestionList questions={qs} /> : <Empty>Star a question to mark it important.</Empty>}</div>); }
