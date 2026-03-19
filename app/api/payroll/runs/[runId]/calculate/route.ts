import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";
import { calculatePayrollRun } from "@/lib/services/payroll-service";

interface PayrollRunRouteProps {
  params: Promise<{
    runId: string;
  }>;
}

export async function POST(_request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const context = await requireApiContext();

    return ok(await calculatePayrollRun(context, runId));
  } catch (error) {
    return handleRouteError(error);
  }
}
