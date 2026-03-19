import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface RoleAssignmentInput {
  roleId?: string;
  profileId?: string;
  assignedByName?: string;
}

interface RoleAssignmentRow {
  id: string;
  role_id: string;
  profile_id: string;
  assigned_by_name: string;
  created_at: string;
  access_roles:
    | {
        id: string;
        name: string;
        permissions: string[];
        status: string;
      }
    | {
        id: string;
        name: string;
        permissions: string[];
        status: string;
      }[]
    | null;
  profiles:
    | {
        id: string;
        full_name: string;
        email: string;
        role: string;
      }
    | {
        id: string;
        full_name: string;
        email: string;
        role: string;
      }[]
    | null;
}

const ROLE_ASSIGNMENT_SELECT = `
  id,
  role_id,
  profile_id,
  assigned_by_name,
  created_at,
  access_roles (
    id,
    name,
    permissions,
    status
  ),
  profiles (
    id,
    full_name,
    email,
    role
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeRoleAssignment(row: RoleAssignmentRow) {
  return {
    id: row.id,
    roleId: row.role_id,
    profileId: row.profile_id,
    assignedByName: row.assigned_by_name,
    createdAt: row.created_at,
    role: normalizeRelation(row.access_roles),
    profile: normalizeRelation(row.profiles),
  };
}

async function ensureAccessRoleExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  roleId: string,
) {
  const { data, error } = await supabase
    .from("access_roles")
    .select("id, name")
    .eq("organization_id", organizationId)
    .eq("id", roleId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the access role reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Access role not found.");
  }

  return data;
}

async function ensureProfileExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the profile reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Profile not found.");
  }
}

export async function listRoleAssignments(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("role_assignments")
    .select(ROLE_ASSIGNMENT_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load role assignments.", error.message);
  }

  return ((data as RoleAssignmentRow[] | null) ?? []).map((row) => normalizeRoleAssignment(row));
}

export async function getRoleAssignmentById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  assignmentId: string,
) {
  const { data, error } = await supabase
    .from("role_assignments")
    .select(ROLE_ASSIGNMENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the role assignment.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Role assignment not found.");
  }

  return normalizeRoleAssignment(data as RoleAssignmentRow);
}

export async function createRoleAssignment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<RoleAssignmentInput, "roleId" | "profileId" | "assignedByName">>,
) {
  const role = await ensureAccessRoleExists(supabase, organizationId, input.roleId);
  await ensureProfileExists(supabase, organizationId, input.profileId);

  const { data, error } = await supabase
    .from("role_assignments")
    .insert({
      organization_id: organizationId,
      role_id: input.roleId,
      profile_id: input.profileId,
      assigned_by_name: input.assignedByName,
    })
    .select(ROLE_ASSIGNMENT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the role assignment.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Role assignment creation did not return a record.");
  }

  const { error: profileRoleError } = await supabase
    .from("profiles")
    .update({ role: role.name })
    .eq("id", input.profileId);

  if (profileRoleError) {
    throw new ApiError(500, "Failed to sync the profile role.", profileRoleError.message);
  }

  return normalizeRoleAssignment(data as RoleAssignmentRow);
}

export async function deleteRoleAssignment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  assignmentId: string,
) {
  const current = await getRoleAssignmentById(supabase, organizationId, assignmentId);

  const { error } = await supabase
    .from("role_assignments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", assignmentId);

  if (error) {
    throw new ApiError(500, "Failed to delete the role assignment.", error.message);
  }

  const { error: profileRoleError } = await supabase
    .from("profiles")
    .update({ role: "Employee" })
    .eq("id", current.profileId);

  if (profileRoleError) {
    throw new ApiError(500, "Failed to reset the profile role.", profileRoleError.message);
  }
}
