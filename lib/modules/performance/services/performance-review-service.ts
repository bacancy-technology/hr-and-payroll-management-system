import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface PerformanceReviewFilters {
  employeeId?: string;
  status?: string;
  templateId?: string;
}

interface PerformanceReviewInput {
  employeeId?: string;
  templateId?: string;
  reviewerName?: string;
  status?: string;
  dueDate?: string;
  submittedAt?: string | null;
  score?: number | null;
  summary?: string | null;
  notes?: string | null;
}

interface PerformanceReviewRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  template_id: string;
  reviewer_name: string;
  status: string;
  due_date: string;
  submitted_at: string | null;
  score: number | null;
  summary: string | null;
  notes: string | null;
  created_at: string;
  performance_review_templates:
    | {
        id: string;
        name: string;
        cycle_label: string;
        review_type: string;
        status: string;
      }
    | {
        id: string;
        name: string;
        cycle_label: string;
        review_type: string;
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

const PERFORMANCE_REVIEW_SELECT = `
  id,
  employee_id,
  employee_name,
  template_id,
  reviewer_name,
  status,
  due_date,
  submitted_at,
  score,
  summary,
  notes,
  created_at,
  performance_review_templates (
    id,
    name,
    cycle_label,
    review_type,
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

function normalizePerformanceReview(row: PerformanceReviewRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    templateId: row.template_id,
    reviewerName: row.reviewer_name,
    status: row.status,
    dueDate: row.due_date,
    submittedAt: row.submitted_at,
    score: row.score,
    summary: row.summary,
    notes: row.notes,
    createdAt: row.created_at,
    template: normalizeRelation(row.performance_review_templates),
    employee: normalizeRelation(row.employees),
  };
}

async function ensurePerformanceTemplateExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  templateId: string,
) {
  const { data, error } = await supabase
    .from("performance_review_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the performance review template reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Performance review template not found.");
  }
}

export async function listPerformanceReviews(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: PerformanceReviewFilters = {},
) {
  let query = supabase
    .from("performance_reviews")
    .select(PERFORMANCE_REVIEW_SELECT)
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.templateId) {
    query = query.eq("template_id", filters.templateId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load performance reviews.", error.message);
  }

  return ((data as PerformanceReviewRow[] | null) ?? []).map((row) =>
    normalizePerformanceReview(row),
  );
}

export async function getPerformanceReviewById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  reviewId: string,
) {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select(PERFORMANCE_REVIEW_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", reviewId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the performance review.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Performance review not found.");
  }

  return normalizePerformanceReview(data as PerformanceReviewRow);
}

export async function createPerformanceReview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<PerformanceReviewInput, "employeeId" | "templateId" | "reviewerName" | "dueDate">> &
    PerformanceReviewInput,
) {
  const [employee] = await Promise.all([
    getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId),
    ensurePerformanceTemplateExists(supabase, organizationId, input.templateId),
  ]);

  const { data, error } = await supabase
    .from("performance_reviews")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      template_id: input.templateId,
      reviewer_name: input.reviewerName,
      status: input.status ?? "Draft",
      due_date: input.dueDate,
      submitted_at: input.submittedAt ?? null,
      score: input.score ?? null,
      summary: input.summary ?? null,
      notes: input.notes ?? null,
    })
    .select(PERFORMANCE_REVIEW_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the performance review.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Performance review creation did not return a record.");
  }

  return normalizePerformanceReview(data as PerformanceReviewRow);
}

export async function updatePerformanceReview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  reviewId: string,
  input: PerformanceReviewInput,
) {
  const current = await getPerformanceReviewById(supabase, organizationId, reviewId);
  let employeeId = input.employeeId ?? current.employeeId;
  let employeeName = current.employeeName;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
    employeeName = employee.full_name;
  }

  if (input.templateId) {
    await ensurePerformanceTemplateExists(supabase, organizationId, input.templateId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: employeeId,
      employee_name: employeeName,
      template_id: input.templateId,
      reviewer_name: input.reviewerName,
      status: input.status,
      due_date: input.dueDate,
      submitted_at: input.submittedAt,
      score: input.score,
      summary: input.summary,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one performance review field must be provided.");
  }

  const { data, error } = await supabase
    .from("performance_reviews")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", reviewId)
    .select(PERFORMANCE_REVIEW_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the performance review.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Performance review not found.");
  }

  return normalizePerformanceReview(data as PerformanceReviewRow);
}

export async function deletePerformanceReview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  reviewId: string,
) {
  const { error } = await supabase
    .from("performance_reviews")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", reviewId);

  if (error) {
    throw new ApiError(500, "Failed to delete the performance review.", error.message);
  }
}
