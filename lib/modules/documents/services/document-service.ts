import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface DocumentFilters {
  entityType?: string;
  entityId?: string;
  category?: string;
  visibility?: string;
}

interface DocumentInput {
  entityType?: string;
  entityId?: string;
  category?: string;
  fileName?: string;
  storagePath?: string;
  mimeType?: string;
  sizeBytes?: number;
  status?: string;
  visibility?: string;
}

interface DocumentRow {
  id: string;
  entity_type: string;
  entity_id: string;
  category: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  visibility: string;
  uploaded_by_name: string;
  created_at: string;
}

function normalizeDocument(row: DocumentRow) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    category: row.category,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    visibility: row.visibility,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at,
  };
}

async function ensureEntityReference(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  entityType: string,
  entityId: string,
) {
  if (entityType === "company") {
    if (entityId !== organizationId) {
      throw new ApiError(400, "Company documents must use the current organization ID as entityId.");
    }

    return;
  }

  if (entityType === "employee") {
    await getEmployeeSummaryInOrganization(supabase, organizationId, entityId);
    return;
  }

  if (entityType === "payroll_run") {
    const { data, error } = await supabase
      .from("payroll_runs")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("id", entityId)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "Failed to validate the payroll run reference.", error.message);
    }

    if (!data) {
      throw new ApiError(404, "Payroll run not found.");
    }

    return;
  }

  throw new ApiError(400, "Unsupported document entityType.");
}

export async function listDocuments(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: DocumentFilters = {},
) {
  let query = supabase
    .from("documents")
    .select("id, entity_type, entity_id, category, file_name, storage_path, mime_type, size_bytes, status, visibility, uploaded_by_name, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.entityType) {
    query = query.eq("entity_type", filters.entityType);
  }

  if (filters.entityId) {
    query = query.eq("entity_id", filters.entityId);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.visibility) {
    query = query.eq("visibility", filters.visibility);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load documents.", error.message);
  }

  return ((data as DocumentRow[] | null) ?? []).map((row) => normalizeDocument(row));
}

export async function getDocumentById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  documentId: string,
) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, entity_type, entity_id, category, file_name, storage_path, mime_type, size_bytes, status, visibility, uploaded_by_name, created_at")
    .eq("organization_id", organizationId)
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the document.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Document not found.");
  }

  return normalizeDocument(data as DocumentRow);
}

export async function createDocument(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  uploadedByName: string,
  input: Required<
    Pick<DocumentInput, "entityType" | "entityId" | "category" | "fileName" | "storagePath" | "mimeType" | "sizeBytes">
  > &
    DocumentInput,
) {
  await ensureEntityReference(supabase, organizationId, input.entityType, input.entityId);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: organizationId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      category: input.category,
      file_name: input.fileName,
      storage_path: input.storagePath,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      status: input.status ?? "Active",
      visibility: input.visibility ?? "Private",
      uploaded_by_name: uploadedByName,
    })
    .select("id, entity_type, entity_id, category, file_name, storage_path, mime_type, size_bytes, status, visibility, uploaded_by_name, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the document record.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Document creation did not return a record.");
  }

  return normalizeDocument(data as DocumentRow);
}

export async function updateDocument(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  documentId: string,
  input: DocumentInput,
) {
  const current = await getDocumentById(supabase, organizationId, documentId);
  const nextEntityType = input.entityType ?? current.entityType;
  const nextEntityId = input.entityId ?? current.entityId;

  if (input.entityType !== undefined || input.entityId !== undefined) {
    await ensureEntityReference(supabase, organizationId, nextEntityType, nextEntityId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      entity_type: input.entityType,
      entity_id: input.entityId,
      category: input.category,
      file_name: input.fileName,
      storage_path: input.storagePath,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      status: input.status,
      visibility: input.visibility,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one document field must be provided.");
  }

  const { data, error } = await supabase
    .from("documents")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", documentId)
    .select("id, entity_type, entity_id, category, file_name, storage_path, mime_type, size_bytes, status, visibility, uploaded_by_name, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the document.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Document not found.");
  }

  return normalizeDocument(data as DocumentRow);
}

export async function deleteDocument(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  documentId: string,
) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", documentId);

  if (error) {
    throw new ApiError(500, "Failed to delete the document.", error.message);
  }
}
