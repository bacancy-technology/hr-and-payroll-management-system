import {
  deleteWorkersCompClaim,
  getWorkersCompClaimById,
  updateWorkersCompClaim,
} from "@/lib/modules/workers-comp/services/workers-comp-claim-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface WorkersCompClaimRouteProps {
  params: Promise<{
    claimId: string;
  }>;
}

export async function GET(_request: Request, { params }: WorkersCompClaimRouteProps) {
  try {
    const { claimId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getWorkersCompClaimById(supabase, organizationId, claimId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: WorkersCompClaimRouteProps) {
  try {
    const { claimId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateWorkersCompClaim(supabase, organizationId, claimId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        policyId: readOptionalUuid(body, "policyId"),
        incidentDate: readOptionalDate(body, "incidentDate"),
        reportedDate: readOptionalDate(body, "reportedDate"),
        claimNumber: body.claimNumber === null ? null : readOptionalString(body, "claimNumber"),
        claimType: readOptionalString(body, "claimType"),
        status: readOptionalString(body, "status"),
        description: body.description === null ? null : readOptionalString(body, "description"),
        amountReserved: readOptionalNumber(body, "amountReserved"),
        amountPaid: readOptionalNumber(body, "amountPaid"),
        caseManagerName: body.caseManagerName === null ? null : readOptionalString(body, "caseManagerName"),
        caseManagerEmail:
          body.caseManagerEmail === null ? null : readOptionalString(body, "caseManagerEmail"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: WorkersCompClaimRouteProps) {
  try {
    const { claimId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteWorkersCompClaim(supabase, organizationId, claimId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
