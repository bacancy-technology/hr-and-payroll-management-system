import {
  deleteComplianceAlert,
  getComplianceAlertById,
  updateComplianceAlert,
} from "@/lib/modules/compliance/services/compliance-alert-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface ComplianceAlertRouteProps {
  params: Promise<{
    alertId: string;
  }>;
}

export async function GET(_request: Request, { params }: ComplianceAlertRouteProps) {
  try {
    const { alertId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getComplianceAlertById(supabase, organizationId, alertId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: ComplianceAlertRouteProps) {
  try {
    const { alertId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateComplianceAlert(supabase, organizationId, alertId, {
        ruleId: readOptionalUuid(body, "ruleId"),
        severity: readOptionalString(body, "severity"),
        title: readOptionalString(body, "title"),
        message: readOptionalString(body, "message"),
        status: readOptionalString(body, "status"),
        dueDate: readOptionalDate(body, "dueDate"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: ComplianceAlertRouteProps) {
  try {
    const { alertId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteComplianceAlert(supabase, organizationId, alertId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
