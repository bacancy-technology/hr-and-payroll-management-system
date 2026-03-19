import { getPayrollCalendar } from "@/lib/modules/payroll/services/payroll-calendar-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readOptionalDate } from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await getPayrollCalendar(supabase, organizationId, {
        startDate: readOptionalDate({ startDate: url.searchParams.get("startDate") }, "startDate"),
        endDate: readOptionalDate({ endDate: url.searchParams.get("endDate") }, "endDate"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
