import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/lib/modules/expenses/services/expense-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface ExpenseRouteProps {
  params: Promise<{
    expenseId: string;
  }>;
}

export async function GET(_request: Request, { params }: ExpenseRouteProps) {
  try {
    const { expenseId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getExpenseById(supabase, organizationId, expenseId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: ExpenseRouteProps) {
  try {
    const { expenseId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateExpense(supabase, organizationId, expenseId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        category: readOptionalString(body, "category"),
        description: readOptionalString(body, "description"),
        amount: readOptionalNumber(body, "amount"),
        currency: readOptionalString(body, "currency"),
        incurredOn: readOptionalDate(body, "incurredOn"),
        status: readOptionalString(body, "status"),
        approverName: readOptionalString(body, "approverName"),
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

export async function DELETE(_request: Request, { params }: ExpenseRouteProps) {
  try {
    const { expenseId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteExpense(supabase, organizationId, expenseId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
