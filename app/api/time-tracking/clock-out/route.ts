import { clockOutEmployee } from "@/lib/modules/time-tracking/services/time-entry-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const timeEntryId = readRequiredString(body, "timeEntryId", "Time entry ID");

    if (!timeEntryId) {
      throw new ApiError(400, "Clock-out requires a timeEntryId.");
    }

    return ok(
      await clockOutEmployee(supabase, organizationId, timeEntryId, {
        clockOutAt: readOptionalDate(body, "clockOutAt"),
        breakMinutes: readOptionalNumber(body, "breakMinutes"),
        status: readOptionalString(body, "status"),
        notes: readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
