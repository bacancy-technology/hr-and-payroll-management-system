import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface ComplianceRuleInput {
  name?: string;
  jurisdiction?: string;
  category?: string;
  deadlineDate?: string;
  status?: string;
  notes?: string | null;
}

interface ComplianceRuleRow {
  id: string;
  name: string;
  jurisdiction: string;
  category: string;
  deadline_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const COMPLIANCE_RULE_SELECT = `
  id,
  name,
  jurisdiction,
  category,
  deadline_date,
  status,
  notes,
  created_at
`;

function normalizeComplianceRule(row: ComplianceRuleRow) {
  return {
    id: row.id,
    name: row.name,
    jurisdiction: row.jurisdiction,
    category: row.category,
    deadlineDate: row.deadline_date,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listComplianceRules(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("compliance_rules")
    .select(COMPLIANCE_RULE_SELECT)
    .eq("organization_id", organizationId)
    .order("deadline_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load compliance rules.", error.message);
  }

  return ((data as ComplianceRuleRow[] | null) ?? []).map((row) => normalizeComplianceRule(row));
}

export async function getComplianceRuleById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  ruleId: string,
) {
  const { data, error } = await supabase
    .from("compliance_rules")
    .select(COMPLIANCE_RULE_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", ruleId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the compliance rule.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compliance rule not found.");
  }

  return normalizeComplianceRule(data as ComplianceRuleRow);
}

export async function createComplianceRule(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<ComplianceRuleInput, "name" | "jurisdiction" | "category" | "deadlineDate">> &
    ComplianceRuleInput,
) {
  const { data, error } = await supabase
    .from("compliance_rules")
    .insert({
      organization_id: organizationId,
      name: input.name,
      jurisdiction: input.jurisdiction,
      category: input.category,
      deadline_date: input.deadlineDate,
      status: input.status ?? "Open",
      notes: input.notes ?? null,
    })
    .select(COMPLIANCE_RULE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the compliance rule.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Compliance rule creation did not return a record.");
  }

  return normalizeComplianceRule(data as ComplianceRuleRow);
}

export async function updateComplianceRule(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  ruleId: string,
  input: ComplianceRuleInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      jurisdiction: input.jurisdiction,
      category: input.category,
      deadline_date: input.deadlineDate,
      status: input.status,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one compliance rule field must be provided.");
  }

  const { data, error } = await supabase
    .from("compliance_rules")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", ruleId)
    .select(COMPLIANCE_RULE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the compliance rule.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compliance rule not found.");
  }

  return normalizeComplianceRule(data as ComplianceRuleRow);
}

export async function deleteComplianceRule(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  ruleId: string,
) {
  const { error } = await supabase
    .from("compliance_rules")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", ruleId);

  if (error) {
    throw new ApiError(500, "Failed to delete the compliance rule.", error.message);
  }
}
