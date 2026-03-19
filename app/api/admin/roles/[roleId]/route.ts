import {
  deleteAccessRole,
  getAccessRoleById,
  updateAccessRole,
} from "@/lib/modules/admin/services/access-role-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString } from "@/lib/modules/shared/api/validation";

function readOptionalPermissions(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new ApiError(400, "permissions must be an array of strings.");
  }

  return value.map((item) => item.trim());
}

interface AccessRoleRouteProps {
  params: Promise<{
    roleId: string;
  }>;
}

export async function GET(_request: Request, { params }: AccessRoleRouteProps) {
  try {
    const { roleId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getAccessRoleById(supabase, organizationId, roleId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: AccessRoleRouteProps) {
  try {
    const { roleId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateAccessRole(supabase, organizationId, roleId, {
        name: readOptionalString(body, "name"),
        description: body.description === null ? null : readOptionalString(body, "description"),
        status: readOptionalString(body, "status"),
        permissions: readOptionalPermissions(body.permissions),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: AccessRoleRouteProps) {
  try {
    const { roleId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteAccessRole(supabase, organizationId, roleId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
