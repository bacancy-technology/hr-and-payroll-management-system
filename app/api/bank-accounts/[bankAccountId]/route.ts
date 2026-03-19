import {
  deleteBankAccount,
  getBankAccountById,
  updateBankAccount,
} from "@/lib/modules/direct-deposit/services/bank-account-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readOptionalUuid,
} from "@/lib/modules/shared/api/validation";

interface BankAccountRouteProps {
  params: Promise<{
    bankAccountId: string;
  }>;
}

export async function GET(_request: Request, { params }: BankAccountRouteProps) {
  try {
    const { bankAccountId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getBankAccountById(supabase, organizationId, bankAccountId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: BankAccountRouteProps) {
  try {
    const { bankAccountId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    const isPrimary =
      body.isPrimary === undefined
        ? undefined
        : typeof body.isPrimary === "boolean"
          ? body.isPrimary
          : (() => {
              throw new ApiError(400, "isPrimary must be a boolean.");
            })();

    return ok(
      await updateBankAccount(supabase, organizationId, bankAccountId, {
        employeeId: readOptionalUuid(body, "employeeId"),
        accountHolderName: readOptionalString(body, "accountHolderName"),
        bankName: readOptionalString(body, "bankName"),
        accountType: readOptionalString(body, "accountType"),
        status: readOptionalString(body, "status"),
        isPrimary,
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: BankAccountRouteProps) {
  try {
    const { bankAccountId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteBankAccount(supabase, organizationId, bankAccountId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
