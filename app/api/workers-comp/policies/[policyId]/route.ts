import {
  deleteWorkersCompPolicy,
  getWorkersCompPolicyById,
  updateWorkersCompPolicy,
} from "@/lib/modules/workers-comp/services/workers-comp-policy-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalStringArray,
} from "@/lib/modules/shared/api/validation";

interface WorkersCompPolicyRouteProps {
  params: Promise<{
    policyId: string;
  }>;
}

export async function GET(_request: Request, { params }: WorkersCompPolicyRouteProps) {
  try {
    const { policyId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getWorkersCompPolicyById(supabase, organizationId, policyId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: WorkersCompPolicyRouteProps) {
  try {
    const { policyId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateWorkersCompPolicy(supabase, organizationId, policyId, {
        policyName: readOptionalString(body, "policyName"),
        carrierName: readOptionalString(body, "carrierName"),
        policyNumber: readOptionalString(body, "policyNumber"),
        coverageStartDate: readOptionalDate(body, "coverageStartDate"),
        coverageEndDate: readOptionalDate(body, "coverageEndDate"),
        status: readOptionalString(body, "status"),
        statesCovered: readOptionalStringArray(body, "statesCovered"),
        premiumAmount: readOptionalNumber(body, "premiumAmount"),
        contactName: body.contactName === null ? null : readOptionalString(body, "contactName"),
        contactEmail: body.contactEmail === null ? null : readOptionalString(body, "contactEmail"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: WorkersCompPolicyRouteProps) {
  try {
    const { policyId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteWorkersCompPolicy(supabase, organizationId, policyId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
