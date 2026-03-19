import type { User } from "@supabase/supabase-js";

import { ApiError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id: string | null;
}

export interface OptionalSessionContext {
  enabled: boolean;
  authenticated: boolean;
  user: User | null;
  profile: ProfileRecord | null;
}

export type AuthenticatedSupabaseClient = NonNullable<Awaited<ReturnType<typeof createServerClient>>>;

export interface ApiContext {
  supabase: AuthenticatedSupabaseClient;
  user: User;
  profile: ProfileRecord;
  organizationId: string;
}

async function getSupabaseClient() {
  if (!env.hasSupabase) {
    throw new ApiError(503, "Supabase is not configured.");
  }

  const supabase = await createServerClient();

  if (!supabase) {
    throw new ApiError(503, "Supabase is not configured.");
  }

  return supabase;
}

async function getProfile(supabase: AuthenticatedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the user profile.", error.message);
  }

  return data as ProfileRecord | null;
}

export async function getOptionalSessionContext(): Promise<OptionalSessionContext> {
  if (!env.hasSupabase) {
    return {
      enabled: false,
      authenticated: false,
      user: null,
      profile: null,
    };
  }

  const supabase = await createServerClient();

  if (!supabase) {
    return {
      enabled: false,
      authenticated: false,
      user: null,
      profile: null,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      enabled: true,
      authenticated: false,
      user: null,
      profile: null,
    };
  }

  return {
    enabled: true,
    authenticated: true,
    user,
    profile: await getProfile(supabase, user.id),
  };
}

export async function requireApiContext(): Promise<ApiContext> {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const profile = await getProfile(supabase, user.id);

  if (!profile?.organization_id) {
    throw new ApiError(403, "Your account is not assigned to an organization.");
  }

  return {
    supabase,
    user,
    profile,
    organizationId: profile.organization_id,
  };
}
