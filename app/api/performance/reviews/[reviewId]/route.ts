import {
  deletePerformanceReview,
  getPerformanceReviewById,
  updatePerformanceReview,
} from "@/lib/modules/performance/services/performance-review-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface PerformanceReviewRouteProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export async function GET(_request: Request, { params }: PerformanceReviewRouteProps) {
  try {
    const { reviewId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPerformanceReviewById(supabase, organizationId, reviewId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: PerformanceReviewRouteProps) {
  try {
    const { reviewId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updatePerformanceReview(supabase, organizationId, reviewId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        templateId: readOptionalUuid(body, "templateId"),
        reviewerName: readOptionalString(body, "reviewerName"),
        status: readOptionalString(body, "status"),
        dueDate: readOptionalDate(body, "dueDate"),
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

export async function DELETE(_request: Request, { params }: PerformanceReviewRouteProps) {
  try {
    const { reviewId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deletePerformanceReview(supabase, organizationId, reviewId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
