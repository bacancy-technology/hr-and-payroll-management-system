import { clockInEmployee } from "@/lib/modules/time-tracking/services/time-entry-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const workDate = readOptionalDate(body, "workDate");

    if (!workDate) {
      throw new ApiError(400, "Clock-in requires a workDate.");
    }

    return created(
      await clockInEmployee(supabase, organizationId, {
        employeeId: readRequiredString(body, "employeeId", "Employee ID"),
        payPeriodId: body.payPeriodId === null ? null : readOptionalUuid(body, "payPeriodId"),
        workDate,
        clockInAt: readOptionalDate(body, "clockInAt"),
        status: readOptionalString(body, "status"),
        notes: readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
