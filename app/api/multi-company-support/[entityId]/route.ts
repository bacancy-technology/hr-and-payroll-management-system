import {
  deleteCompanyEntity,
  getCompanyEntityById,
  updateCompanyEntity,
} from "@/lib/modules/multi-company-support/services/company-entity-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, noContent, ok } from "@/lib/modules/shared/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
} from "@/lib/modules/shared/api/validation";

interface CompanyEntityRouteProps {
  params: Promise<{
    entityId: string;
  }>;
}

export async function GET(_request: Request, { params }: CompanyEntityRouteProps) {
  try {
    const { entityId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getCompanyEntityById(supabase, organizationId, entityId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: CompanyEntityRouteProps) {
  try {
    const { entityId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateCompanyEntity(supabase, organizationId, entityId, {
        name: readOptionalString(body, "name"),
        legalName: readOptionalString(body, "legalName"),
        entityType: readOptionalString(body, "entityType"),
        taxId: body.taxId === null ? null : readOptionalString(body, "taxId"),
        registrationState: readOptionalString(body, "registrationState"),
        headquarters: readOptionalString(body, "headquarters"),
        payrollFrequency: readOptionalString(body, "payrollFrequency"),
        employeeCount: readOptionalNumber(body, "employeeCount"),
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

export async function DELETE(_request: Request, { params }: CompanyEntityRouteProps) {
  try {
    const { entityId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteCompanyEntity(supabase, organizationId, entityId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
