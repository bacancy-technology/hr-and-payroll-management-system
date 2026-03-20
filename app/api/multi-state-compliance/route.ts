import { getMultiStateComplianceOverview } from "@/lib/modules/multi-state-compliance/services/multi-state-compliance-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readOptionalString } from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await getMultiStateComplianceOverview(supabase, organizationId, {
        scope: readOptionalString({ scope: url.searchParams.get("scope") }, "scope"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
