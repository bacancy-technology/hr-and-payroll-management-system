import {
  deleteContractor,
  getContractorById,
  updateContractor,
} from "@/lib/modules/contractors/services/contractor-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface ContractorRouteProps {
  params: Promise<{
    contractorId: string;
  }>;
}

export async function GET(_request: Request, { params }: ContractorRouteProps) {
  try {
    const { contractorId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getContractorById(supabase, organizationId, contractorId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: ContractorRouteProps) {
  try {
    const { contractorId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateContractor(supabase, organizationId, contractorId, {
        fullName: readOptionalString(body, "fullName"),
        email: readOptionalString(body, "email"),
        specialization: readOptionalString(body, "specialization"),
        status: readOptionalString(body, "status"),
        location: readOptionalString(body, "location"),
        paymentType: readOptionalString(body, "paymentType"),
        hourlyRate: readOptionalNumber(body, "hourlyRate"),
        flatRate: readOptionalNumber(body, "flatRate"),
        taxClassification: readOptionalString(body, "taxClassification"),
        contractStartDate: readOptionalDate(body, "contractStartDate"),
        contractEndDate: body.contractEndDate === null ? null : readOptionalDate(body, "contractEndDate"),
        managerName: readOptionalString(body, "managerName"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: ContractorRouteProps) {
  try {
    const { contractorId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteContractor(supabase, organizationId, contractorId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
