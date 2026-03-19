import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, noContent, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalDate, readOptionalString, readOptionalUuid } from "@/lib/api/validation";
import { deletePayrollRun, getPayrollRunById, updatePayrollRun } from "@/lib/services/payroll-service";

interface PayrollRunRouteProps {
  params: Promise<{
    runId: string;
  }>;
}

export async function GET(_request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPayrollRunById(supabase, organizationId, runId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updatePayrollRun(supabase, organizationId, runId, {
        payPeriodId: body.payPeriodId === null ? null : readOptionalUuid(body, "payPeriodId"),
        periodLabel: readOptionalString(body, "periodLabel"),
        payDate: readOptionalDate(body, "payDate"),
        status: readOptionalString(body, "status"),
        varianceNote: readOptionalString(body, "varianceNote"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: PayrollRunRouteProps) {
  try {
    const { runId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deletePayrollRun(supabase, organizationId, runId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
