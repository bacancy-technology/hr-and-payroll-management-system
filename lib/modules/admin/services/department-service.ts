import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface DepartmentInput {
  name?: string;
  code?: string;
  leadName?: string;
}

export async function listDepartments(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, code, lead_name, created_at")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load departments.", error.message);
  }

  return data ?? [];
}

export async function getDepartmentById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  departmentId: string,
) {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, code, lead_name, created_at")
    .eq("organization_id", organizationId)
    .eq("id", departmentId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the department.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Department not found.");
  }

  return data;
}

export async function createDepartment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<DepartmentInput, "name">> & DepartmentInput,
) {
  const { data, error } = await supabase
    .from("departments")
    .insert({
      organization_id: organizationId,
      name: input.name,
      code: input.code ?? null,
      lead_name: input.leadName ?? null,
    })
    .select("id, name, code, lead_name, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the department.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Department creation did not return a record.");
  }

  return data;
}

export async function updateDepartment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  departmentId: string,
  input: DepartmentInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      code: input.code,
      lead_name: input.leadName,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one department field must be provided.");
  }

  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", departmentId)
    .select("id, name, code, lead_name, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the department.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Department not found.");
  }

  return data;
}

export async function deleteDepartment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  departmentId: string,
) {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", departmentId);

  if (error) {
    throw new ApiError(500, "Failed to delete the department.", error.message);
  }
}
