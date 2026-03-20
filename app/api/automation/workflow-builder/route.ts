import { getCustomWorkflowBuilder } from "@/lib/modules/custom-workflow-builder/services/custom-workflow-builder-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getCustomWorkflowBuilder(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
