import { getOptionalSessionContext } from "@/lib/api/context";
import { handleRouteError, ok } from "@/lib/api/http";

export async function GET() {
  try {
    const session = await getOptionalSessionContext();

    return ok(session);
  } catch (error) {
    return handleRouteError(error);
  }
}
