import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getIntegrationSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface IntegrationSyncFilters {
  integrationId?: string;
  status?: string;
  triggerSource?: string;
}

interface IntegrationSyncRow {
  id: string;
  integration_id: string;
  trigger_source: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  records_processed: number;
  summary: string | null;
  created_at: string;
  integrations:
    | {
        id: string;
        provider: string;
        display_name: string;
        status: string;
      }
    | {
        id: string;
        provider: string;
        display_name: string;
        status: string;
      }[]
    | null;
}

const INTEGRATION_SYNC_SELECT = `
  id,
  integration_id,
  trigger_source,
  status,
  started_at,
  completed_at,
  records_processed,
  summary,
  created_at,
  integrations (
    id,
    provider,
    display_name,
    status
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeIntegrationSync(row: IntegrationSyncRow) {
  return {
    id: row.id,
    integrationId: row.integration_id,
    triggerSource: row.trigger_source,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    recordsProcessed: row.records_processed,
    summary: row.summary,
    createdAt: row.created_at,
    integration: normalizeRelation(row.integrations),
  };
}

export async function listIntegrationSyncRuns(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: IntegrationSyncFilters = {},
) {
  let query = supabase
    .from("integration_sync_runs")
    .select(INTEGRATION_SYNC_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.integrationId) {
    query = query.eq("integration_id", filters.integrationId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.triggerSource) {
    query = query.eq("trigger_source", filters.triggerSource);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load integration sync runs.", error.message);
  }

  return ((data as IntegrationSyncRow[] | null) ?? []).map((row) => normalizeIntegrationSync(row));
}

export async function runIntegrationSync(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  integrationId: string,
  input: {
    triggerSource?: string;
    recordsProcessed?: number;
    summary?: string | null;
  } = {},
) {
  const integration = await getIntegrationSummaryInOrganization(supabase, organizationId, integrationId);
  const startedAt = new Date().toISOString();
  const completedAt = new Date().toISOString();
  const recordsProcessed = input.recordsProcessed ?? 0;
  const summary =
    input.summary ?? `Sync completed for ${integration.display_name} (${integration.provider}).`;

  const { data, error } = await supabase
    .from("integration_sync_runs")
    .insert({
      organization_id: organizationId,
      integration_id: integration.id,
      trigger_source: input.triggerSource ?? "manual",
      status: "Completed",
      started_at: startedAt,
      completed_at: completedAt,
      records_processed: recordsProcessed,
      summary,
    })
    .select(INTEGRATION_SYNC_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the integration sync run.", error.message);
  }

  const { error: integrationUpdateError } = await supabase
    .from("integrations")
    .update({
      status: "Connected",
      last_synced_at: completedAt,
    })
    .eq("organization_id", organizationId)
    .eq("id", integration.id);

  if (integrationUpdateError) {
    throw new ApiError(500, "Failed to update the integration sync timestamp.", integrationUpdateError.message);
  }

  if (!data) {
    throw new ApiError(500, "Integration sync run creation did not return a record.");
  }

  return normalizeIntegrationSync(data as IntegrationSyncRow);
}
