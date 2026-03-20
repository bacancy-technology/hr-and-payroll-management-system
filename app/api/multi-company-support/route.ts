import {
  createCompanyEntity,
  getMultiCompanySupportOverview,
  listCompanyEntities,
} from "@/lib/modules/multi-company-support/services/company-entity-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { created, handleRouteError, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readRequiredString,
} from "@/lib/modules/shared/api/validation";

export async function GET(request: Request) {
  try {
    const { supabase, organizationId } = await requireApiContext();
    const url = new URL(request.url);
    const status = readOptionalString({ status: url.searchParams.get("status") }, "status");
    const registrationState = readOptionalString(
      { registrationState: url.searchParams.get("registrationState") },
      "registrationState",
    );
    const entityType = readOptionalString(
      { entityType: url.searchParams.get("entityType") },
      "entityType",
    );

    if (!status && !registrationState && !entityType) {
      return ok(await getMultiCompanySupportOverview(supabase, organizationId));
    }

    return ok(
      await listCompanyEntities(supabase, organizationId, {
        status,
        registrationState,
        entityType,
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
      await createCompanyEntity(supabase, organizationId, {
        name: readRequiredString(body, "name", "Entity name"),
        legalName: readRequiredString(body, "legalName", "Legal name"),
        entityType: readRequiredString(body, "entityType", "Entity type"),
        taxId: body.taxId === null ? null : readOptionalString(body, "taxId"),
        registrationState: readRequiredString(body, "registrationState", "Registration state"),
        headquarters: readRequiredString(body, "headquarters", "Headquarters"),
        payrollFrequency: readRequiredString(body, "payrollFrequency", "Payroll frequency"),
        employeeCount: readRequiredNumber(body, "employeeCount", "Employee count"),
        status: readOptionalString(body, "status"),
        primaryContactName:
          body.primaryContactName === null ? null : readOptionalString(body, "primaryContactName"),
        primaryContactEmail:
          body.primaryContactEmail === null ? null : readOptionalString(body, "primaryContactEmail"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
