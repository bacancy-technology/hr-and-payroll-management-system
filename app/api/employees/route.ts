import { ApiError } from "@/lib/api/errors";
import { requireApiContext } from "@/lib/api/context";
import { created, handleRouteError, ok } from "@/lib/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredEmail,
  readRequiredString,
} from "@/lib/api/validation";
import { createEmployee, listEmployees } from "@/lib/services/employee-service";

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
