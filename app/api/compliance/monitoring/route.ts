import { getAutomatedComplianceMonitoring } from "@/lib/modules/automated-compliance-monitoring/services/automated-compliance-monitoring-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getAutomatedComplianceMonitoring(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
