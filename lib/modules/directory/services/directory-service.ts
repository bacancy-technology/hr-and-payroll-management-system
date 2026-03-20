import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface DirectoryFilters {
  search?: string;
  departmentId?: string;
  status?: string;
  location?: string;
}

interface DirectoryEmployeeRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  location: string;
  manager_name: string;
  start_date: string;
  next_review_at: string;
  departments:
    | {
        id: string;
        name: string;
        code: string | null;
        lead_name: string | null;
      }
    | {
        id: string;
        name: string;
        code: string | null;
        lead_name: string | null;
      }[]
    | null;
}

const DIRECTORY_SELECT = `
  id,
  full_name,
  email,
  role,
  status,
  location,
  manager_name,
  start_date,
  next_review_at,
  departments (
    id,
    name,
    code,
    lead_name
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeDirectoryEmployee(row: DirectoryEmployeeRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    location: row.location,
    managerName: row.manager_name,
    startDate: row.start_date,
    nextReviewAt: row.next_review_at,
    department: normalizeRelation(row.departments),
  };
}

async function getDirectoryEmployeeRowById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select(DIRECTORY_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the directory employee.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Directory employee not found.");
  }

  return data as DirectoryEmployeeRow;
}

export async function listDirectoryEmployees(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: DirectoryFilters = {},
) {
  let query = supabase
    .from("employees")
    .select(DIRECTORY_SELECT)
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (filters.departmentId) {
    query = query.eq("department_id", filters.departmentId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.location) {
    query = query.eq("location", filters.location);
  }

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    query = query.or(
      `full_name.ilike.${searchValue},email.ilike.${searchValue},role.ilike.${searchValue},manager_name.ilike.${searchValue}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load directory employees.", error.message);
  }

  return ((data as DirectoryEmployeeRow[] | null) ?? []).map((row) => normalizeDirectoryEmployee(row));
}

export async function getDirectoryEmployeeById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const employee = normalizeDirectoryEmployee(
    await getDirectoryEmployeeRowById(supabase, organizationId, employeeId),
  );

  const { data: directReports, error: directReportsError } = await supabase
    .from("employees")
    .select(DIRECTORY_SELECT)
    .eq("organization_id", organizationId)
    .eq("manager_name", employee.fullName)
    .order("full_name", { ascending: true });

  if (directReportsError) {
    throw new ApiError(500, "Failed to load direct reports.", directReportsError.message);
  }

  const { data: peers, error: peersError } = await supabase
    .from("employees")
    .select(DIRECTORY_SELECT)
    .eq("organization_id", organizationId)
    .eq(
      "department_id",
      employee.department?.id ?? "00000000-0000-0000-0000-000000000000",
    )
    .neq("id", employee.id)
    .order("full_name", { ascending: true });

  if (peersError) {
    throw new ApiError(500, "Failed to load directory peers.", peersError.message);
  }

  const manager = employee.managerName
    ? await supabase
        .from("employees")
        .select(DIRECTORY_SELECT)
        .eq("organization_id", organizationId)
        .eq("full_name", employee.managerName)
        .maybeSingle()
    : { data: null, error: null };

  if (manager.error) {
    throw new ApiError(500, "Failed to load the reporting manager.", manager.error.message);
  }

  return {
    ...employee,
    manager: manager.data ? normalizeDirectoryEmployee(manager.data as DirectoryEmployeeRow) : null,
    directReports: ((directReports as DirectoryEmployeeRow[] | null) ?? []).map((row) =>
      normalizeDirectoryEmployee(row),
    ),
    peers: ((peers as DirectoryEmployeeRow[] | null) ?? []).map((row) => normalizeDirectoryEmployee(row)),
  };
}

export async function getDirectoryOverview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const employees = await listDirectoryEmployees(supabase, organizationId);

  return {
    summary: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((employee) => employee.status === "Active").length,
      departments: [...new Set(employees.map((employee) => employee.department?.name ?? "Unassigned"))]
        .sort((left, right) => left.localeCompare(right))
        .length,
      managers: [...new Set(employees.map((employee) => employee.managerName).filter(Boolean))].length,
    },
    employees,
    orgChart: employees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      role: employee.role,
      departmentName: employee.department?.name ?? "Unassigned",
      managerName: employee.managerName,
    })),
  };
}
