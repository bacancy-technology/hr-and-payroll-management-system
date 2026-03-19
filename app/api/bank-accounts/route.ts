import {
  createBankAccount,
  listBankAccounts,
} from "@/lib/modules/direct-deposit/services/bank-account-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
  readRequiredUuid,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);

    return ok(
      await listBankAccounts(supabase, organizationId, {
        employeeId: readOptionalUuid({ employeeId: url.searchParams.get("employeeId") }, "employeeId"),
        status: readOptionalString({ status: url.searchParams.get("status") }, "status"),
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

    const isPrimary =
      body.isPrimary === undefined
        ? undefined
        : typeof body.isPrimary === "boolean"
          ? body.isPrimary
          : (() => {
              throw new ApiError(400, "isPrimary must be a boolean.");
            })();

    return created(
      await createBankAccount(supabase, organizationId, {
        employeeId: readRequiredUuid(body, "employeeId", "Employee ID"),
        accountHolderName: readRequiredString(body, "accountHolderName", "Account holder name"),
        bankName: readRequiredString(body, "bankName", "Bank name"),
        accountType: readRequiredString(body, "accountType", "Account type"),
        accountNumber: readRequiredString(body, "accountNumber", "Account number"),
        routingNumber: readRequiredString(body, "routingNumber", "Routing number"),
        status: readOptionalString(body, "status"),
        isPrimary,
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
