import {
  createRoleAssignment,
  listRoleAssignments,
} from "@/lib/modules/admin/services/role-assignment-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString, readRequiredUuid } from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listRoleAssignments(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId, profile } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createRoleAssignment(supabase, organizationId, {
        roleId: readRequiredUuid(body, "roleId", "Role ID"),
        profileId: readRequiredUuid(body, "profileId", "Profile ID"),
        assignedByName: readOptionalString(body, "assignedByName") ?? profile.full_name,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
