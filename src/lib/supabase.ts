import type { SupabaseClient } from "@supabase/supabase-js";

let browserClientPromise: Promise<SupabaseClient> | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export async function getSupabaseBrowserClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  if (!browserClientPromise) {
    browserClientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) => createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      ))
      .catch((error) => {
        browserClientPromise = null;
        throw error;
      });
  }
  return browserClientPromise;
}
