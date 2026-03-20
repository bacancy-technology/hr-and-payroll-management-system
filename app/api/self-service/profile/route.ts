import {
  getSelfServiceProfile,
  updateSelfServiceProfile,
} from "@/lib/modules/self-service/services/self-service-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readOptionalString, readRequiredEmail } from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId, user } = await requireApiContext();

    return ok(await getSelfServiceProfile(supabase, organizationId, user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, organizationId, user } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateSelfServiceProfile(supabase, organizationId, user.id, {
        fullName: readOptionalString(body, "fullName"),
        email: body.email !== undefined ? readRequiredEmail(body, "email", "Email") : undefined,
        location: readOptionalString(body, "location"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
