import {
  deleteComplianceRule,
  getComplianceRuleById,
  updateComplianceRule,
} from "@/lib/modules/compliance/services/compliance-rule-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface ComplianceRuleRouteProps {
  params: Promise<{
    ruleId: string;
  }>;
}

export async function GET(_request: Request, { params }: ComplianceRuleRouteProps) {
  try {
    const { ruleId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getComplianceRuleById(supabase, organizationId, ruleId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: ComplianceRuleRouteProps) {
  try {
    const { ruleId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateComplianceRule(supabase, organizationId, ruleId, {
        name: readOptionalString(body, "name"),
        jurisdiction: readOptionalString(body, "jurisdiction"),
        category: readOptionalString(body, "category"),
        deadlineDate: readOptionalDate(body, "deadlineDate"),
        status: readOptionalString(body, "status"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: ComplianceRuleRouteProps) {
  try {
    const { ruleId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteComplianceRule(supabase, organizationId, ruleId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
