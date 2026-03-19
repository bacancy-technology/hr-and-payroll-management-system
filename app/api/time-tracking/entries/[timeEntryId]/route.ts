import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, noContent, ok } from "@/lib/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/api/validation";
import { deleteTimeEntry, getTimeEntryById, updateTimeEntry } from "@/lib/services/time-tracking-service";

interface TimeEntryRouteProps {
  params: Promise<{
    timeEntryId: string;
  }>;
}

export async function GET(_request: Request, { params }: TimeEntryRouteProps) {
  try {
    const { timeEntryId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getTimeEntryById(supabase, organizationId, timeEntryId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: TimeEntryRouteProps) {
  try {
    const { timeEntryId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateTimeEntry(supabase, organizationId, timeEntryId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        payPeriodId: body.payPeriodId === null ? null : readOptionalUuid(body, "payPeriodId"),
        workDate: readOptionalDate(body, "workDate"),
        clockInAt: body.clockInAt === null ? null : readOptionalDate(body, "clockInAt"),
        clockOutAt: body.clockOutAt === null ? null : readOptionalDate(body, "clockOutAt"),
        breakMinutes: readOptionalNumber(body, "breakMinutes"),
        status: readOptionalString(body, "status"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: TimeEntryRouteProps) {
  try {
    const { timeEntryId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteTimeEntry(supabase, organizationId, timeEntryId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
