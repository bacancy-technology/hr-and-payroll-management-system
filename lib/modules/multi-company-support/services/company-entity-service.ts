import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface CompanyEntityFilters {
  status?: string;
  registrationState?: string;
  entityType?: string;
}

interface CompanyEntityInput {
  name?: string;
  legalName?: string;
  entityType?: string;
  taxId?: string | null;
  registrationState?: string;
  headquarters?: string;
  payrollFrequency?: string;
  employeeCount?: number;
  status?: string;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
}

interface CompanyEntityRow {
  id: string;
  name: string;
  legal_name: string;
  entity_type: string;
  tax_id: string | null;
  registration_state: string;
  headquarters: string;
  payroll_frequency: string;
  employee_count: number;
  status: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  created_at: string;
}

const COMPANY_ENTITY_SELECT = `
  id,
  name,
  legal_name,
  entity_type,
  tax_id,
  registration_state,
  headquarters,
  payroll_frequency,
  employee_count,
  status,
  primary_contact_name,
  primary_contact_email,
  created_at
`;

function normalizeCompanyEntity(row: CompanyEntityRow) {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legal_name,
    entityType: row.entity_type,
    taxId: row.tax_id,
    registrationState: row.registration_state,
    headquarters: row.headquarters,
    payrollFrequency: row.payroll_frequency,
    employeeCount: row.employee_count,
    status: row.status,
    primaryContactName: row.primary_contact_name,
    primaryContactEmail: row.primary_contact_email,
    createdAt: row.created_at,
  };
}

function buildCompanyEntityPayload(input: CompanyEntityInput) {
  return Object.fromEntries(
    Object.entries({
      name: input.name,
      legal_name: input.legalName,
      entity_type: input.entityType,
      tax_id: input.taxId,
      registration_state: input.registrationState,
      headquarters: input.headquarters,
      payroll_frequency: input.payrollFrequency,
      employee_count: input.employeeCount,
      status: input.status,
      primary_contact_name: input.primaryContactName,
      primary_contact_email: input.primaryContactEmail,
    }).filter(([, value]) => value !== undefined),
  );
}

export async function listCompanyEntities(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: CompanyEntityFilters = {},
) {
  let query = supabase
    .from("company_entities")
    .select(COMPANY_ENTITY_SELECT)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.registrationState) {
    query = query.eq("registration_state", filters.registrationState);
  }

  if (filters.entityType) {
    query = query.eq("entity_type", filters.entityType);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load company entities.", error.message);
  }

  return ((data as CompanyEntityRow[] | null) ?? []).map((row) => normalizeCompanyEntity(row));
}

export async function getCompanyEntityById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  entityId: string,
) {
  const { data, error } = await supabase
    .from("company_entities")
    .select(COMPANY_ENTITY_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", entityId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the company entity.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Company entity not found.");
  }

  return normalizeCompanyEntity(data as CompanyEntityRow);
}

export async function createCompanyEntity(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<
      CompanyEntityInput,
      | "name"
      | "legalName"
      | "entityType"
      | "registrationState"
      | "headquarters"
      | "payrollFrequency"
      | "employeeCount"
    >
  > &
    CompanyEntityInput,
) {
  const { data, error } = await supabase
    .from("company_entities")
    .insert({
      organization_id: organizationId,
      ...buildCompanyEntityPayload({
        ...input,
        taxId: input.taxId ?? null,
        status: input.status ?? "Active",
        primaryContactName: input.primaryContactName ?? null,
        primaryContactEmail: input.primaryContactEmail ?? null,
      }),
    })
    .select(COMPANY_ENTITY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the company entity.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Company entity creation did not return a record.");
  }

  return normalizeCompanyEntity(data as CompanyEntityRow);
}

export async function updateCompanyEntity(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  entityId: string,
  input: CompanyEntityInput,
) {
  const payload = buildCompanyEntityPayload(input);

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one company entity field must be provided.");
  }

  const { data, error } = await supabase
    .from("company_entities")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", entityId)
    .select(COMPANY_ENTITY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the company entity.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Company entity not found.");
  }

  return normalizeCompanyEntity(data as CompanyEntityRow);
}

export async function deleteCompanyEntity(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  entityId: string,
) {
  const { error } = await supabase
    .from("company_entities")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", entityId);

  if (error) {
    throw new ApiError(500, "Failed to delete the company entity.", error.message);
  }
}

export async function getMultiCompanySupportOverview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: CompanyEntityFilters = {},
) {
  const entities = await listCompanyEntities(supabase, organizationId, filters);

  return {
    summary: {
      totalEntities: entities.length,
      activeEntities: entities.filter((entity) => entity.status === "Active").length,
      totalEmployees: entities.reduce((sum, entity) => sum + entity.employeeCount, 0),
      statesCovered: [...new Set(entities.map((entity) => entity.registrationState))].length,
    },
    entities,
  };
}
