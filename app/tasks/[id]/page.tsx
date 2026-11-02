
import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

const allowedStatuses = [
  "queued",
  "working",
  "review",
  "done",
  "failed",
];

export default async function TaskDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

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

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, status, assignee_type, assignee_agent_id")
    .eq("id", id)
    .maybeSingle();

  if (taskError) {
    console.error("Task loading failed:", {
      code: taskError.code,
      message: taskError.message,
    });
    throw new Error("Unable to load assignment.");
  }

  if (!task) notFound();

  let agentName = "Unassigned";

  if (task.assignee_type === "agent" && task.assignee_agent_id) {
    const { data: agent } = await supabase
      .from("agents")
      .select("name")
      .eq("id", task.assignee_agent_id)
      .maybeSingle();

    if (agent) agentName = agent.name;
  }

  async function updateTask(formData: FormData) {
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

    const status = String(formData.get("status") || "");

    if (!allowedStatuses.includes(status)) {
      redirect(`/tasks/${id}?error=validation`);
    }

    const { data: updated, error } = await sb
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      console.error("Task update failed:", {
        code: error?.code || "no_updated_row",
        message: error?.message || "No task was updated",
      });

      redirect(`/tasks/${id}?error=save`);
    }

    redirect(`/tasks/${id}?saved=1`);
  }

  return (
    <main className="wrap">
      <h1>Manage Production Assignment</h1>

      <h2>{task.title}</h2>

      <p>
        Assigned to: <strong>{agentName}</strong>
      </p>

      <p>
        Current Status: <strong>{task.status}</strong>
      </p>

      {query.saved === "1" && (
        <p role="status" style={{ color: "green" }}>
          Assignment status updated successfully.
        </p>
      )}

      {query.error === "save" && (
        <p role="alert" style={{ color: "red" }}>
          Unable to update assignment status.
        </p>
      )}

      {query.error === "validation" && (
        <p role="alert" style={{ color: "red" }}>
          Please select a valid status.
        </p>
      )}

      <form action={updateTask}>
        <label htmlFor="status">
          Change Assignment Status
        </label>

        <select
          id="status"
          name="status"
          defaultValue={task.status}
          required
        >
          {allowedStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <button type="submit">
          Update Status
        </button>
      </form>

      <p>
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    </main>
  );
}
