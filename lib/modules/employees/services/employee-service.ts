import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface EmployeeInput {
  fullName?: string;
  email?: string;
  role?: string;
  departmentId?: string | null;
  status?: string;
  location?: string;
  salary?: number;
  startDate?: string;
  managerName?: string;
  nextReviewAt?: string;
}

interface EmployeeRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  location: string;
  salary: number;
  start_date: string;
  manager_name: string;
  next_review_at: string;
  departments: { id: string; name: string; code: string | null }[] | { id: string; name: string; code: string | null } | null;
}

const EMPLOYEE_SELECT = `
  id,
  full_name,
  email,
  role,
  status,
  location,
  salary,
  start_date,
  manager_name,
  next_review_at,
  departments (
    id,
    name,
    code
  )
`;

function normalizeEmployee(row: EmployeeRow) {
  const department = Array.isArray(row.departments) ? row.departments[0] ?? null : row.departments;

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    location: row.location,
    salary: row.salary,
    startDate: row.start_date,
    managerName: row.manager_name,
    nextReviewAt: row.next_review_at,
    department,
  };
}

export async function listEmployees(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load employees.", error.message);
  }

  return ((data as EmployeeRow[] | null) ?? []).map((row) => normalizeEmployee(row));
}

export async function getEmployeeById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the employee.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Employee not found.");
  }

  return normalizeEmployee(data as EmployeeRow);
}

export async function createEmployee(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<EmployeeInput, "fullName" | "email" | "role" | "status" | "location" | "salary" | "startDate" | "managerName" | "nextReviewAt">
  > &
    EmployeeInput,
) {
  const { data, error } = await supabase
    .from("employees")
    .insert({
      organization_id: organizationId,
      department_id: input.departmentId ?? null,
      full_name: input.fullName,
      email: input.email,
      role: input.role,
      status: input.status,
      location: input.location,
      salary: input.salary,
      start_date: input.startDate,
      manager_name: input.managerName,
      next_review_at: input.nextReviewAt,
    })
    .select(EMPLOYEE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the employee.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Employee creation did not return a record.");
  }

  return normalizeEmployee(data as EmployeeRow);
}

export async function updateEmployee(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
  input: EmployeeInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      department_id: input.departmentId,
      full_name: input.fullName,
      email: input.email,
      role: input.role,
      status: input.status,
      location: input.location,
      salary: input.salary,
      start_date: input.startDate,
      manager_name: input.managerName,
      next_review_at: input.nextReviewAt,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one employee field must be provided.");
  }

  const { data, error } = await supabase
    .from("employees")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", employeeId)
    .select(EMPLOYEE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the employee.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Employee not found.");
  }

  return normalizeEmployee(data as EmployeeRow);
}

export async function deleteEmployee(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", employeeId);

  if (error) {
    throw new ApiError(500, "Failed to delete the employee.", error.message);
  }
}
