import { runIntegrationSync } from "@/lib/modules/integrations/services/integration-sync-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface IntegrationSyncRouteProps {
  params: Promise<{
    integrationId: string;
  }>;
}

export async function POST(request: Request, { params }: IntegrationSyncRouteProps) {
  try {
    const { integrationId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    let body: Record<string, unknown> = {};

    try {
      body = await readJsonBody(request);
    } catch {
      body = {};
    }

    return created(
      await runIntegrationSync(supabase, organizationId, integrationId, {
        triggerSource: readOptionalString(body, "triggerSource"),
        recordsProcessed: readOptionalNumber(body, "recordsProcessed"),
        summary: body.summary === null ? null : readOptionalString(body, "summary"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
