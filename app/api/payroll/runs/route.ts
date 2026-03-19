import { ApiError } from "@/lib/api/errors";
import { requireApiContext } from "@/lib/api/context";
import { created, handleRouteError, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalDate, readOptionalString, readOptionalUuid, readRequiredString } from "@/lib/api/validation";
import { createPayrollRun, listPayrollRuns } from "@/lib/services/payroll-service";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listPayrollRuns(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const payDate = readOptionalDate(body, "payDate");

    if (!payDate) {
      throw new ApiError(400, "Payroll run payDate is required.");
    }

    return created(
      await createPayrollRun(supabase, organizationId, {
        payPeriodId: body.payPeriodId === null ? null : readOptionalUuid(body, "payPeriodId"),
        periodLabel: readRequiredString(body, "periodLabel", "Payroll period label"),
        payDate,
        status: readOptionalString(body, "status"),
        varianceNote: readOptionalString(body, "varianceNote"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
