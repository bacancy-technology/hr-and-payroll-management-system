import {
  createComplianceAlert,
  listComplianceAlerts,
} from "@/lib/modules/compliance/services/compliance-alert-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
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
      await listComplianceAlerts(supabase, organizationId, {
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        severity: readOptionalString({ severity: url.searchParams.get("severity") }, "severity"),
        ruleId: readOptionalUuid({ ruleId: url.searchParams.get("ruleId") }, "ruleId"),
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
      await createComplianceAlert(supabase, organizationId, {
        ruleId: readRequiredUuid(body, "ruleId", "Rule ID"),
        severity: readRequiredString(body, "severity", "Severity"),
        title: readRequiredString(body, "title", "Alert title"),
        message: readRequiredString(body, "message", "Alert message"),
        status: readOptionalString(body, "status"),
        dueDate: readRequiredDate(body, "dueDate", "Due date"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
