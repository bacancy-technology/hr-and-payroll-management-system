import { finalizePayrollRun } from "@/lib/modules/payroll/services/payroll-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface PayrollRunRouteProps {
  params: Promise<{
    runId: string;
  }>;
}

export async function POST(_request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await finalizePayrollRun(supabase, organizationId, runId));
  } catch (error) {
    return handleRouteError(error);
  }
}
