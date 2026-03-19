import {
  createWorkersCompPolicy,
  listWorkersCompPolicies,
} from "@/lib/modules/workers-comp/services/workers-comp-policy-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readRequiredDate,
  readRequiredNumber,
  readRequiredString,
  readRequiredStringArray,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listWorkersCompPolicies(supabase, organizationId, {
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
      await createWorkersCompPolicy(supabase, organizationId, {
        policyName: readRequiredString(body, "policyName", "Policy name"),
        carrierName: readRequiredString(body, "carrierName", "Carrier name"),
        policyNumber: readRequiredString(body, "policyNumber", "Policy number"),
        coverageStartDate: readRequiredDate(body, "coverageStartDate", "Coverage start date"),
        coverageEndDate: readRequiredDate(body, "coverageEndDate", "Coverage end date"),
        status: readOptionalString(body, "status"),
        statesCovered: readRequiredStringArray(body, "statesCovered", "States covered"),
        premiumAmount: readRequiredNumber(body, "premiumAmount", "Premium amount"),
        contactName: body.contactName === null ? null : readOptionalString(body, "contactName"),
        contactEmail: body.contactEmail === null ? null : readOptionalString(body, "contactEmail"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
