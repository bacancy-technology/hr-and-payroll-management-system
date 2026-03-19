import {
  deleteTaxFiling,
  getTaxFilingById,
  updateTaxFiling,
} from "@/lib/modules/compliance/services/tax-filing-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface TaxFilingRouteProps {
  params: Promise<{
    filingId: string;
  }>;
}

export async function GET(_request: Request, { params }: TaxFilingRouteProps) {
  try {
    const { filingId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getTaxFilingById(supabase, organizationId, filingId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: TaxFilingRouteProps) {
  try {
    const { filingId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateTaxFiling(supabase, organizationId, filingId, {
        filingName: readOptionalString(body, "filingName"),
        jurisdiction: readOptionalString(body, "jurisdiction"),
        periodLabel: readOptionalString(body, "periodLabel"),
        dueDate: readOptionalDate(body, "dueDate"),
        filedAt: body.filedAt === null ? null : readOptionalDate(body, "filedAt"),
        status: readOptionalString(body, "status"),
        amount: readOptionalNumber(body, "amount"),
        notes: body.notes === null ? null : readOptionalString(body, "notes"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: TaxFilingRouteProps) {
  try {
    const { filingId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteTaxFiling(supabase, organizationId, filingId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
