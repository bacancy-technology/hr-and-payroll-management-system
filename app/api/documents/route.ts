import { ApiError } from "@/lib/api/errors";
import { requireApiContext } from "@/lib/api/context";
import { created, handleRouteError, ok } from "@/lib/api/http";
import {
  readJsonBody,
  readOptionalNumber,
  readOptionalString,
  readOptionalUuid,
  readRequiredString,
} from "@/lib/api/validation";
import { createDocument, listDocuments } from "@/lib/services/document-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { supabase, organizationId } = await requireApiContext();

    return ok(
      await listDocuments(supabase, organizationId, {
        entityType: searchParams.get("entityType") ?? undefined,
        entityId: searchParams.get("entityId") ?? undefined,
        category: searchParams.get("category") ?? undefined,
        visibility: searchParams.get("visibility") ?? undefined,
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, organizationId, profile } = await requireApiContext();
    const body = await readJsonBody(request);
    const sizeBytes = readOptionalNumber(body, "sizeBytes");

    if (sizeBytes === undefined) {
      throw new ApiError(400, "Document sizeBytes is required.");
    }

    return created(
      await createDocument(supabase, organizationId, profile.full_name, {
        entityType: readRequiredString(body, "entityType", "Document entity type"),
        entityId:
          readRequiredString(body, "entityType", "Document entity type") === "company"
            ? organizationId
            : readRequiredString(body, "entityId", "Document entity ID"),
        category: readRequiredString(body, "category", "Document category"),
        fileName: readRequiredString(body, "fileName", "Document file name"),
        storagePath: readRequiredString(body, "storagePath", "Document storage path"),
        mimeType: readRequiredString(body, "mimeType", "Document mime type"),
        sizeBytes,
        status: readOptionalString(body, "status"),
        visibility: readOptionalString(body, "visibility"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
