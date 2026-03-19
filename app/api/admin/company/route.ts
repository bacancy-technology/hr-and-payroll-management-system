import {
  getCompanyByOrganizationId,
  updateCompanyByOrganizationId,
} from "@/lib/modules/admin/services/company-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString } from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getCompanyByOrganizationId(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateCompanyByOrganizationId(supabase, organizationId, {
        name: readOptionalString(body, "name"),
        industry: readOptionalString(body, "industry"),
        headquarters: readOptionalString(body, "headquarters"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
