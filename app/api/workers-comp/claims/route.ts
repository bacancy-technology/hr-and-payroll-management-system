import {
  createWorkersCompClaim,
  listWorkersCompClaims,
} from "@/lib/modules/workers-comp/services/workers-comp-claim-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredDate,
  readRequiredString,
  readRequiredUuid,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listWorkersCompClaims(supabase, organizationId, {
        employeeId: readOptionalUuid({ employeeId: url.searchParams.get("employeeId") }, "employeeId"),
        policyId: readOptionalUuid({ policyId: url.searchParams.get("policyId") }, "policyId"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createWorkersCompClaim(supabase, organizationId, {
        employeeId: readRequiredUuid(body, "employeeId", "Employee ID"),
        policyId: readRequiredUuid(body, "policyId", "Policy ID"),
        incidentDate: readRequiredDate(body, "incidentDate", "Incident date"),
        reportedDate: readRequiredDate(body, "reportedDate", "Reported date"),
        claimNumber: body.claimNumber === null ? null : readOptionalString(body, "claimNumber"),
        claimType: readRequiredString(body, "claimType", "Claim type"),
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
