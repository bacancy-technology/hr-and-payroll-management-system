import { getOptionalSessionContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";

export async function GET() {
  try {
    const session = await getOptionalSessionContext();

    return ok(session);
  } catch (error) {
    return handleRouteError(error);
  }
}
