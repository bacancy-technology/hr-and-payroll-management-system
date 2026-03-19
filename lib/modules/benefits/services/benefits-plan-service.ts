import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface BenefitsPlanInput {
  name?: string;
  providerName?: string;
  category?: string;
  coverageLevel?: string;
  employeeCost?: number;
  employerCost?: number;
  status?: string;
}

interface BenefitsPlanRow {
  id: string;
  name: string;
  provider_name: string;
  category: string;
  coverage_level: string;
  employee_cost: number;
  employer_cost: number;
  status: string;
  created_at: string;
}

const BENEFITS_PLAN_SELECT = `
  id,
  name,
  provider_name,
  category,
  coverage_level,
  employee_cost,
  employer_cost,
  status,
  created_at
`;

function normalizeBenefitsPlan(row: BenefitsPlanRow) {
  return {
    id: row.id,
    name: row.name,
    providerName: row.provider_name,
    category: row.category,
    coverageLevel: row.coverage_level,
    employeeCost: row.employee_cost,
    employerCost: row.employer_cost,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listBenefitsPlans(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("benefits_plans")
    .select(BENEFITS_PLAN_SELECT)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load benefits plans.", error.message);
  }

  return ((data as BenefitsPlanRow[] | null) ?? []).map((row) => normalizeBenefitsPlan(row));
}

export async function getBenefitsPlanById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  planId: string,
) {
  const { data, error } = await supabase
    .from("benefits_plans")
    .select(BENEFITS_PLAN_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", planId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the benefits plan.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Benefits plan not found.");
  }

  return normalizeBenefitsPlan(data as BenefitsPlanRow);
}

export async function createBenefitsPlan(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<
      BenefitsPlanInput,
      "name" | "providerName" | "category" | "coverageLevel" | "employeeCost" | "employerCost"
    >
  > &
    BenefitsPlanInput,
) {
  const { data, error } = await supabase
    .from("benefits_plans")
    .insert({
      organization_id: organizationId,
      name: input.name,
      provider_name: input.providerName,
      category: input.category,
      coverage_level: input.coverageLevel,
      employee_cost: input.employeeCost,
      employer_cost: input.employerCost,
      status: input.status ?? "Active",
    })
    .select(BENEFITS_PLAN_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the benefits plan.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Benefits plan creation did not return a record.");
  }

  return normalizeBenefitsPlan(data as BenefitsPlanRow);
}

export async function updateBenefitsPlan(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  planId: string,
  input: BenefitsPlanInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      provider_name: input.providerName,
      category: input.category,
      coverage_level: input.coverageLevel,
      employee_cost: input.employeeCost,
      employer_cost: input.employerCost,
      status: input.status,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one benefits plan field must be provided.");
  }

  const { data, error } = await supabase
    .from("benefits_plans")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", planId)
    .select(BENEFITS_PLAN_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the benefits plan.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Benefits plan not found.");
  }

  return normalizeBenefitsPlan(data as BenefitsPlanRow);
}

export async function deleteBenefitsPlan(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  planId: string,
) {
  const { error } = await supabase
    .from("benefits_plans")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", planId);

  if (error) {
    throw new ApiError(500, "Failed to delete the benefits plan.", error.message);
  }
}
