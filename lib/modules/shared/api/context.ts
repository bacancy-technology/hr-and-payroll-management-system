import type { User } from "@supabase/supabase-js";

import { ApiError } from "@/lib/modules/shared/api/errors";
import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id: string | null;
}

interface AssignedRoleRecord {
  id: string;
  name: string;
  permissions: string[];
  status: string;
}

export interface OptionalSessionContext {
  enabled: boolean;
  authenticated: boolean;
  user: User | null;
  profile: ProfileRecord | null;
  assignedRoles: AssignedRoleRecord[];
}

export type AuthenticatedSupabaseClient = NonNullable<Awaited<ReturnType<typeof createServerClient>>>;

export interface ApiContext {
  supabase: AuthenticatedSupabaseClient;
  user: User;
  profile: ProfileRecord;
  organizationId: string;
  assignedRoles: AssignedRoleRecord[];
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

async function getAssignedRoles(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
): Promise<AssignedRoleRecord[]> {
  const { data, error } = await supabase
    .from("role_assignments")
    .select(
      `
        access_roles (
          id,
          name,
          permissions,
          status
        )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("profile_id", userId);

  if (error) {
    throw new ApiError(500, "Failed to load role assignments.", error.message);
  }

  return ((data ?? []) as { access_roles: AssignedRoleRecord | AssignedRoleRecord[] | null }[])
    .map((row) => (Array.isArray(row.access_roles) ? row.access_roles[0] ?? null : row.access_roles))
    .filter((role): role is AssignedRoleRecord => Boolean(role));
}

export async function getOptionalSessionContext(): Promise<OptionalSessionContext> {
  if (!env.hasSupabase) {
    return {
      enabled: false,
      authenticated: false,
      user: null,
      profile: null,
      assignedRoles: [],
    };
  }

  const supabase = await createServerClient();

  if (!supabase) {
    return {
      enabled: false,
      authenticated: false,
      user: null,
      profile: null,
      assignedRoles: [],
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
      assignedRoles: [],
    };
  }

  const profile = await getProfile(supabase, user.id);
  const assignedRoles = profile?.organization_id
    ? await getAssignedRoles(supabase, profile.organization_id, user.id)
    : [];

  return {
    enabled: true,
    authenticated: true,
    user,
    profile,
    assignedRoles,
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

  const assignedRoles = await getAssignedRoles(supabase, profile.organization_id, user.id);

  return {
    supabase,
    user,
    profile,
    organizationId: profile.organization_id,
    assignedRoles,
  };
}
