import {
  createPayPeriod,
  listPayPeriods,
} from "@/lib/modules/time-tracking/services/pay-period-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listPayPeriods(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const startDate = readOptionalDate(body, "startDate");
    const endDate = readOptionalDate(body, "endDate");
    const payDate = readOptionalDate(body, "payDate");

    if (!startDate || !endDate || !payDate) {
      throw new ApiError(400, "Pay period startDate, endDate, and payDate are required.");
    }

    return created(
      await createPayPeriod(supabase, organizationId, {
        label: readRequiredString(body, "label", "Pay period label"),
        startDate,
        endDate,
        payDate,
        status: readOptionalString(body, "status") ?? "Open",
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
