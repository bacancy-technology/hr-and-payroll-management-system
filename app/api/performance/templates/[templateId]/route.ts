import {
  deletePerformanceTemplate,
  getPerformanceTemplateById,
  updatePerformanceTemplate,
} from "@/lib/modules/performance/services/performance-template-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

function readOptionalQuestions(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new ApiError(400, "questions must be an array of strings.");
  }

  return value.map((item) => item.trim());
}

interface PerformanceTemplateRouteProps {
  params: Promise<{
    templateId: string;
  }>;
}

export async function GET(_request: Request, { params }: PerformanceTemplateRouteProps) {
  try {
    const { templateId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPerformanceTemplateById(supabase, organizationId, templateId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: PerformanceTemplateRouteProps) {
  try {
    const { templateId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updatePerformanceTemplate(supabase, organizationId, templateId, {
        name: readOptionalString(body, "name"),
        cycleLabel: readOptionalString(body, "cycleLabel"),
        reviewType: readOptionalString(body, "reviewType"),
        status: readOptionalString(body, "status"),
        questions: readOptionalQuestions(body.questions),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: PerformanceTemplateRouteProps) {
  try {
    const { templateId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deletePerformanceTemplate(supabase, organizationId, templateId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
