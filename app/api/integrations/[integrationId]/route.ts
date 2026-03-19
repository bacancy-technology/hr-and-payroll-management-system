import {
  deleteIntegration,
  getIntegrationById,
  updateIntegration,
} from "@/lib/modules/integrations/services/integration-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalObject,
  readOptionalString,
  readOptionalStringArray,
} from "@/lib/modules/shared/api/validation";

interface IntegrationRouteProps {
  params: Promise<{
    integrationId: string;
  }>;
}

export async function GET(_request: Request, { params }: IntegrationRouteProps) {
  try {
    const { integrationId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getIntegrationById(supabase, organizationId, integrationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: IntegrationRouteProps) {
  try {
    const { integrationId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateIntegration(supabase, organizationId, integrationId, {
        provider: readOptionalString(body, "provider"),
        displayName: readOptionalString(body, "displayName"),
        category: readOptionalString(body, "category"),
        status: readOptionalString(body, "status"),
        connectionMode: readOptionalString(body, "connectionMode"),
        scopes: readOptionalStringArray(body, "scopes"),
        config: readOptionalObject(body, "config"),
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

export async function DELETE(_request: Request, { params }: IntegrationRouteProps) {
  try {
    const { integrationId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteIntegration(supabase, organizationId, integrationId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
