
import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";

export default async function SetPassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function updatePassword(formData: FormData) {
    "use server";

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (password.length < 12 || password !== confirmPassword) {
      redirect("/set-password?error=validation");
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    
if (error) {
  console.error("Supabase password update failed:", {
    message: error.message,
    code: error.code,
    status: error.status,
  });

  redirect("/set-password?error=update");
}


    redirect("/dashboard");
  }

  return (
    <main className="login panel">
      <h1 className="gold">Larry Elder Ministries</h1>
      <h2>Set Your Password</h2>

      <p className="muted">
        Create a secure password for your AI Production Studio account.
      </p>

      <form action={updatePassword}>
        <label>
          New Password
          <input
            type="password"
            name="password"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </label>

        <button type="submit">Save Password</button>
      </form>

      {error === "validation" && (
        <p role="alert">
          Passwords must match and contain at least 12 characters.
        </p>
      )}

      {error === "update" && (
        <p role="alert">
          Password update failed. Please try again.
        </p>
      )}
    </main>
  );
}
