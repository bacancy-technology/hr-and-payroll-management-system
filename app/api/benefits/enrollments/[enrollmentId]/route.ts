import {
  deleteBenefitsEnrollment,
  getBenefitsEnrollmentById,
  updateBenefitsEnrollment,
} from "@/lib/modules/benefits/services/benefits-enrollment-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface BenefitsEnrollmentRouteProps {
  params: Promise<{
    enrollmentId: string;
  }>;
}

export async function GET(_request: Request, { params }: BenefitsEnrollmentRouteProps) {
  try {
    const { enrollmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBenefitsEnrollmentById(supabase, organizationId, enrollmentId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: BenefitsEnrollmentRouteProps) {
  try {
    const { enrollmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateBenefitsEnrollment(supabase, organizationId, enrollmentId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        planId: readOptionalUuid(body, "planId"),
        status: readOptionalString(body, "status"),
        effectiveDate: readOptionalDate(body, "effectiveDate"),
        endDate: body.endDate === null ? null : readOptionalDate(body, "endDate"),
        payrollDeduction: readOptionalNumber(body, "payrollDeduction"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: BenefitsEnrollmentRouteProps) {
  try {
    const { enrollmentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteBenefitsEnrollment(supabase, organizationId, enrollmentId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
