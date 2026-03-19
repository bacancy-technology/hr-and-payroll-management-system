import {
  deleteOnboardingTask,
  getOnboardingTaskById,
  updateOnboardingTask,
} from "@/lib/modules/onboarding/services/onboarding-task-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface OnboardingTaskRouteProps {
  params: Promise<{
    taskId: string;
  }>;
}

export async function GET(_request: Request, { params }: OnboardingTaskRouteProps) {
  try {
    const { taskId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getOnboardingTaskById(supabase, organizationId, taskId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: OnboardingTaskRouteProps) {
  try {
    const { taskId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateOnboardingTask(supabase, organizationId, taskId, {
        workflowId: readOptionalUuid(body, "workflowId"),
        title: readOptionalString(body, "title"),
        category: readOptionalString(body, "category"),
        assignedToName: readOptionalString(body, "assignedToName"),
        status: readOptionalString(body, "status"),
        dueDate: readOptionalDate(body, "dueDate"),
        completedAt: body.completedAt === null ? null : readOptionalDate(body, "completedAt"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: OnboardingTaskRouteProps) {
  try {
    const { taskId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteOnboardingTask(supabase, organizationId, taskId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
