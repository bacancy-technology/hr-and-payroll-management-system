import {
  deleteOnboardingWorkflow,
  getOnboardingWorkflowById,
  updateOnboardingWorkflow,
} from "@/lib/modules/onboarding/services/onboarding-workflow-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface OnboardingWorkflowRouteProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export async function GET(_request: Request, { params }: OnboardingWorkflowRouteProps) {
  try {
    const { workflowId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getOnboardingWorkflowById(supabase, organizationId, workflowId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: OnboardingWorkflowRouteProps) {
  try {
    const { workflowId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateOnboardingWorkflow(supabase, organizationId, workflowId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        ownerName: readOptionalString(body, "ownerName"),
        status: readOptionalString(body, "status"),
        startDate: readOptionalDate(body, "startDate"),
        targetDate: readOptionalDate(body, "targetDate"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: OnboardingWorkflowRouteProps) {
  try {
    const { workflowId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteOnboardingWorkflow(supabase, organizationId, workflowId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
