import { getAutomatedJobPostingIntegration } from "@/lib/modules/automated-job-posting-integration/services/automated-job-posting-integration-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getAutomatedJobPostingIntegration(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
