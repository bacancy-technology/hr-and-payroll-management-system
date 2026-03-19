import { approvePayrollRun } from "@/lib/modules/payroll/services/payroll-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString } from "@/lib/modules/shared/api/validation";

interface PayrollRunRouteProps {
  params: Promise<{
    runId: string;
  }>;
}

export async function POST(request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const context = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(await approvePayrollRun(context, runId, body.decisionNote === null ? null : readOptionalString(body, "decisionNote")));
  } catch (error) {
    return handleRouteError(error);
  }
}
