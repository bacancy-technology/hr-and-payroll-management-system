import {
  createOnboardingWorkflow,
  listOnboardingWorkflows,
} from "@/lib/modules/onboarding/services/onboarding-workflow-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listOnboardingWorkflows(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const startDate = readOptionalDate(body, "startDate");
    const targetDate = readOptionalDate(body, "targetDate");

    if (!startDate || !targetDate) {
      throw new ApiError(400, "Onboarding workflow startDate and targetDate are required.");
    }

    return created(
      await createOnboardingWorkflow(supabase, organizationId, {
        employeeId: readRequiredString(body, "employeeId", "Employee ID"),
        ownerName: readRequiredString(body, "ownerName", "Owner name"),
        status: readOptionalString(body, "status"),
        startDate,
        targetDate,
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
