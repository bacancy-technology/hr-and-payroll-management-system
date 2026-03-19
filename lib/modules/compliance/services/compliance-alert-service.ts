import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface ComplianceAlertFilters {
  status?: string;
  severity?: string;
  ruleId?: string;
}

interface ComplianceAlertInput {
  ruleId?: string;
  severity?: string;
  title?: string;
  message?: string;
  status?: string;
  dueDate?: string;
}

interface ComplianceAlertRow {
  id: string;
  rule_id: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  due_date: string;
  created_at: string;
  compliance_rules:
    | {
        id: string;
        name: string;
        jurisdiction: string;
        category: string;
        deadline_date: string;
        status: string;
      }
    | {
        id: string;
        name: string;
        jurisdiction: string;
        category: string;
        deadline_date: string;
        status: string;
      }[]
    | null;
}

const COMPLIANCE_ALERT_SELECT = `
  id,
  rule_id,
  severity,
  title,
  message,
  status,
  due_date,
  created_at,
  compliance_rules (
    id,
    name,
    jurisdiction,
    category,
    deadline_date,
    status
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeComplianceAlert(row: ComplianceAlertRow) {
  return {
    id: row.id,
    ruleId: row.rule_id,
    severity: row.severity,
    title: row.title,
    message: row.message,
    status: row.status,
    dueDate: row.due_date,
    createdAt: row.created_at,
    rule: normalizeRelation(row.compliance_rules),
  };
}

async function ensureComplianceRuleExists(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  ruleId: string,
) {
  const { data, error } = await supabase
    .from("compliance_rules")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", ruleId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to validate the compliance rule reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compliance rule not found.");
  }
}

export async function listComplianceAlerts(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: ComplianceAlertFilters = {},
) {
  let query = supabase
    .from("compliance_alerts")
    .select(COMPLIANCE_ALERT_SELECT)
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.severity) {
    query = query.eq("severity", filters.severity);
  }

  if (filters.ruleId) {
    query = query.eq("rule_id", filters.ruleId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load compliance alerts.", error.message);
  }

  return ((data as ComplianceAlertRow[] | null) ?? []).map((row) => normalizeComplianceAlert(row));
}

export async function getComplianceAlertById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  alertId: string,
) {
  const { data, error } = await supabase
    .from("compliance_alerts")
    .select(COMPLIANCE_ALERT_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", alertId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the compliance alert.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compliance alert not found.");
  }

  return normalizeComplianceAlert(data as ComplianceAlertRow);
}

export async function createComplianceAlert(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<ComplianceAlertInput, "ruleId" | "severity" | "title" | "message" | "dueDate">> &
    ComplianceAlertInput,
) {
  await ensureComplianceRuleExists(supabase, organizationId, input.ruleId);

  const { data, error } = await supabase
    .from("compliance_alerts")
    .insert({
      organization_id: organizationId,
      rule_id: input.ruleId,
      severity: input.severity,
      title: input.title,
      message: input.message,
      status: input.status ?? "Open",
      due_date: input.dueDate,
    })
    .select(COMPLIANCE_ALERT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the compliance alert.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Compliance alert creation did not return a record.");
  }

  return normalizeComplianceAlert(data as ComplianceAlertRow);
}

export async function updateComplianceAlert(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  alertId: string,
  input: ComplianceAlertInput,
) {
  if (input.ruleId) {
    await ensureComplianceRuleExists(supabase, organizationId, input.ruleId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      rule_id: input.ruleId,
      severity: input.severity,
      title: input.title,
      message: input.message,
      status: input.status,
      due_date: input.dueDate,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one compliance alert field must be provided.");
  }

  const { data, error } = await supabase
    .from("compliance_alerts")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", alertId)
    .select(COMPLIANCE_ALERT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the compliance alert.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Compliance alert not found.");
  }

  return normalizeComplianceAlert(data as ComplianceAlertRow);
}

export async function deleteComplianceAlert(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  alertId: string,
) {
  const { error } = await supabase
    .from("compliance_alerts")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", alertId);

  if (error) {
    throw new ApiError(500, "Failed to delete the compliance alert.", error.message);
  }
}
