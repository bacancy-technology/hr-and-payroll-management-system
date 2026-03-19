import {
  createPerformanceReview,
  listPerformanceReviews,
} from "@/lib/modules/performance/services/performance-review-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
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
      await listPerformanceReviews(supabase, organizationId, {
        employeeId: readOptionalUuid({ employeeId: url.searchParams.get("employeeId") }, "employeeId"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        templateId: readOptionalUuid({ templateId: url.searchParams.get("templateId") }, "templateId"),
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
      await createPerformanceReview(supabase, organizationId, {
        employeeId: readRequiredUuid(body, "employeeId", "Employee ID"),
        templateId: readRequiredUuid(body, "templateId", "Template ID"),
        reviewerName: readRequiredString(body, "reviewerName", "Reviewer name"),
        status: readOptionalString(body, "status"),
        dueDate: readRequiredDate(body, "dueDate", "Due date"),
        submittedAt: body.submittedAt === null ? null : readOptionalDate(body, "submittedAt"),
        score: body.score === null ? null : readOptionalNumber(body, "score"),
        summary: body.summary === null ? null : readOptionalString(body, "summary"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
