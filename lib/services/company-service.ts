import { ApiError } from "@/lib/api/errors";
import type { AuthenticatedSupabaseClient } from "@/lib/api/context";

interface CompanyInput {
  name?: string;
  industry?: string;
  headquarters?: string;
}

export async function getCompanyByOrganizationId(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, industry, headquarters, created_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load company details.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Company not found.");
  }

  return data;
}

export async function updateCompanyByOrganizationId(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: CompanyInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      industry: input.industry,
      headquarters: input.headquarters,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one company field must be provided.");
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(payload)
    .eq("id", organizationId)
    .select("id, name, industry, headquarters, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update company details.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Company not found.");
  }

  return data;
}
