import {
  createTimeEntry,
  listTimeEntries,
} from "@/lib/modules/time-tracking/services/time-entry-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { supabase, organizationId } = await requireApiContext();

    return ok(
      await listTimeEntries(supabase, organizationId, {
        employeeId: searchParams.get("employeeId") ?? undefined,
        payPeriodId: searchParams.get("payPeriodId") ?? undefined,
        workDate: searchParams.get("workDate") ?? undefined,
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
    const workDate = readOptionalDate(body, "workDate");

    if (!workDate) {
      throw new ApiError(400, "Time entry workDate is required.");
    }

    return created(
      await createTimeEntry(supabase, organizationId, {
        employeeId: readRequiredString(body, "employeeId", "Employee ID"),
        payPeriodId: body.payPeriodId === null ? null : readOptionalUuid(body, "payPeriodId"),
        workDate,
        clockInAt: body.clockInAt === null ? null : readOptionalDate(body, "clockInAt"),
        clockOutAt: body.clockOutAt === null ? null : readOptionalDate(body, "clockOutAt"),
        breakMinutes: readOptionalNumber(body, "breakMinutes"),
        status: readOptionalString(body, "status"),
        notes: readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
