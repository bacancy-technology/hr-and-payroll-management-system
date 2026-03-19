import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

type JsonRecord = Record<string, unknown>;

interface IntegrationFilters {
  provider?: string;
  status?: string;
  category?: string;
}

interface IntegrationInput {
  provider?: string;
  displayName?: string;
  category?: string;
  status?: string;
  connectionMode?: string;
  scopes?: string[];
  config?: JsonRecord;
  externalAccountId?: string | null;
  webhookSecretHint?: string | null;
  lastSyncedAt?: string | null;
}

interface IntegrationRow {
  id: string;
  provider: string;
  display_name: string;
  category: string;
  status: string;
  connection_mode: string;
  scopes: string[];
  config: JsonRecord;
  external_account_id: string | null;
  webhook_secret_hint: string | null;
  last_synced_at: string | null;
  created_at: string;
}

const INTEGRATION_SELECT = `
  id,
  provider,
  display_name,
  category,
  status,
  connection_mode,
  scopes,
  config,
  external_account_id,
  webhook_secret_hint,
  last_synced_at,
  created_at
`;

function normalizeIntegration(row: IntegrationRow) {
  return {
    id: row.id,
    provider: row.provider,
    displayName: row.display_name,
    category: row.category,
    status: row.status,
    connectionMode: row.connection_mode,
    scopes: row.scopes ?? [],
    config: row.config ?? {},
    externalAccountId: row.external_account_id,
    webhookSecretHint: row.webhook_secret_hint,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
  };
}

function buildIntegrationPayload(input: IntegrationInput) {
  return Object.fromEntries(
    Object.entries({
      provider: input.provider,
      display_name: input.displayName,
      category: input.category,
      status: input.status,
      connection_mode: input.connectionMode,
      scopes: input.scopes,
      config: input.config,
      external_account_id: input.externalAccountId,
      webhook_secret_hint: input.webhookSecretHint,
      last_synced_at: input.lastSyncedAt,
    }).filter(([, value]) => value !== undefined),
  );
}

export async function listIntegrations(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: IntegrationFilters = {},
) {
  let query = supabase
    .from("integrations")
    .select(INTEGRATION_SELECT)
    .eq("organization_id", organizationId)
    .order("display_name", { ascending: true });

  if (filters.provider) {
    query = query.eq("provider", filters.provider);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load integrations.", error.message);
  }

  return ((data as IntegrationRow[] | null) ?? []).map((row) => normalizeIntegration(row));
}

export async function getIntegrationById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  integrationId: string,
) {
  const { data, error } = await supabase
    .from("integrations")
    .select(INTEGRATION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", integrationId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the integration.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Integration not found.");
  }

  return normalizeIntegration(data as IntegrationRow);
}

export async function createIntegration(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<IntegrationInput, "provider" | "displayName" | "category" | "scopes" | "config">> &
    IntegrationInput,
) {
  const { data, error } = await supabase
    .from("integrations")
    .insert({
      organization_id: organizationId,
      ...buildIntegrationPayload({
        ...input,
        status: input.status ?? "Disconnected",
        connectionMode: input.connectionMode ?? "OAuth",
        externalAccountId: input.externalAccountId ?? null,
        webhookSecretHint: input.webhookSecretHint ?? null,
        lastSyncedAt: input.lastSyncedAt ?? null,
      }),
    })
    .select(INTEGRATION_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the integration.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Integration creation did not return a record.");
  }

  return normalizeIntegration(data as IntegrationRow);
}

export async function updateIntegration(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  integrationId: string,
  input: IntegrationInput,
) {
  const payload = buildIntegrationPayload(input);

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one integration field must be provided.");
  }

  const { data, error } = await supabase
    .from("integrations")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", integrationId)
    .select(INTEGRATION_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the integration.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Integration not found.");
  }

  return normalizeIntegration(data as IntegrationRow);
}

export async function deleteIntegration(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  integrationId: string,
) {
  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", integrationId);

  if (error) {
    throw new ApiError(500, "Failed to delete the integration.", error.message);
  }
}
