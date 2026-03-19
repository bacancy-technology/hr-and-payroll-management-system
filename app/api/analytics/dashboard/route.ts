import { getAnalyticsDashboard } from "@/lib/modules/reporting/services/analytics-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getAnalyticsDashboard(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
