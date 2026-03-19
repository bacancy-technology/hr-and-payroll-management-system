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
