import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export async function createServerClient() {
  if (!env.hasSupabase) {
    return null;
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not allow mutating cookies. Middleware keeps auth fresh.
        }
      },
    },
  });
}
