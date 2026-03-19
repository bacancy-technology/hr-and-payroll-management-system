import {
  deleteHoliday,
  getHolidayById,
  updateHoliday,
} from "@/lib/modules/time-tracking/services/holiday-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface HolidayRouteProps {
  params: Promise<{
    holidayId: string;
  }>;
}

export async function GET(_request: Request, { params }: HolidayRouteProps) {
  try {
    const { holidayId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getHolidayById(supabase, organizationId, holidayId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: HolidayRouteProps) {
  try {
    const { holidayId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateHoliday(supabase, organizationId, holidayId, {
        name: readOptionalString(body, "name"),
        holidayDate: readOptionalDate(body, "holidayDate"),
        type: readOptionalString(body, "type"),
        appliesTo: readOptionalString(body, "appliesTo"),
        status: readOptionalString(body, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: HolidayRouteProps) {
  try {
    const { holidayId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteHoliday(supabase, organizationId, holidayId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
