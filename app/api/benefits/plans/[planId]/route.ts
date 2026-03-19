import {
  deleteBenefitsPlan,
  getBenefitsPlanById,
  updateBenefitsPlan,
} from "@/lib/modules/benefits/services/benefits-plan-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface BenefitsPlanRouteProps {
  params: Promise<{
    planId: string;
  }>;
}

export async function GET(_request: Request, { params }: BenefitsPlanRouteProps) {
  try {
    const { planId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBenefitsPlanById(supabase, organizationId, planId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: BenefitsPlanRouteProps) {
  try {
    const { planId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateBenefitsPlan(supabase, organizationId, planId, {
        name: readOptionalString(body, "name"),
        providerName: readOptionalString(body, "providerName"),
        category: readOptionalString(body, "category"),
        coverageLevel: readOptionalString(body, "coverageLevel"),
        employeeCost: readOptionalNumber(body, "employeeCost"),
        employerCost: readOptionalNumber(body, "employerCost"),
        status: readOptionalString(body, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: BenefitsPlanRouteProps) {
  try {
    const { planId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteBenefitsPlan(supabase, organizationId, planId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
