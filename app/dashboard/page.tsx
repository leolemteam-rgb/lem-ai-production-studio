import {supabaseServer} from '../../lib/supabase/server';
import {redirect} from 'next/navigation';
export default async function Dashboard(){
 const sb=await supabaseServer();const {data:{user}}=await sb.auth.getUser();
if (!user) redirect("/login");

const { data: membership, error: membershipError } = await sb
  .from("memberships")
  .select("role")
  .eq("user_id", user.id)
  .eq("active", true)
  .maybeSingle();

if (membershipError) {
  console.error("Dashboard membership check failed:", {
    code: membershipError.code,
    message: membershipError.message,
  });
  throw new Error("Unable to verify membership.");
}

if (!membership) {
  redirect("/access-denied");
}
;
 const [{data:sermons,error},{data:tasks},{data:approvals}]=await Promise.all([sb.from('sermons').select('id,title,program,status,created_at').order('created_at',{ascending:false}).limit(10),sb.from('tasks').select('id,title,status,assignee_type').limit(20),sb.from('approvals').select('id,status').limit(20)]);
 async function logout(){'use server';const s=await supabaseServer();await s.auth.signOut();redirect('/login')}
 return <main className="wrap"><header className="top"><div><p className="gold">LARRY ELDER MINISTRIES</p><h1>AI Production Studio</h1><p className="muted">Private production command center</p></div><form action={logout}><button>Sign out</button></form></header><nav className="nav"><a href="#sermons">Sermons</a><a href="#assignments">Assignments</a><a href="#approvals">Approvals</a></nav><section className="grid"><div className="panel"><span className="muted">Sermons</span><div className="stat">{sermons?.length??0}</div></div><div className="panel"><span className="muted">Tasks</span><div className="stat">{tasks?.length??0}</div></div><div className="panel"><span className="muted">Pending approvals</span><div className="stat">{approvals?.filter(a=>a.status==='pending').length??0}</div></div></section>
{error && (
  <p role="alert">
    Unable to load sermons. Database error code: {error.code || "unknown"}.</p>)}
<section id="sermons" className="panel">
  <div className="top">
    <h2>Sermons</h2>
    <a href="/sermons/new" className="button">
      + New Sermon
    </a>
  </div>
{sermons?.length?sermons.map(s=><div className="row" key={s.id}><p>{s.title} <span className="muted">· {s.program}</span></p><span className="pill">{s.status}</span></div>):<p className="muted">No sermons yet. Upload intake will be added after authentication and database setup.</p>}</section>
<section id="assignments" className="panel">
  <div className="top">
    <h2>Human & AI Assignments</h2>
    <a href="//new" className="button">
      + New Assignment
    </a>
  </div>

{tasks?.length ? (
  tasks.map((t) => (
    <div className="row" key={t.id}>
      <p>
        <a href={`/tasks/${t.id}`}>
          {t.title}
        </a>
        <span className="muted">
          {" "}· {t.assignee_type}
        </span>
      </p>
      <span className="pill">{t.status}</span>
    </div>
  ))
) : (
  <p className="muted">No assignments yet.</p>
)}
</section><section id="approvals" className="panel"><h2>Approvals</h2><p className="muted">{approvals?.filter(a=>a.status==='pending').length??0} items awaiting review. Publication integration will remain disabled until the approval gate is implemented.</p></section></main>
}
