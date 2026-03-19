import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, noContent, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalString } from "@/lib/api/validation";
import { deleteDepartment, getDepartmentById, updateDepartment } from "@/lib/services/department-service";

interface DepartmentRouteProps {
  params: Promise<{
    departmentId: string;
  }>;
}

export async function GET(_request: Request, { params }: DepartmentRouteProps) {
  try {
    const { departmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getDepartmentById(supabase, organizationId, departmentId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: DepartmentRouteProps) {
  try {
    const { departmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateDepartment(supabase, organizationId, departmentId, {
        name: readOptionalString(body, "name"),
        code: readOptionalString(body, "code"),
        leadName: readOptionalString(body, "leadName"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: DepartmentRouteProps) {
  try {
    const { departmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteDepartment(supabase, organizationId, departmentId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
