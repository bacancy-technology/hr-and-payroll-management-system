import { getBlockchainPayrollVerification } from "@/lib/modules/blockchain-payroll-verification/services/blockchain-payroll-verification-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBlockchainPayrollVerification(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}
