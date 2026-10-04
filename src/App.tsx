import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { BarChart3, CalendarDays, Heart, LayoutDashboard, ListChecks, Map, RotateCcw, Settings as Cog } from 'lucide-react';
import { useStore } from './store/useStore';
import { TargetPicker } from './components/ui';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import { Roadmap, TopicPage } from './pages/Roadmap';
import QuestionPage from './pages/QuestionPage';
import { Progress, Calendar } from './pages/Progress';
import { Revision, Favorites } from './pages/Revision';
import Settings from './pages/Settings';

const nav = [['/dashboard', 'Dashboard', LayoutDashboard], ['/roadmap', 'Roadmap', Map], ['/today', "Today's Tasks", ListChecks], ['/revision', 'Revision', RotateCcw], ['/favorites', 'Important', Heart], ['/progress', 'Progress', BarChart3], ['/calendar', 'Calendar', CalendarDays], ['/settings', 'Settings', Cog]] as const;

export default function App() {
  const onboarded = useStore((s) => s.onboarded), onboard = useStore((s) => s.onboard), theme = useStore((s) => s.settings.theme), refreshQueue = useStore((s) => s.refreshQueue);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches));
    apply(); mq.addEventListener('change', apply); return () => mq.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => { refreshQueue(); }, [refreshQueue]);
  if (!onboarded) return (<div className="flex min-h-screen items-center justify-center p-4"><div className="card max-w-md"><h1 className="text-2xl font-semibold">Welcome to your DSA journey.</h1>
    <p className="mb-4 mt-2 text-sm text-slate-500">How many questions would you like to solve per day? You can change this any time, and some days can be zero.</p><TargetPicker onPick={onboard} /></div></div>);
  return (<div className="min-h-screen md:flex">
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 p-4 dark:border-slate-800 md:block"><p className="mb-4 text-lg font-bold">DSA OS</p>
      <nav className="sticky top-4 flex flex-col gap-1">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Icon size={16} />{label}</NavLink>)}</nav></aside>
    <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8">
      <Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/roadmap" element={<Roadmap />} /><Route path="/roadmap/:topic" element={<TopicPage />} />
        <Route path="/today" element={<Today />} /><Route path="/question/:id" element={<QuestionPage />} /><Route path="/progress" element={<Progress />} /><Route path="/calendar" element={<Calendar />} />
        <Route path="/revision" element={<Revision />} /><Route path="/favorites" element={<Favorites />} /><Route path="/settings" element={<Settings />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></main>
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white py-1 dark:border-slate-800 dark:bg-slate-900 md:hidden">
      {nav.filter(([to]) => !['/favorites', '/calendar'].includes(to)).map(([to, label, Icon]) => <NavLink key={to} to={to} aria-label={label} className={({ isActive }) => `flex flex-col items-center p-2 text-[10px] ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}><Icon size={18} />{label.split(' ')[0]}</NavLink>)}</nav></div>);
}
