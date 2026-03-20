import {
  deleteSelfServicePtoRequest,
  getSelfServicePtoRequestById,
  updateSelfServicePtoRequest,
} from "@/lib/modules/self-service/services/self-service-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface SelfServicePtoRouteProps {
  params: Promise<{
    requestId: string;
  }>;
}

export async function GET(_request: Request, { params }: SelfServicePtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId, user } = await requireApiContext();

    return ok(await getSelfServicePtoRequestById(supabase, organizationId, user.id, requestId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: SelfServicePtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId, user } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateSelfServicePtoRequest(supabase, organizationId, user.id, requestId, {
        type: readOptionalString(body, "type"),
        startDate: readOptionalDate(body, "startDate"),
        endDate: readOptionalDate(body, "endDate"),
        days: readOptionalNumber(body, "days"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: SelfServicePtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId, user } = await requireApiContext();

    await deleteSelfServicePtoRequest(supabase, organizationId, user.id, requestId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
