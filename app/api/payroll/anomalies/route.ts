import { listPayrollAnomalies } from "@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listPayrollAnomalies(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
