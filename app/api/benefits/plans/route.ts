import {
  createBenefitsPlan,
  listBenefitsPlans,
} from "@/lib/modules/benefits/services/benefits-plan-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readRequiredNumber,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listBenefitsPlans(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createBenefitsPlan(supabase, organizationId, {
        name: readRequiredString(body, "name", "Plan name"),
        providerName: readRequiredString(body, "providerName", "Provider name"),
        category: readRequiredString(body, "category", "Category"),
        coverageLevel: readRequiredString(body, "coverageLevel", "Coverage level"),
        employeeCost: readRequiredNumber(body, "employeeCost", "Employee cost"),
        employerCost: readRequiredNumber(body, "employerCost", "Employer cost"),
        status: readOptionalString(body, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
