
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

export default async function NewSermon({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: formError } = await searchParams;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["admin", "manager"])
    .maybeSingle();

  if (!membership) {
    redirect("/dashboard");
  }

  async function saveSermon(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: membership } = await sb
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("active", true)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (!membership) {
      redirect("/dashboard");
    }

    const title = String(formData.get("title") || "").trim();
    const program = String(formData.get("program") || "");

    const allowedPrograms = [
      "Sunday Worship",
      "Wednesday Bible Study",
      "Healing School",
    ];

    if (
      !title ||
      title.length > 200 ||
      !allowedPrograms.includes(program)
    ) {
      redirect("/sermons/new?error=validation");
    }

    const { error } = await sb.from("sermons").insert({
      title,
      program,
      
status: "queued",
      created_by: user.id,
    });

    if (error) {
      console.error("Sermon creation failed:", {
        code: error.code,
        message: error.message,
      });

      redirect("/sermons/new?error=save");
    }

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

        <form action={saveSermon}>
          <label>
            Message Title
            <input
              type="text"
              name="title"
              maxLength={200}
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

          <button type="submit">Save Sermon</button>
        </form>

        {formError === "validation" && (
          <p role="alert">
            Enter a valid title and select a ministry program.
          </p>
        )}

        {formError === "save" && (
          <p role="alert">
            Unable to save sermon. Please try again.
          </p>
        )}
      </section>
    </main>
  );
}
