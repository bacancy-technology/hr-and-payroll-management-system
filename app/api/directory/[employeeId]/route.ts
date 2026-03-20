import { getDirectoryEmployeeById } from "@/lib/modules/directory/services/directory-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface DirectoryEmployeeRouteProps {
  params: Promise<{
    employeeId: string;
  }>;
}

export async function GET(_request: Request, { params }: DirectoryEmployeeRouteProps) {
  try {
    const { employeeId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getDirectoryEmployeeById(supabase, organizationId, employeeId));
  } catch (error) {
    return handleRouteError(error);
  }
}
