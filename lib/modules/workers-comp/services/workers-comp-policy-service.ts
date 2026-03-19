import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface WorkersCompPolicyFilters {
  status?: string;
}

interface WorkersCompPolicyInput {
  policyName?: string;
  carrierName?: string;
  policyNumber?: string;
  coverageStartDate?: string;
  coverageEndDate?: string;
  status?: string;
  statesCovered?: string[];
  premiumAmount?: number;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
}

interface WorkersCompPolicyRow {
  id: string;
  policy_name: string;
  carrier_name: string;
  policy_number: string;
  coverage_start_date: string;
  coverage_end_date: string;
  status: string;
  states_covered: string[] | null;
  premium_amount: number;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
}

const WORKERS_COMP_POLICY_SELECT = `
  id,
  policy_name,
  carrier_name,
  policy_number,
  coverage_start_date,
  coverage_end_date,
  status,
  states_covered,
  premium_amount,
  contact_name,
  contact_email,
  notes,
  created_at
`;

function normalizeWorkersCompPolicy(row: WorkersCompPolicyRow) {
  return {
    id: row.id,
    policyName: row.policy_name,
    carrierName: row.carrier_name,
    policyNumber: row.policy_number,
    coverageStartDate: row.coverage_start_date,
    coverageEndDate: row.coverage_end_date,
    status: row.status,
    statesCovered: row.states_covered ?? [],
    premiumAmount: row.premium_amount,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function buildWorkersCompPolicyPayload(input: WorkersCompPolicyInput) {
  return Object.fromEntries(
    Object.entries({
      policy_name: input.policyName,
      carrier_name: input.carrierName,
      policy_number: input.policyNumber,
      coverage_start_date: input.coverageStartDate,
      coverage_end_date: input.coverageEndDate,
      status: input.status,
      states_covered: input.statesCovered,
      premium_amount: input.premiumAmount,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );
}

export async function listWorkersCompPolicies(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: WorkersCompPolicyFilters = {},
) {
  let query = supabase
    .from("workers_comp_policies")
    .select(WORKERS_COMP_POLICY_SELECT)
    .eq("organization_id", organizationId)
    .order("coverage_end_date", { ascending: true });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load workers comp policies.", error.message);
  }

  return ((data as WorkersCompPolicyRow[] | null) ?? []).map((row) =>
    normalizeWorkersCompPolicy(row),
  );
}

export async function getWorkersCompPolicyById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  policyId: string,
) {
  const { data, error } = await supabase
    .from("workers_comp_policies")
    .select(WORKERS_COMP_POLICY_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", policyId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the workers comp policy.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Workers comp policy not found.");
  }

  return normalizeWorkersCompPolicy(data as WorkersCompPolicyRow);
}

export async function createWorkersCompPolicy(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<
      WorkersCompPolicyInput,
      | "policyName"
      | "carrierName"
      | "policyNumber"
      | "coverageStartDate"
      | "coverageEndDate"
      | "premiumAmount"
      | "statesCovered"
    >
  > &
    WorkersCompPolicyInput,
) {
  const { data, error } = await supabase
    .from("workers_comp_policies")
    .insert({
      organization_id: organizationId,
      ...buildWorkersCompPolicyPayload({
        ...input,
        status: input.status ?? "Active",
        contactName: input.contactName ?? null,
        contactEmail: input.contactEmail ?? null,
        notes: input.notes ?? null,
      }),
    })
    .select(WORKERS_COMP_POLICY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the workers comp policy.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Workers comp policy creation did not return a record.");
  }

  return normalizeWorkersCompPolicy(data as WorkersCompPolicyRow);
}

export async function updateWorkersCompPolicy(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  policyId: string,
  input: WorkersCompPolicyInput,
) {
  const payload = buildWorkersCompPolicyPayload(input);

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one workers comp policy field must be provided.");
  }

  const { data, error } = await supabase
    .from("workers_comp_policies")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", policyId)
    .select(WORKERS_COMP_POLICY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the workers comp policy.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Workers comp policy not found.");
  }

  return normalizeWorkersCompPolicy(data as WorkersCompPolicyRow);
}

export async function deleteWorkersCompPolicy(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  policyId: string,
) {
  const { error } = await supabase
    .from("workers_comp_policies")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", policyId);

  if (error) {
    throw new ApiError(500, "Failed to delete the workers comp policy.", error.message);
  }
}
