import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const cloudEnabled = !!(url && key);
export const supabase = cloudEnabled ? createClient(url!, key!) : null;
export async function signIn(email: string, password: string) {
  const { error } = await supabase!.auth.signInWithPassword({ email, password }); if (error) throw error;
}
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase!.auth.signUp({ email, password }); if (error) throw error;
  return data.session ? '' : 'Account created. Confirm the email we sent, then sign in.';
}
export const signOut = () => supabase!.auth.signOut();
