import {
  getWebhookEventById,
  updateWebhookEvent,
} from "@/lib/modules/integrations/services/webhook-event-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalObject,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface WebhookEventRouteProps {
  params: Promise<{
    provider: string;
    eventId: string;
  }>;
}

export async function GET(_request: Request, { params }: WebhookEventRouteProps) {
  try {
    const { provider, eventId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getWebhookEventById(supabase, organizationId, provider, eventId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: WebhookEventRouteProps) {
  try {
    const { provider, eventId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateWebhookEvent(supabase, organizationId, provider, eventId, {
        integrationId:
          body.integrationId === null ? null : readOptionalUuid(body, "integrationId"),
        eventType: readOptionalString(body, "eventType"),
        deliveryStatus: readOptionalString(body, "deliveryStatus"),
        externalEventId:
          body.externalEventId === null ? null : readOptionalString(body, "externalEventId"),
        payload: body.payload === null ? {} : readOptionalObject(body, "payload"),
        processedAt: body.processedAt === null ? null : readOptionalDate(body, "processedAt"),
        errorMessage: body.errorMessage === null ? null : readOptionalString(body, "errorMessage"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
