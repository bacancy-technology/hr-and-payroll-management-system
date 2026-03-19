import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export function createBrowserClient() {
  if (!env.hasSupabase) {
    return null;
  }

  return createSupabaseBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
