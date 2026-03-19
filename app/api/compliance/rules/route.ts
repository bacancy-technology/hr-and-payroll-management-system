import {
  createComplianceRule,
  listComplianceRules,
} from "@/lib/modules/compliance/services/compliance-rule-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readRequiredDate,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listComplianceRules(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createComplianceRule(supabase, organizationId, {
        name: readRequiredString(body, "name", "Rule name"),
        jurisdiction: readRequiredString(body, "jurisdiction", "Jurisdiction"),
        category: readRequiredString(body, "category", "Category"),
        deadlineDate: readRequiredDate(body, "deadlineDate", "Deadline date"),
        status: readOptionalString(body, "status"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
