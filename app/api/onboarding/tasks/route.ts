import {
  createOnboardingTask,
  listOnboardingTasks,
} from "@/lib/modules/onboarding/services/onboarding-task-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listOnboardingTasks(supabase, organizationId, {
        workflowId: readOptionalUuid({ workflowId: url.searchParams.get("workflowId") }, "workflowId"),
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
    const dueDate = readOptionalDate(body, "dueDate");

    if (!dueDate) {
      throw new ApiError(400, "Onboarding task dueDate is required.");
    }

    return created(
      await createOnboardingTask(supabase, organizationId, {
        workflowId: readRequiredString(body, "workflowId", "Workflow ID"),
        title: readRequiredString(body, "title", "Task title"),
        category: readRequiredString(body, "category", "Task category"),
        assignedToName: readRequiredString(body, "assignedToName", "Assigned to name"),
        status: readOptionalString(body, "status"),
        dueDate,
        completedAt: body.completedAt === null ? null : readOptionalDate(body, "completedAt"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
