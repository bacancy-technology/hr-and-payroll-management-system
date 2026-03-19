import { createEmployee, listEmployees } from "@/lib/modules/employees/services/employee-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredEmail,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listEmployees(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const salary = readOptionalNumber(body, "salary");

    if (salary === undefined) {
      throw new ApiError(400, "Employee salary is required.");
    }

    const startDate = readOptionalDate(body, "startDate");
    const nextReviewAt = readOptionalDate(body, "nextReviewAt");

    if (!startDate || !nextReviewAt) {
      throw new ApiError(400, "Employee startDate and nextReviewAt are required.");
    }

    return created(
      await createEmployee(supabase, organizationId, {
        fullName: readRequiredString(body, "fullName", "Employee name"),
        email: readRequiredEmail(body, "email", "Employee email"),
        role: readRequiredString(body, "role", "Employee role"),
        departmentId: readOptionalUuid(body, "departmentId") ?? null,
        status: readRequiredString(body, "status", "Employee status"),
        location: readRequiredString(body, "location", "Employee location"),
        salary,
        startDate,
        managerName: readRequiredString(body, "managerName", "Manager name"),
        nextReviewAt,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
