
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase/browser";

export default function FinishAuth() {
  const router = useRouter();
  const [message, setMessage] = useState(
    "Completing your secure sign-in..."
  );

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const supabase = supabaseBrowser();
      const params = new URLSearchParams(
        window.location.hash.substring(1)
      );

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        setMessage(
          "No authentication tokens were found. Please request a new invitation or password recovery link."
        );
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (cancelled) return;

      if (error) {
        setMessage(
          "Unable to complete authentication. The link may have expired."
        );
        return;
      }

      window.history.replaceState(
        null,
        "",
        "/auth/finish"
      );

      router.replace("/set-password");
      router.refresh();
    }

    finish();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="login panel">
      <h1 className="gold">Larry Elder Ministries</h1>
      <h2>AI Production Studio</h2>
      <p role="status">{message}</p>
    </main>
  );
}
