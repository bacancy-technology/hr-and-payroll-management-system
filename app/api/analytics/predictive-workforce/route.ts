import { getPredictiveWorkforceAnalytics } from "@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPredictiveWorkforceAnalytics(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
