import { ApiError } from "@/lib/api/errors";
import { requireApiContext } from "@/lib/api/context";
import { created, handleRouteError, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalDate, readOptionalString, readRequiredString } from "@/lib/api/validation";
import { createPayPeriod, listPayPeriods } from "@/lib/services/pay-period-service";

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
