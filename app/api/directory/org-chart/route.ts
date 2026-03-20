import { getDynamicOrgChartVisualization } from "@/lib/modules/dynamic-org-chart-visualization/services/dynamic-org-chart-visualization-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getDynamicOrgChartVisualization(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
