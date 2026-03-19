import {
  createTaxFiling,
  listTaxFilings,
} from "@/lib/modules/compliance/services/tax-filing-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalString,
  readRequiredDate,
  readRequiredNumber,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listTaxFilings(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return created(
      await createTaxFiling(supabase, organizationId, {
        filingName: readRequiredString(body, "filingName", "Filing name"),
        jurisdiction: readRequiredString(body, "jurisdiction", "Jurisdiction"),
        periodLabel: readRequiredString(body, "periodLabel", "Period label"),
        dueDate: readRequiredDate(body, "dueDate", "Due date"),
        filedAt: body.filedAt === null ? null : readOptionalDate(body, "filedAt"),
        status: readOptionalString(body, "status"),
        amount: readRequiredNumber(body, "amount", "Amount"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
