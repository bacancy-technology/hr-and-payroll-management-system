import { createDepartment, listDepartments } from "@/lib/modules/admin/services/department-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listDepartments(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createDepartment(supabase, organizationId, {
        name: readRequiredString(body, "name", "Department name"),
        code: readOptionalString(body, "code"),
        leadName: readOptionalString(body, "leadName"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
