import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { ConfirmDialog, PageTitle } from '../components/ui';
import { exportData } from '../services/storage';
import { snapshot } from '../utils/planner';
import CloudCard from '../components/CloudCard';

export default function Settings() {
  const s = useStore(); const { settings: st, updateSettings: up } = s; const [confirm, setConfirm] = useState(false); const [msg, setMsg] = useState(''); const file = useRef<HTMLInputElement>(null);
  const row = (l: string, c: React.ReactNode) => <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"><span className="text-sm">{l}</span>{c}</div>;
  const chk = (k: 'streakEnabled' | 'streakRequiresCompletion' | 'autoUnlock') => <input type="checkbox" className="h-4 w-4" checked={st[k]} onChange={(e) => up({ [k]: e.target.checked })} />;
  return (<div><PageTitle>Settings</PageTitle><div className="card">
    {row('Default questions per day', <input type="number" min={0} max={50} className="input w-20" value={s.plan.defaultTarget} onChange={(e) => s.setDefaultTarget(+e.target.value)} />)}
    {row('Default difficulty', <select className="input" value={st.defaultDifficulty} onChange={(e) => up({ defaultDifficulty: e.target.value as typeof st.defaultDifficulty })}><option>Any</option><option>Easy</option><option>Medium</option><option>Hard</option></select>)}
    {row('Enable streak', chk('streakEnabled'))}{row('Streak requires at least 1 completed question', chk('streakRequiresCompletion'))}
    {row('Automatic topic unlocking', chk('autoUnlock'))}{row('Unlock next topic at (% of previous)', <input type="number" min={0} max={100} className="input w-20" value={st.unlockPercent} onChange={(e) => up({ unlockPercent: +e.target.value })} />)}
    {row('Questions per revision round', <input type="number" min={1} max={20} className="input w-20" value={st.revisionSize} onChange={(e) => up({ revisionSize: Math.max(1, +e.target.value) })} />)}
    {row('Section revision days after finishing a section (comma separated)', <input className="input w-40" defaultValue={st.intervals.join(',')} onBlur={(e) => { const v = e.target.value.split(',').map((x) => parseInt(x)).filter((x) => x > 0); if (v.length) up({ intervals: v }); }} />)}
    {row('Theme', <select className="input" value={st.theme} onChange={(e) => up({ theme: e.target.value as typeof st.theme })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>)}</div>
    <div className="card mt-4 flex flex-wrap items-center gap-2"><button className="btn" onClick={() => exportData(snapshot(s))}>Export progress</button><button className="btn" onClick={() => file.current?.click()}>Import progress</button>
      <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { s.importJson(await f.text()); setMsg('Import successful.'); } catch (err) { setMsg('Import failed: ' + (err as Error).message); } e.target.value = ''; }} />
      <button className="btn ml-auto text-rose-600" onClick={() => setConfirm(true)}>Reset progress</button>{msg && <p className="w-full text-sm text-slate-500">{msg}</p>}</div>
    <CloudCard />
    {confirm && <ConfirmDialog title="Reset all progress?" text="This deletes all progress, notes and settings here, and the cloud copy too if you are signed in. Export first if unsure." onConfirm={s.reset} onClose={() => setConfirm(false)} />}</div>);
}
