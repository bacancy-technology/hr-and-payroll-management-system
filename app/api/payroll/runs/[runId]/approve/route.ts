import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalString } from "@/lib/api/validation";
import { approvePayrollRun } from "@/lib/services/payroll-service";

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
