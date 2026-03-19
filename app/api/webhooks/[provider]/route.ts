import {
  createWebhookEvent,
  listWebhookEvents,
} from "@/lib/modules/integrations/services/webhook-event-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalObject,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

interface WebhookRouteProps {
  params: Promise<{
    provider: string;
  }>;
}

export async function GET(request: Request, { params }: WebhookRouteProps) {
  try {
    const { provider } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listWebhookEvents(supabase, organizationId, {
        provider,
        integrationId: readOptionalUuid(
          { integrationId: url.searchParams.get("integrationId") },
          "integrationId",
        ),
        deliveryStatus: readOptionalString(
          { deliveryStatus: url.searchParams.get("deliveryStatus") },
          "deliveryStatus",
        ),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: WebhookRouteProps) {
  try {
    const { provider } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createWebhookEvent(supabase, organizationId, provider, {
        integrationId: readOptionalUuid(body, "integrationId"),
        eventType: readRequiredString(body, "eventType", "Event type"),
        deliveryStatus: readOptionalString(body, "deliveryStatus"),
        externalEventId:
          body.externalEventId === null ? null : readOptionalString(body, "externalEventId"),
        payload: body.payload !== undefined ? (readOptionalObject(body, "payload") ?? {}) : body,
        processedAt: body.processedAt === null ? null : readOptionalDate(body, "processedAt"),
        errorMessage: body.errorMessage === null ? null : readOptionalString(body, "errorMessage"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
