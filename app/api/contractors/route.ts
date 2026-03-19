import {
  createContractor,
  listContractors,
} from "@/lib/modules/contractors/services/contractor-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalDate,
  readRequiredDate,
  readRequiredEmail,
  readRequiredNumber,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET() {
  try {
    const { supabase, organizationId } = await requireApiContext();

    return ok(await listContractors(supabase, organizationId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);
    const contractEndDate = body.contractEndDate === null ? null : readOptionalDate(body, "contractEndDate");

    return created(
      await createContractor(supabase, organizationId, {
        fullName: readRequiredString(body, "fullName", "Full name"),
        email: readRequiredEmail(body, "email", "Email"),
        specialization: readRequiredString(body, "specialization", "Specialization"),
        status: readRequiredString(body, "status", "Status"),
        location: readRequiredString(body, "location", "Location"),
        paymentType: readRequiredString(body, "paymentType", "Payment type"),
        hourlyRate: readRequiredNumber(body, "hourlyRate", "Hourly rate"),
        flatRate: readRequiredNumber(body, "flatRate", "Flat rate"),
        taxClassification: readRequiredString(body, "taxClassification", "Tax classification"),
        contractStartDate: readRequiredDate(body, "contractStartDate", "Contract start date"),
        contractEndDate,
        managerName: readRequiredString(body, "managerName", "Manager name"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
