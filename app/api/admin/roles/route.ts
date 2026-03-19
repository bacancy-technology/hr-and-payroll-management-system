import {
  createAccessRole,
  listAccessRoles,
} from "@/lib/modules/admin/services/access-role-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString, readRequiredString } from "@/lib/modules/shared/api/validation";

function readRequiredPermissions(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new ApiError(400, "permissions must be a non-empty array of strings.");
  }

  return value.map((item) => item.trim());
}

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listAccessRoles(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createAccessRole(supabase, organizationId, {
        name: readRequiredString(body, "name", "Role name"),
        description: body.description === null ? null : readOptionalString(body, "description"),
        status: readOptionalString(body, "status"),
        permissions: readRequiredPermissions(body.permissions),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
