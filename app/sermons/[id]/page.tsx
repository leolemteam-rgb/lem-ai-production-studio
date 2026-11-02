import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
export default async function SermonContent({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{saved?:string,error?:string}>}) {
 const {id}=await params; const q=await searchParams; const sb=await supabaseServer();
 const {data:{user}}=await sb.auth.getUser(); if(!user) redirect('/login');
 const {data:member}=await sb.from('memberships').select('role').eq('user_id',user.id).eq('active',true).maybeSingle();
 if(!member) redirect('/access-denied');
 const {data:sermon}=await sb.from('sermons').select('id,title,program').eq('id',id).maybeSingle(); if(!sermon) notFound();
 const {data:content}=await sb.from('sermon_content').select('source_text').eq('sermon_id',id).maybeSingle();
 async function save(form:FormData){'use server'; const s=await supabaseServer();const {data:{user}}=await s.auth.getUser();if(!user) redirect('/login');
 const {data:m}=await s.from('memberships').select('role').eq('user_id',user.id).eq('active',true).in('role',['admin','manager']).maybeSingle();if(!m) redirect('/access-denied');
 const source_text=String(form.get('source_text')||'').trim();if(!source_text || source_text.length>60000) redirect(`/sermons/${id}?error=length`);
 const {error}=await s.from('sermon_content').upsert({sermon_id:id,source_text,source_type:'paste',updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:'sermon_id'});
 if(error){console.error('Content save',error.code);redirect(`/sermons/${id}?error=save`)}redirect(`/sermons/${id}?saved=1`)}
 return <main className="wrap"><a href="/dashboard">← Dashboard</a><h1>{sermon.title}</h1><p className="muted">{sermon.program} · Source material</p><section className="panel"><h2>Paste transcript or teaching notes</h2><p className="muted">Up to 60,000 characters. Upload support will be added later.</p><form action={save}><textarea name="source_text" rows={16} maxLength={60000} defaultValue={content?.source_text||''} required style={{width:'100%',padding:14,background:'#172943',color:'white',border:'1px solid #52617b',borderRadius:9}}/><p><button type="submit">Save Sermon Content</button></p></form>{q.saved&&<p role="status">Sermon content saved.</p>}{q.error&&<p role="alert">Could not save content. Check length and try again.</p>}</section></main>
}
