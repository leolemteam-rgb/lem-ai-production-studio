import {supabaseServer} from '../../lib/supabase/server';
import {redirect} from 'next/navigation';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 async function signIn(form:FormData){'use server';const supabase=await supabaseServer();const email=String(form.get('email')||'');const password=String(form.get('password')||'');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)redirect('/login?error=1');redirect('/dashboard')}
 return <main className="login panel"><h1 className="gold">Larry Elder Ministries</h1><h2>AI Production Studio</h2><p className="muted">Private team access · Invite only</p><form action={signIn}><label>Email<input type="email" name="email" required autoComplete="email"/></label><label>Password<input type="password" name="password" required autoComplete="current-password"/></label><button type="submit">Sign in</button></form>{error&&<p role="alert">Sign in failed. Verify your credentials.</p>}<p className="muted">Accounts are created by the administrator. Public registration is disabled.</p></main>
}
