
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items: {
          name: string;
          value: string;
          options?: {
            path?: string;
            maxAge?: number;
            domain?: string;
            sameSite?: boolean | "lax" | "strict" | "none";
            secure?: boolean;
            httpOnly?: boolean;
            expires?: Date;
          };
        }[]) {
          try {
            items.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Cookie writes may be unavailable in Server Components.
          }
        },
      },
    }
  );
}
