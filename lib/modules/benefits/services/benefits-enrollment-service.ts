import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface BenefitsEnrollmentFilters {
  employeeId?: string;
  status?: string;
  planId?: string;
}

interface BenefitsEnrollmentInput {
  employeeId?: string;
  planId?: string;
  status?: string;
  effectiveDate?: string;
  endDate?: string | null;
  payrollDeduction?: number;
  notes?: string | null;
}

interface BenefitsEnrollmentRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  plan_id: string;
  status: string;
  effective_date: string;
  end_date: string | null;
  payroll_deduction: number;
  notes: string | null;
  created_at: string;
  benefits_plans:
    | {
        id: string;
        name: string;
        provider_name: string;
        category: string;
        coverage_level: string;
        employee_cost: number;
        employer_cost: number;
        status: string;
      }
    | {
        id: string;
        name: string;
        provider_name: string;
        category: string;
        coverage_level: string;
        employee_cost: number;
        employer_cost: number;
        status: string;
      }[]
    | null;
  employees:
    | {
        id: string;
        full_name: string;
        email: string;
      }
    | {
        id: string;
        full_name: string;
        email: string;
      }[]
    | null;
}

const BENEFITS_ENROLLMENT_SELECT = `
  id,
  employee_id,
  employee_name,
  plan_id,
  status,
  effective_date,
  end_date,
  payroll_deduction,
  notes,
  created_at,
  benefits_plans (
    id,
    name,
    provider_name,
    category,
    coverage_level,
    employee_cost,
    employer_cost,
    status
  ),
  employees (
    id,
    full_name,
    email
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeBenefitsEnrollment(row: BenefitsEnrollmentRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    planId: row.plan_id,
    status: row.status,
    effectiveDate: row.effective_date,
    endDate: row.end_date,
    payrollDeduction: row.payroll_deduction,
    notes: row.notes,
    createdAt: row.created_at,
    plan: normalizeRelation(row.benefits_plans),
    employee: normalizeRelation(row.employees),
  };
}

function validateEnrollmentDateRange(effectiveDate: string, endDate?: string | null) {
  if (endDate && new Date(endDate).getTime() < new Date(effectiveDate).getTime()) {
    throw new ApiError(400, "Benefits enrollment endDate must be on or after effectiveDate.");
  }
}

async function ensureBenefitsPlanExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  planId: string,
) {
  const { data, error } = await supabase
    .from("benefits_plans")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", planId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the benefits plan reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Benefits plan not found.");
  }
}

export async function listBenefitsEnrollments(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: BenefitsEnrollmentFilters = {},
) {
  let query = supabase
    .from("benefits_enrollments")
    .select(BENEFITS_ENROLLMENT_SELECT)
    .eq("organization_id", organizationId)
    .order("effective_date", { ascending: false });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.planId) {
    query = query.eq("plan_id", filters.planId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load benefits enrollments.", error.message);
  }

  return ((data as BenefitsEnrollmentRow[] | null) ?? []).map((row) => normalizeBenefitsEnrollment(row));
}

export async function getBenefitsEnrollmentById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  enrollmentId: string,
) {
  const { data, error } = await supabase
    .from("benefits_enrollments")
    .select(BENEFITS_ENROLLMENT_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the benefits enrollment.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Benefits enrollment not found.");
  }

  return normalizeBenefitsEnrollment(data as BenefitsEnrollmentRow);
}

export async function createBenefitsEnrollment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<BenefitsEnrollmentInput, "employeeId" | "planId" | "effectiveDate" | "payrollDeduction">
  > &
    BenefitsEnrollmentInput,
) {
  validateEnrollmentDateRange(input.effectiveDate, input.endDate);

  const [employee] = await Promise.all([
    getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId),
    ensureBenefitsPlanExists(supabase, organizationId, input.planId),
  ]);

  const { data, error } = await supabase
    .from("benefits_enrollments")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      plan_id: input.planId,
      status: input.status ?? "Pending",
      effective_date: input.effectiveDate,
      end_date: input.endDate ?? null,
      payroll_deduction: input.payrollDeduction,
      notes: input.notes ?? null,
    })
    .select(BENEFITS_ENROLLMENT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the benefits enrollment.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Benefits enrollment creation did not return a record.");
  }

  return normalizeBenefitsEnrollment(data as BenefitsEnrollmentRow);
}

export async function updateBenefitsEnrollment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  enrollmentId: string,
  input: BenefitsEnrollmentInput,
) {
  const current = await getBenefitsEnrollmentById(supabase, organizationId, enrollmentId);
  const nextEffectiveDate = input.effectiveDate ?? current.effectiveDate;
  const nextEndDate = input.endDate === undefined ? current.endDate : input.endDate;

  validateEnrollmentDateRange(nextEffectiveDate, nextEndDate);

  let employeeId = input.employeeId ?? current.employeeId;
  let employeeName = current.employeeName;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
    employeeName = employee.full_name;
  }

  if (input.planId) {
    await ensureBenefitsPlanExists(supabase, organizationId, input.planId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: employeeId,
      employee_name: employeeName,
      plan_id: input.planId,
      status: input.status,
      effective_date: input.effectiveDate,
      end_date: input.endDate,
      payroll_deduction: input.payrollDeduction,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one benefits enrollment field must be provided.");
  }

  const { data, error } = await supabase
    .from("benefits_enrollments")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", enrollmentId)
    .select(BENEFITS_ENROLLMENT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the benefits enrollment.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Benefits enrollment not found.");
  }

  return normalizeBenefitsEnrollment(data as BenefitsEnrollmentRow);
}

export async function deleteBenefitsEnrollment(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  enrollmentId: string,
) {
  const { error } = await supabase
    .from("benefits_enrollments")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", enrollmentId);

  if (error) {
    throw new ApiError(500, "Failed to delete the benefits enrollment.", error.message);
  }
}
