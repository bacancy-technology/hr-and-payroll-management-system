import { getEmployeeWellnessDashboard } from "@/lib/modules/employee-wellness-dashboard/services/employee-wellness-dashboard-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getEmployeeWellnessDashboard(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
