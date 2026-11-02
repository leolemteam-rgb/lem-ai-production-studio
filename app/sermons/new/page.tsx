
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";


export default async function NewSermon() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("role, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["admin", "manager"])
    .maybeSingle();

  if (error || !membership) {
    redirect("/dashboard");
  }

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <p className="gold">LARRY ELDER MINISTRIES</p>
          <h1>New Sermon</h1>
          <p className="muted">
            Register a new message for production.
          </p>
        </div>
        <a href="/dashboard">Back to Dashboard</a>
      </header>

      <section className="panel">
        <h2>Sermon Intake</h2>

        <form>
          <label>
            Message Title
            <input
              type="text"
              name="title"
              placeholder="Enter sermon or lesson title"
              required
            />
          </label>

          <label>
            Ministry Program
            <select name="program" required defaultValue="">
              <option value="" disabled>
                Select a program
              </option>
              <option value="Sunday Worship">
                Sunday Worship
              </option>
              <option value="Wednesday Bible Study">
                Wednesday Bible Study
              </option>
              <option value="Healing School">
                Healing School
              </option>
            </select>
          </label>

          <button type="button" disabled>
            Save Sermon — Coming Next
          </button>
        </form>
      </section>
    </main>
  );
}
