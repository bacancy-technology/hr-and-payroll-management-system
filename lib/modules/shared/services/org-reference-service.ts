import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

export async function ensureEmployeeExistsInOrganization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the employee reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Employee not found.");
  }
}

export async function getEmployeeSummaryInOrganization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, email")
    .eq("organization_id", organizationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the employee reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Employee not found.");
  }

  return data;
}

export async function ensurePayPeriodExistsInOrganization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  payPeriodId: string,
) {
  const { data, error } = await supabase
    .from("pay_periods")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", payPeriodId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the pay period reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Pay period not found.");
  }
}

export async function getWorkersCompPolicySummaryInOrganization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  policyId: string,
) {
  const { data, error } = await supabase
    .from("workers_comp_policies")
    .select("id, policy_name")
    .eq("organization_id", organizationId)
    .eq("id", policyId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the workers comp policy reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Workers comp policy not found.");
  }

  return data;
}

export async function getIntegrationSummaryInOrganization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  integrationId: string,
) {
  const { data, error } = await supabase
    .from("integrations")
    .select("id, provider, display_name")
    .eq("organization_id", organizationId)
    .eq("id", integrationId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the integration reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Integration not found.");
  }

  return data;
}
