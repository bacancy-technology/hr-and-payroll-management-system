import {
  createSelfServicePtoRequest,
  listSelfServicePtoRequests,
} from "@/lib/modules/self-service/services/self-service-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId, user } = await requireApiContext();

    return ok(await listSelfServicePtoRequests(supabase, organizationId, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId, user } = await requireApiContext();
    const body = await readJsonBody(request);
    const startDate = readOptionalDate(body, "startDate");
    const endDate = readOptionalDate(body, "endDate");
    const days = readOptionalNumber(body, "days");

    if (!startDate || !endDate || days === undefined) {
      throw new ApiError(400, "Self-service PTO startDate, endDate, and days are required.");
    }

    return created(
      await createSelfServicePtoRequest(supabase, organizationId, user.id, {
        type: readRequiredString(body, "type", "PTO type"),
        startDate,
        endDate,
        days,
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
