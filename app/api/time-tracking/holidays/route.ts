import {
  createHoliday,
  listHolidays,
} from "@/lib/modules/time-tracking/services/holiday-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listHolidays(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const holidayDate = readOptionalDate(body, "holidayDate");

    if (!holidayDate) {
      throw new ApiError(400, "Holiday holidayDate is required.");
    }

    return created(
      await createHoliday(supabase, organizationId, {
        name: readRequiredString(body, "name", "Holiday name"),
        holidayDate,
        type: readRequiredString(body, "type", "Holiday type"),
        appliesTo: readRequiredString(body, "appliesTo", "Holiday appliesTo"),
        status: readOptionalString(body, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
