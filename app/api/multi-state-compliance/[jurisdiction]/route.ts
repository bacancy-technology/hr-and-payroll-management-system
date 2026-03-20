import { getJurisdictionComplianceByName } from "@/lib/modules/multi-state-compliance/services/multi-state-compliance-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

interface JurisdictionComplianceRouteProps {
  params: Promise<{
    jurisdiction: string;
  }>;
}

export async function GET(_request: Request, { params }: JurisdictionComplianceRouteProps) {
  try {
    const { jurisdiction } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getJurisdictionComplianceByName(supabase, organizationId, jurisdiction));
  } catch (error) {
    return handleRouteError(error);
  }
}
