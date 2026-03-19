import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface PerformanceTemplateInput {
  name?: string;
  cycleLabel?: string;
  reviewType?: string;
  status?: string;
  questions?: string[];
}

interface PerformanceTemplateRow {
  id: string;
  name: string;
  cycle_label: string;
  review_type: string;
  status: string;
  questions: string[];
  created_at: string;
}

const PERFORMANCE_TEMPLATE_SELECT = `
  id,
  name,
  cycle_label,
  review_type,
  status,
  questions,
  created_at
`;

function normalizePerformanceTemplate(row: PerformanceTemplateRow) {
  return {
    id: row.id,
    name: row.name,
    cycleLabel: row.cycle_label,
    reviewType: row.review_type,
    status: row.status,
    questions: row.questions,
    createdAt: row.created_at,
  };
}

export async function listPerformanceTemplates(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("performance_review_templates")
    .select(PERFORMANCE_TEMPLATE_SELECT)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load performance review templates.", error.message);
  }

  return ((data as PerformanceTemplateRow[] | null) ?? []).map((row) =>
    normalizePerformanceTemplate(row),
  );
}

export async function getPerformanceTemplateById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  templateId: string,
) {
  const { data, error } = await supabase
    .from("performance_review_templates")
    .select(PERFORMANCE_TEMPLATE_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the performance review template.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Performance review template not found.");
  }

  return normalizePerformanceTemplate(data as PerformanceTemplateRow);
}

export async function createPerformanceTemplate(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<PerformanceTemplateInput, "name" | "cycleLabel" | "reviewType" | "questions">> &
    PerformanceTemplateInput,
) {
  const { data, error } = await supabase
    .from("performance_review_templates")
    .insert({
      organization_id: organizationId,
      name: input.name,
      cycle_label: input.cycleLabel,
      review_type: input.reviewType,
      status: input.status ?? "Active",
      questions: input.questions,
    })
    .select(PERFORMANCE_TEMPLATE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the performance review template.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Performance review template creation did not return a record.");
  }

  return normalizePerformanceTemplate(data as PerformanceTemplateRow);
}

export async function updatePerformanceTemplate(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  templateId: string,
  input: PerformanceTemplateInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      cycle_label: input.cycleLabel,
      review_type: input.reviewType,
      status: input.status,
      questions: input.questions,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one performance review template field must be provided.");
  }

  const { data, error } = await supabase
    .from("performance_review_templates")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", templateId)
    .select(PERFORMANCE_TEMPLATE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the performance review template.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Performance review template not found.");
  }

  return normalizePerformanceTemplate(data as PerformanceTemplateRow);
}

export async function deletePerformanceTemplate(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  templateId: string,
) {
  const { error } = await supabase
    .from("performance_review_templates")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", templateId);

  if (error) {
    throw new ApiError(500, "Failed to delete the performance review template.", error.message);
  }
}
