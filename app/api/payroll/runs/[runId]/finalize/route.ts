import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";
import { finalizePayrollRun } from "@/lib/services/payroll-service";

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
