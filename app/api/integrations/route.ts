import {
  createIntegration,
  listIntegrations,
} from "@/lib/modules/integrations/services/integration-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalObject,
  readOptionalString,
  readOptionalStringArray,
  readRequiredObject,
  readRequiredString,
  readRequiredStringArray,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listIntegrations(supabase, organizationId, {
        provider: readOptionalString({ provider: url.searchParams.get("provider") }, "provider"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        category: readOptionalString({ category: url.searchParams.get("category") }, "category"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createIntegration(supabase, organizationId, {
        provider: readRequiredString(body, "provider", "Provider"),
        displayName: readRequiredString(body, "displayName", "Display name"),
        category: readRequiredString(body, "category", "Category"),
        status: readOptionalString(body, "status"),
        connectionMode: readOptionalString(body, "connectionMode"),
        scopes: readRequiredStringArray(body, "scopes", "Scopes"),
        config: readRequiredObject(body, "config", "Config"),
        externalAccountId:
          body.externalAccountId === null ? null : readOptionalString(body, "externalAccountId"),
        webhookSecretHint:
          body.webhookSecretHint === null ? null : readOptionalString(body, "webhookSecretHint"),
        lastSyncedAt: body.lastSyncedAt === null ? null : readOptionalDate(body, "lastSyncedAt"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
