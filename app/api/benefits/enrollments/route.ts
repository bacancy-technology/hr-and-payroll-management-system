import {
  createBenefitsEnrollment,
  listBenefitsEnrollments,
} from "@/lib/modules/benefits/services/benefits-enrollment-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
  readRequiredDate,
  readRequiredNumber,
  readRequiredUuid,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listBenefitsEnrollments(supabase, organizationId, {
        employeeId: readOptionalUuid({ employeeId: url.searchParams.get("employeeId") }, "employeeId"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        planId: readOptionalUuid({ planId: url.searchParams.get("planId") }, "planId"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createBenefitsEnrollment(supabase, organizationId, {
        employeeId: readRequiredUuid(body, "employeeId", "Employee ID"),
        planId: readRequiredUuid(body, "planId", "Plan ID"),
        status: readOptionalString(body, "status"),
        effectiveDate: readRequiredDate(body, "effectiveDate", "Effective date"),
        endDate: body.endDate === null ? null : readOptionalDate(body, "endDate"),
        payrollDeduction: readRequiredNumber(body, "payrollDeduction", "Payroll deduction"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
