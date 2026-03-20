import { getIntelligentDocumentProcessing } from "@/lib/modules/intelligent-document-processing/services/intelligent-document-processing-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getIntelligentDocumentProcessing(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
