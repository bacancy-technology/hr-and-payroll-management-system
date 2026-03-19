import { requireApiContext } from "@/lib/api/context";
import { handleRouteError, noContent, ok } from "@/lib/api/http";
import { readJsonBody, readOptionalNumber, readOptionalString } from "@/lib/api/validation";
import { deleteDocument, getDocumentById, updateDocument } from "@/lib/services/document-service";

interface DocumentRouteProps {
  params: Promise<{
    documentId: string;
  }>;
}

export async function GET(_request: Request, { params }: DocumentRouteProps) {
  try {
    const { documentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    return ok(await getDocumentById(supabase, organizationId, documentId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: DocumentRouteProps) {
  try {
    const { documentId } = await params;
    const { supabase, organizationId } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await updateDocument(supabase, organizationId, documentId, {
        entityType: readOptionalString(body, "entityType"),
        entityId: readOptionalString(body, "entityId"),
        category: readOptionalString(body, "category"),
        fileName: readOptionalString(body, "fileName"),
        storagePath: readOptionalString(body, "storagePath"),
        mimeType: readOptionalString(body, "mimeType"),
        sizeBytes: readOptionalNumber(body, "sizeBytes"),
        status: readOptionalString(body, "status"),
        visibility: readOptionalString(body, "visibility"),
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: DocumentRouteProps) {
  try {
    const { documentId } = await params;
    const { supabase, organizationId } = await requireApiContext();

    await deleteDocument(supabase, organizationId, documentId);

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
