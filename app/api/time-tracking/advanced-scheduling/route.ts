import { getAdvancedSchedulingEngine } from "@/lib/modules/advanced-scheduling-engine/services/advanced-scheduling-engine-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getAdvancedSchedulingEngine(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
