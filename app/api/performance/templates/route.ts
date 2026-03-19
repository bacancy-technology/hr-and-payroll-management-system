import {
  createPerformanceTemplate,
  listPerformanceTemplates,
} from "@/lib/modules/performance/services/performance-template-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

function readRequiredQuestions(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new ApiError(400, "questions must be a non-empty array of strings.");
  }

  return value.map((item) => item.trim());
}

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listPerformanceTemplates(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createPerformanceTemplate(supabase, organizationId, {
        name: readRequiredString(body, "name", "Template name"),
        cycleLabel: readRequiredString(body, "cycleLabel", "Cycle label"),
        reviewType: readRequiredString(body, "reviewType", "Review type"),
        status: readOptionalString(body, "status"),
        questions: readRequiredQuestions(body.questions),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
