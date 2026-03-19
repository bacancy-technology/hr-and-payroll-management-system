import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import {
  getEmployeeSummaryInOrganization,
  getWorkersCompPolicySummaryInOrganization,
} from "@/lib/modules/shared/services/org-reference-service";

interface WorkersCompClaimFilters {
  employeeId?: string;
  policyId?: string;
  status?: string;
}

interface WorkersCompClaimInput {
  employeeId?: string;
  policyId?: string;
  incidentDate?: string;
  reportedDate?: string;
  claimNumber?: string | null;
  claimType?: string;
  status?: string;
  description?: string | null;
  amountReserved?: number;
  amountPaid?: number;
  caseManagerName?: string | null;
  caseManagerEmail?: string | null;
}

interface WorkersCompClaimRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  policy_id: string | null;
  policy_name: string;
  incident_date: string;
  reported_date: string;
  claim_number: string | null;
  claim_type: string;
  status: string;
  description: string | null;
  amount_reserved: number;
  amount_paid: number;
  case_manager_name: string | null;
  case_manager_email: string | null;
  created_at: string;
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
  workers_comp_policies:
    | {
        id: string;
        policy_name: string;
        carrier_name: string;
        status: string;
      }
    | {
        id: string;
        policy_name: string;
        carrier_name: string;
        status: string;
      }[]
    | null;
}

const WORKERS_COMP_CLAIM_SELECT = `
  id,
  employee_id,
  employee_name,
  policy_id,
  policy_name,
  incident_date,
  reported_date,
  claim_number,
  claim_type,
  status,
  description,
  amount_reserved,
  amount_paid,
  case_manager_name,
  case_manager_email,
  created_at,
  employees (
    id,
    full_name,
    email
  ),
  workers_comp_policies (
    id,
    policy_name,
    carrier_name,
    status
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeWorkersCompClaim(row: WorkersCompClaimRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    policyId: row.policy_id,
    policyName: row.policy_name,
    incidentDate: row.incident_date,
    reportedDate: row.reported_date,
    claimNumber: row.claim_number,
    claimType: row.claim_type,
    status: row.status,
    description: row.description,
    amountReserved: row.amount_reserved,
    amountPaid: row.amount_paid,
    caseManagerName: row.case_manager_name,
    caseManagerEmail: row.case_manager_email,
    createdAt: row.created_at,
    employee: normalizeRelation(row.employees),
    policy: normalizeRelation(row.workers_comp_policies),
  };
}

export async function listWorkersCompClaims(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: WorkersCompClaimFilters = {},
) {
  let query = supabase
    .from("workers_comp_claims")
    .select(WORKERS_COMP_CLAIM_SELECT)
    .eq("organization_id", organizationId)
    .order("reported_date", { ascending: false });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.policyId) {
    query = query.eq("policy_id", filters.policyId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load workers comp claims.", error.message);
  }

  return ((data as WorkersCompClaimRow[] | null) ?? []).map((row) => normalizeWorkersCompClaim(row));
}

export async function getWorkersCompClaimById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  claimId: string,
) {
  const { data, error } = await supabase
    .from("workers_comp_claims")
    .select(WORKERS_COMP_CLAIM_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", claimId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the workers comp claim.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Workers comp claim not found.");
  }

  return normalizeWorkersCompClaim(data as WorkersCompClaimRow);
}

export async function createWorkersCompClaim(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<WorkersCompClaimInput, "employeeId" | "policyId" | "incidentDate" | "reportedDate" | "claimType">
  > &
    WorkersCompClaimInput,
) {
  const [employee, policy] = await Promise.all([
    getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId),
    getWorkersCompPolicySummaryInOrganization(supabase, organizationId, input.policyId),
  ]);

  const { data, error } = await supabase
    .from("workers_comp_claims")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      policy_id: policy.id,
      policy_name: policy.policy_name,
      incident_date: input.incidentDate,
      reported_date: input.reportedDate,
      claim_number: input.claimNumber ?? null,
      claim_type: input.claimType,
      status: input.status ?? "Open",
      description: input.description ?? null,
      amount_reserved: input.amountReserved ?? 0,
      amount_paid: input.amountPaid ?? 0,
      case_manager_name: input.caseManagerName ?? null,
      case_manager_email: input.caseManagerEmail ?? null,
    })
    .select(WORKERS_COMP_CLAIM_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the workers comp claim.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Workers comp claim creation did not return a record.");
  }

  return normalizeWorkersCompClaim(data as WorkersCompClaimRow);
}

export async function updateWorkersCompClaim(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  claimId: string,
  input: WorkersCompClaimInput,
) {
  const current = await getWorkersCompClaimById(supabase, organizationId, claimId);
  let employeeId = input.employeeId ?? current.employeeId;
  let employeeName = current.employeeName;
  let policyId = input.policyId ?? current.policyId;
  let policyName = current.policyName;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
    employeeName = employee.full_name;
  }

  if (policyId) {
    const policy = await getWorkersCompPolicySummaryInOrganization(supabase, organizationId, policyId);
    policyId = policy.id;
    policyName = policy.policy_name;
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: employeeId,
      employee_name: employeeName,
      policy_id: policyId,
      policy_name: policyName,
      incident_date: input.incidentDate,
      reported_date: input.reportedDate,
      claim_number: input.claimNumber,
      claim_type: input.claimType,
      status: input.status,
      description: input.description,
      amount_reserved: input.amountReserved,
      amount_paid: input.amountPaid,
      case_manager_name: input.caseManagerName,
      case_manager_email: input.caseManagerEmail,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one workers comp claim field must be provided.");
  }

  const { data, error } = await supabase
    .from("workers_comp_claims")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", claimId)
    .select(WORKERS_COMP_CLAIM_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the workers comp claim.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Workers comp claim not found.");
  }

  return normalizeWorkersCompClaim(data as WorkersCompClaimRow);
}

export async function deleteWorkersCompClaim(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  claimId: string,
) {
  const { error } = await supabase
    .from("workers_comp_claims")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", claimId);

  if (error) {
    throw new ApiError(500, "Failed to delete the workers comp claim.", error.message);
  }
}
