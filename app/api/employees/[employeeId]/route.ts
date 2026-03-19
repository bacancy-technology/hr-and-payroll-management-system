import {
  deleteEmployee,
  getEmployeeById,
  updateEmployee,
} from "@/lib/modules/employees/services/employee-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredEmail,
} from "@/lib/modules/shared/api/validation";

interface EmployeeRouteProps {
  params: Promise<{
    employeeId: string;
  }>;
}

export async function GET(_request: Request, { params }: EmployeeRouteProps) {
  try {
    const { employeeId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getEmployeeById(supabase, organizationId, employeeId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: EmployeeRouteProps) {
  try {
    const { employeeId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateEmployee(supabase, organizationId, employeeId, {
        fullName: readOptionalString(body, "fullName"),
        email: body.email !== undefined ? readRequiredEmail(body, "email", "Employee email") : undefined,
        role: readOptionalString(body, "role"),
        departmentId: body.departmentId === null ? null : readOptionalUuid(body, "departmentId"),
        status: readOptionalString(body, "status"),
        location: readOptionalString(body, "location"),
        salary: readOptionalNumber(body, "salary"),
        startDate: readOptionalDate(body, "startDate"),
        managerName: readOptionalString(body, "managerName"),
        nextReviewAt: readOptionalDate(body, "nextReviewAt"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: EmployeeRouteProps) {
  try {
    const { employeeId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteEmployee(supabase, organizationId, employeeId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
