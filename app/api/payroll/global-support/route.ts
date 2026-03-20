import { getGlobalPayrollSupport } from "@/lib/modules/global-payroll-support/services/global-payroll-support-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getGlobalPayrollSupport(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
