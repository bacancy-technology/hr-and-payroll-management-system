import { getSentimentAnalysisDashboard } from "@/lib/modules/sentiment-analysis-dashboard/services/sentiment-analysis-dashboard-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getSentimentAnalysisDashboard(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
