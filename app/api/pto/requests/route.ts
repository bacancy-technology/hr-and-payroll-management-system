import { ApiError } from "@/lib/api/errors";
import { requireApiContext } from "@/lib/api/context";
import { created, handleRouteError, ok } from "@/lib/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/api/validation";
import { createPtoRequest, listPtoRequests } from "@/lib/services/pto-service";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listPtoRequests(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const startDate = readOptionalDate(body, "startDate");
    const endDate = readOptionalDate(body, "endDate");
    const days = readOptionalNumber(body, "days");

    if (!startDate || !endDate || days === undefined) {
      throw new ApiError(400, "PTO request startDate, endDate, and days are required.");
    }

    return created(
      await createPtoRequest(supabase, organizationId, {
        employeeId: readRequiredString(body, "employeeId", "Employee ID"),
        type: readRequiredString(body, "type", "PTO type"),
        startDate,
        endDate,
        days,
        status: readOptionalString(body, "status"),
        approverName: readRequiredString(body, "approverName", "Approver name"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
