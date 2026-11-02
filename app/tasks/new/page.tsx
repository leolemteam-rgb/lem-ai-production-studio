
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

export default async function NewTask({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: formError } = await searchParams;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["admin", "manager"])
    .maybeSingle();

  if (!membership) redirect("/dashboard");

  const { data: sermons, error: sermonsError } =
    await supabase
      .from("sermons")
      .select("id, title")
      .order("created_at", { ascending: false });

  const { data: agents, error: agentsError } =
    await supabase
      .from("agents")
      .select("id, name, specialty")
      .eq("enabled", true)
      .order("name");

  async function saveTask(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) redirect("/login");

    const { data: membership } = await sb
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("active", true)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (!membership) redirect("/dashboard");

    const title = String(
      formData.get("title") || ""
    ).trim();

    const sermonId = String(
      formData.get("sermon_id") || ""
    );

    const agentId = String(
      formData.get("agent_id") || ""
    );

    if (!title || title.length > 200) {
      redirect("/tasks/new?error=validation");
    }

    const { data: sermon } = await sb
      .from("sermons")
      .select("id")
      .eq("id", sermonId)
      .maybeSingle();

    const { data: agent } = await sb
      .from("agents")
      .select("id")
      .eq("id", agentId)
      .eq("enabled", true)
      .maybeSingle();

    if (!sermon || !agent) {
      redirect("/tasks/new?error=validation");
    }

    const { error } = await sb
      .from("tasks")
      .insert({
        sermon_id: sermonId,
        title,
        status: "queued",
        assignee_type: "agent",
        assignee_user_id: null,
        assignee_agent_id: agentId,
      });

    if (error) {
      console.error("Task creation failed:", {
        code: error.code,
        message: error.message,
      });

      redirect("/tasks/new?error=save");
    }

    redirect("/dashboard");
  }

  return (
    <main className="wrap">
      <h1>New Production Assignment</h1>

      <p>
        Assign sermon production work to an AI team member.
      </p>

      {formError === "save" && (
        <p style={{ color: "red" }}>
          Unable to save assignment.
        </p>
      )}

      {formError === "validation" && (
        <p style={{ color: "red" }}>
          Please check your assignment information.
        </p>
      )}

      {(sermonsError || agentsError) && (
        <p style={{ color: "red" }}>
          Unable to load sermons or AI agents.
        </p>
      )}

      <form action={saveTask}>
        <div>
          <label htmlFor="sermon_id">
            Sermon
          </label>

          <select
            id="sermon_id"
            name="sermon_id"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select a sermon
            </option>

            {(sermons || []).map((sermon) => (
              <option
                key={sermon.id}
                value={sermon.id}
              >
                {sermon.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title">
            Assignment Title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            maxLength={200}
            placeholder="Generate YouTube description"
            required
          />
        </div>

        <div>
          <label htmlFor="agent_id">
            Assign to AI Agent
          </label>

          <select
            id="agent_id"
            name="agent_id"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select an AI team member
            </option>

            {(agents || []).map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.name} — {agent.specialty}
              </option>
            ))}
          </select>
        </div>

        <p>Initial Status: Queued</p>

        <button
          type="submit"
          disabled={
            !!sermonsError ||
            !!agentsError ||
            !sermons?.length ||
            !agents?.length
          }
        >
          Save Assignment
        </button>
      </form>

      <p>
        <a href="/dashboard">
          Back to Dashboard
        </a>
      </p>
    </main>
  );
}
