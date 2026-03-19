import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface AccessRoleInput {
  name?: string;
  description?: string | null;
  status?: string;
  permissions?: string[];
}

interface AccessRoleRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  permissions: string[];
  created_at: string;
}

const ACCESS_ROLE_SELECT = `
  id,
  name,
  description,
  status,
  permissions,
  created_at
`;

function normalizeAccessRole(row: AccessRoleRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    permissions: row.permissions,
    createdAt: row.created_at,
  };
}

export async function listAccessRoles(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("access_roles")
    .select(ACCESS_ROLE_SELECT)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load access roles.", error.message);
  }

  return ((data as AccessRoleRow[] | null) ?? []).map((row) => normalizeAccessRole(row));
}

export async function getAccessRoleById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  roleId: string,
) {
  const { data, error } = await supabase
    .from("access_roles")
    .select(ACCESS_ROLE_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", roleId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the access role.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Access role not found.");
  }

  return normalizeAccessRole(data as AccessRoleRow);
}

export async function createAccessRole(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<AccessRoleInput, "name" | "permissions">> & AccessRoleInput,
) {
  const { data, error } = await supabase
    .from("access_roles")
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "Active",
      permissions: input.permissions,
    })
    .select(ACCESS_ROLE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the access role.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Access role creation did not return a record.");
  }

  return normalizeAccessRole(data as AccessRoleRow);
}

export async function updateAccessRole(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  roleId: string,
  input: AccessRoleInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      description: input.description,
      status: input.status,
      permissions: input.permissions,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one access role field must be provided.");
  }

  const { data, error } = await supabase
    .from("access_roles")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", roleId)
    .select(ACCESS_ROLE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the access role.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Access role not found.");
  }

  return normalizeAccessRole(data as AccessRoleRow);
}

export async function deleteAccessRole(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  roleId: string,
) {
  const { error } = await supabase
    .from("access_roles")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", roleId);

  if (error) {
    throw new ApiError(500, "Failed to delete the access role.", error.message);
  }
}
