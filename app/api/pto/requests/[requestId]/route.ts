import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, noContent, ok } from "@/lib/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/api/validation";
import { deletePtoRequest, getPtoRequestById, updatePtoRequest } from "@/lib/services/pto-service";

interface PtoRouteProps {
  params: Promise<{
    requestId: string;
  }>;
}

export async function GET(_request: Request, { params }: PtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPtoRequestById(supabase, organizationId, requestId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: PtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updatePtoRequest(supabase, organizationId, requestId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        type: readOptionalString(body, "type"),
        startDate: readOptionalDate(body, "startDate"),
        endDate: readOptionalDate(body, "endDate"),
        days: readOptionalNumber(body, "days"),
        status: readOptionalString(body, "status"),
        approverName: readOptionalString(body, "approverName"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: PtoRouteProps) {
  try {
    const { requestId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deletePtoRequest(supabase, organizationId, requestId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
