import { listSelfServicePaystubs } from "@/lib/modules/self-service/services/self-service-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const { supabase, organizationId, user } = await requireApiContext();

    return ok(await listSelfServicePaystubs(supabase, organizationId, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
