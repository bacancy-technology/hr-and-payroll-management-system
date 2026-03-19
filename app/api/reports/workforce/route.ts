import { getWorkforceReport } from "@/lib/modules/reporting/services/reporting-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readOptionalString, readOptionalUuid } from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await getWorkforceReport(supabase, organizationId, {
        departmentId: readOptionalUuid(
          { departmentId: url.searchParams.get("departmentId") },
          "departmentId",
        ),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
