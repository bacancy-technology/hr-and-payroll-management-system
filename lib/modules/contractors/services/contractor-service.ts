import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface ContractorInput {
  fullName?: string;
  email?: string;
  specialization?: string;
  status?: string;
  location?: string;
  paymentType?: string;
  hourlyRate?: number;
  flatRate?: number;
  taxClassification?: string;
  contractStartDate?: string;
  contractEndDate?: string | null;
  managerName?: string;
}

interface ContractorRow {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  status: string;
  location: string;
  payment_type: string;
  hourly_rate: number;
  flat_rate: number;
  tax_classification: string;
  contract_start_date: string;
  contract_end_date: string | null;
  manager_name: string;
  created_at: string;
}

const CONTRACTOR_SELECT = `
  id,
  full_name,
  email,
  specialization,
  status,
  location,
  payment_type,
  hourly_rate,
  flat_rate,
  tax_classification,
  contract_start_date,
  contract_end_date,
  manager_name,
  created_at
`;

function normalizeContractor(row: ContractorRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    specialization: row.specialization,
    status: row.status,
    location: row.location,
    paymentType: row.payment_type,
    hourlyRate: row.hourly_rate,
    flatRate: row.flat_rate,
    taxClassification: row.tax_classification,
    contractStartDate: row.contract_start_date,
    contractEndDate: row.contract_end_date,
    managerName: row.manager_name,
    createdAt: row.created_at,
  };
}

function validateContractDateRange(contractStartDate: string, contractEndDate?: string | null) {
  if (contractEndDate && new Date(contractEndDate).getTime() < new Date(contractStartDate).getTime()) {
    throw new ApiError(400, "Contract end date must be on or after contract start date.");
  }
}

export async function listContractors(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("contractors")
    .select(CONTRACTOR_SELECT)
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load contractors.", error.message);
  }

  return ((data as ContractorRow[] | null) ?? []).map((row) => normalizeContractor(row));
}

export async function getContractorById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  contractorId: string,
) {
  const { data, error } = await supabase
    .from("contractors")
    .select(CONTRACTOR_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", contractorId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the contractor.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Contractor not found.");
  }

  return normalizeContractor(data as ContractorRow);
}

export async function createContractor(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<
      ContractorInput,
      | "fullName"
      | "email"
      | "specialization"
      | "status"
      | "location"
      | "paymentType"
      | "hourlyRate"
      | "flatRate"
      | "taxClassification"
      | "contractStartDate"
      | "managerName"
    >
  > &
    ContractorInput,
) {
  validateContractDateRange(input.contractStartDate, input.contractEndDate);

  const { data, error } = await supabase
    .from("contractors")
    .insert({
      organization_id: organizationId,
      full_name: input.fullName,
      email: input.email,
      specialization: input.specialization,
      status: input.status,
      location: input.location,
      payment_type: input.paymentType,
      hourly_rate: input.hourlyRate,
      flat_rate: input.flatRate,
      tax_classification: input.taxClassification,
      contract_start_date: input.contractStartDate,
      contract_end_date: input.contractEndDate ?? null,
      manager_name: input.managerName,
    })
    .select(CONTRACTOR_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the contractor.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Contractor creation did not return a record.");
  }

  return normalizeContractor(data as ContractorRow);
}

export async function updateContractor(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  contractorId: string,
  input: ContractorInput,
) {
  const current = await getContractorById(supabase, organizationId, contractorId);
  const nextContractStartDate = input.contractStartDate ?? current.contractStartDate;
  const nextContractEndDate =
    input.contractEndDate === undefined ? current.contractEndDate : input.contractEndDate;

  validateContractDateRange(nextContractStartDate, nextContractEndDate);

  const payload = Object.fromEntries(
    Object.entries({
      full_name: input.fullName,
      email: input.email,
      specialization: input.specialization,
      status: input.status,
      location: input.location,
      payment_type: input.paymentType,
      hourly_rate: input.hourlyRate,
      flat_rate: input.flatRate,
      tax_classification: input.taxClassification,
      contract_start_date: input.contractStartDate,
      contract_end_date: input.contractEndDate,
      manager_name: input.managerName,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one contractor field must be provided.");
  }

  const { data, error } = await supabase
    .from("contractors")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", contractorId)
    .select(CONTRACTOR_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the contractor.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Contractor not found.");
  }

  return normalizeContractor(data as ContractorRow);
}

export async function deleteContractor(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  contractorId: string,
) {
  const { error } = await supabase
    .from("contractors")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", contractorId);

  if (error) {
    throw new ApiError(500, "Failed to delete the contractor.", error.message);
  }
}
