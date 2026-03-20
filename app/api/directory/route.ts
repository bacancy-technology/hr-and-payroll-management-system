import {
  getDirectoryOverview,
  listDirectoryEmployees,
} from "@/lib/modules/directory/services/directory-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readOptionalString, readOptionalUuid } from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);
    const search = readOptionalString({ search: url.searchParams.get("search") }, "search");
    const departmentId = readOptionalUuid(
      { departmentId: url.searchParams.get("departmentId") },
      "departmentId",
    );
    const status = readOptionalString({ status: url.searchParams.get("status") }, "status");
    const location = readOptionalString({ location: url.searchParams.get("location") }, "location");

    if (!search && !departmentId && !status && !location) {
      return ok(await getDirectoryOverview(supabase, organizationId));
    }

    return ok(
      await listDirectoryEmployees(supabase, organizationId, {
        search,
        departmentId,
        status,
        location,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
