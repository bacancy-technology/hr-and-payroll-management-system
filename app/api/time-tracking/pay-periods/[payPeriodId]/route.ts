import {
  deletePayPeriod,
  getPayPeriodById,
  updatePayPeriod,
} from "@/lib/modules/time-tracking/services/pay-period-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface PayPeriodRouteProps {
  params: Promise<{
    payPeriodId: string;
  }>;
}

export async function GET(_request: Request, { params }: PayPeriodRouteProps) {
  try {
    const { payPeriodId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getPayPeriodById(supabase, organizationId, payPeriodId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: PayPeriodRouteProps) {
  try {
    const { payPeriodId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updatePayPeriod(supabase, organizationId, payPeriodId, {
        label: readOptionalString(body, "label"),
        startDate: readOptionalDate(body, "startDate"),
        endDate: readOptionalDate(body, "endDate"),
        payDate: readOptionalDate(body, "payDate"),
        status: readOptionalString(body, "status"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: PayPeriodRouteProps) {
  try {
    const { payPeriodId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deletePayPeriod(supabase, organizationId, payPeriodId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
