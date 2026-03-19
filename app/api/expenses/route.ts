import { createExpense, listExpenses } from "@/lib/modules/expenses/services/expense-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readOptionalUuid,
  readRequiredDate,
  readRequiredNumber,
  readRequiredString,
  readRequiredUuid,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listExpenses(supabase, organizationId, {
        employeeId: readOptionalUuid({ employeeId: url.searchParams.get("employeeId") }, "employeeId"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
        category: readOptionalString({ category: url.searchParams.get("category") }, "category"),
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
      await createExpense(supabase, organizationId, {
        employeeId: readRequiredUuid(body, "employeeId", "Employee ID"),
        category: readRequiredString(body, "category", "Expense category"),
        description: readRequiredString(body, "description", "Expense description"),
        amount: readRequiredNumber(body, "amount", "Expense amount"),
        currency: readRequiredString(body, "currency", "Currency"),
        incurredOn: readRequiredDate(body, "incurredOn", "Expense incurredOn"),
        status: readOptionalString(body, "status"),
        approverName: readRequiredString(body, "approverName", "Approver name"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
        receiptFileName: body.receiptFileName === null ? null : readOptionalString(body, "receiptFileName"),
        receiptStoragePath:
          body.receiptStoragePath === null ? null : readOptionalString(body, "receiptStoragePath"),
        receiptMimeType: body.receiptMimeType === null ? null : readOptionalString(body, "receiptMimeType"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
