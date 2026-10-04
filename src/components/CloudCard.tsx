import { useState } from 'react';
import { cloudEnabled, signIn, signOut, signUp } from '../services/cloud';
import { syncNow } from '../services/sync';
import { useCloud } from '../store/useCloud';

export default function CloudCard() {
  const { user, status, error } = useCloud(); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const run = async (f: () => Promise<string | void>) => { setBusy(true); setMsg(''); try { setMsg((await f()) || ''); } catch (e) { setMsg((e as Error).message); } setBusy(false); };
  if (!cloudEnabled) return <div className="card mt-4"><h2 className="font-semibold">Cloud sync</h2><p className="text-sm text-slate-500">Not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README). The app keeps working from this browser's storage meanwhile.</p></div>;
  return (<div className="card mt-4"><h2 className="mb-2 font-semibold">Cloud sync</h2>
    {user ? <div className="flex flex-wrap items-center gap-2 text-sm"><span>Signed in as <b>{user}</b></span><span className="text-slate-500">· {status === 'syncing' ? 'syncing…' : status === 'synced' ? 'synced ✓' : status === 'error' ? 'error' : 'idle'}</span>
      <button className="btn ml-auto" onClick={() => void syncNow()}>Sync now</button><button className="btn" onClick={() => run(async () => { await signOut(); })}>Sign out</button>{error && <p className="w-full text-rose-600">{error}</p>}</div>
    : <div className="flex flex-wrap gap-2"><input className="input" type="email" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="input" type="password" placeholder="Password (min 6)" aria-label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <button className="btn btn-primary" disabled={busy} onClick={() => run(() => signIn(email, pw))}>Sign in</button><button className="btn" disabled={busy} onClick={() => run(() => signUp(email, pw))}>Sign up</button></div>}
    {msg && <p className="mt-2 text-sm text-slate-500">{msg}</p>}</div>);
}
