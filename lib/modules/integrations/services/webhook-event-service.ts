import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getIntegrationSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

type JsonRecord = Record<string, unknown>;

interface WebhookEventFilters {
  provider?: string;
  integrationId?: string;
  deliveryStatus?: string;
}

interface WebhookEventInput {
  integrationId?: string;
  eventType?: string;
  deliveryStatus?: string;
  externalEventId?: string | null;
  payload?: JsonRecord;
  processedAt?: string | null;
  errorMessage?: string | null;
}

interface WebhookEventRow {
  id: string;
  integration_id: string | null;
  provider: string;
  event_type: string;
  delivery_status: string;
  external_event_id: string | null;
  payload: JsonRecord;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
  integrations:
    | {
        id: string;
        provider: string;
        display_name: string;
      }
    | {
        id: string;
        provider: string;
        display_name: string;
      }[]
    | null;
}

const WEBHOOK_EVENT_SELECT = `
  id,
  integration_id,
  provider,
  event_type,
  delivery_status,
  external_event_id,
  payload,
  processed_at,
  error_message,
  created_at,
  integrations (
    id,
    provider,
    display_name
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeWebhookEvent(row: WebhookEventRow) {
  return {
    id: row.id,
    integrationId: row.integration_id,
    provider: row.provider,
    eventType: row.event_type,
    deliveryStatus: row.delivery_status,
    externalEventId: row.external_event_id,
    payload: row.payload ?? {},
    processedAt: row.processed_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    integration: normalizeRelation(row.integrations),
  };
}

export async function listWebhookEvents(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: WebhookEventFilters = {},
) {
  let query = supabase
    .from("webhook_events")
    .select(WEBHOOK_EVENT_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.provider) {
    query = query.eq("provider", filters.provider);
  }

  if (filters.integrationId) {
    query = query.eq("integration_id", filters.integrationId);
  }

  if (filters.deliveryStatus) {
    query = query.eq("delivery_status", filters.deliveryStatus);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load webhook events.", error.message);
  }

  return ((data as WebhookEventRow[] | null) ?? []).map((row) => normalizeWebhookEvent(row));
}

export async function createWebhookEvent(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  provider: string,
  input: Required<Pick<WebhookEventInput, "eventType" | "payload">> & WebhookEventInput,
) {
  let integrationId: string | null = null;

  if (input.integrationId) {
    const integration = await getIntegrationSummaryInOrganization(supabase, organizationId, input.integrationId);
    integrationId = integration.id;
  }

  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      organization_id: organizationId,
      integration_id: integrationId,
      provider,
      event_type: input.eventType,
      delivery_status: input.deliveryStatus ?? "Received",
      external_event_id: input.externalEventId ?? null,
      payload: input.payload,
      processed_at: input.processedAt ?? null,
      error_message: input.errorMessage ?? null,
    })
    .select(WEBHOOK_EVENT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to record the webhook event.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Webhook event creation did not return a record.");
  }

  return normalizeWebhookEvent(data as WebhookEventRow);
}
