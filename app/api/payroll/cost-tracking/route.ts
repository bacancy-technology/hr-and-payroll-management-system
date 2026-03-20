import { getRealTimePayrollCostTracking } from "@/lib/modules/real-time-payroll-cost-tracking/services/real-time-payroll-cost-tracking-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getRealTimePayrollCostTracking(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
