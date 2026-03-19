import { verifyDirectDeposit } from "@/lib/modules/direct-deposit/services/direct-deposit-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readRequiredUuid } from "@/lib/modules/shared/api/validation";

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await verifyDirectDeposit(
        supabase,
        organizationId,
        readRequiredUuid(body, "bankAccountId", "Bank account ID"),
      ),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
