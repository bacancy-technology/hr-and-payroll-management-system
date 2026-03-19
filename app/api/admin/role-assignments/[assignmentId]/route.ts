import {
  deleteRoleAssignment,
  getRoleAssignmentById,
} from "@/lib/modules/admin/services/role-assignment-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";

interface RoleAssignmentRouteProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export async function GET(_request: Request, { params }: RoleAssignmentRouteProps) {
  try {
    const { assignmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getRoleAssignmentById(supabase, organizationId, assignmentId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RoleAssignmentRouteProps) {
  try {
    const { assignmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteRoleAssignment(supabase, organizationId, assignmentId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
