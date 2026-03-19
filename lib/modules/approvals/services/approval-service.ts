import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface ApprovalFilters {
  entityType?: string;
  status?: string;
}

interface ApprovalInput {
  entityType: string;
  entityId: string;
  requestedByName: string;
  assignedToName: string;
  status?: string;
  decisionNote?: string | null;
  decidedAt?: string | null;
}

interface ApprovalDecisionInput {
  status: "Approved" | "Rejected" | "In Review";
  decisionNote?: string | null;
}

function normalizeApproval(row: {
  id: string;
  entity_type: string;
  entity_id: string;
  requested_by_name: string;
  assigned_to_name: string;
  status: string;
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    requestedByName: row.requested_by_name,
    assignedToName: row.assigned_to_name,
    status: row.status,
    decisionNote: row.decision_note,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
  };
}

export async function listApprovals(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: ApprovalFilters = {},
) {
  let query = supabase
    .from("approvals")
    .select("id, entity_type, entity_id, requested_by_name, assigned_to_name, status, decision_note, decided_at, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.entityType) {
    query = query.eq("entity_type", filters.entityType);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load approvals.", error.message);
  }

  return (data ?? []).map((row) => normalizeApproval(row));
}

export async function getApprovalById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  approvalId: string,
) {
  const { data, error } = await supabase
    .from("approvals")
    .select("id, entity_type, entity_id, requested_by_name, assigned_to_name, status, decision_note, decided_at, created_at")
    .eq("organization_id", organizationId)
    .eq("id", approvalId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the approval.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Approval not found.");
  }

  return normalizeApproval(data);
}

export async function createApproval(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: ApprovalInput,
) {
  const { data, error } = await supabase
    .from("approvals")
    .insert({
      organization_id: organizationId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      requested_by_name: input.requestedByName,
      assigned_to_name: input.assignedToName,
      status: input.status ?? "Pending",
      decision_note: input.decisionNote ?? null,
      decided_at: input.decidedAt ?? null,
    })
    .select("id, entity_type, entity_id, requested_by_name, assigned_to_name, status, decision_note, decided_at, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the approval.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Approval creation did not return a record.");
  }

  return normalizeApproval(data);
}

export async function upsertApprovalByEntity(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: ApprovalInput,
) {
  const { data: existing, error: existingError } = await supabase
    .from("approvals")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .maybeSingle();

  if (existingError) {
    throw new ApiError(500, "Failed to load the existing approval.", existingError.message);
  }

  if (!existing) {
    return createApproval(supabase, organizationId, input);
  }

  const { data, error } = await supabase
    .from("approvals")
    .update({
      requested_by_name: input.requestedByName,
      assigned_to_name: input.assignedToName,
      status: input.status ?? "Pending",
      decision_note: input.decisionNote ?? null,
      decided_at: input.decidedAt ?? null,
    })
    .eq("organization_id", organizationId)
    .eq("id", existing.id)
    .select("id, entity_type, entity_id, requested_by_name, assigned_to_name, status, decision_note, decided_at, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the approval.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Approval not found.");
  }

  return normalizeApproval(data);
}

async function syncEntityStatus(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  approval: ReturnType<typeof normalizeApproval>,
) {
  if (approval.entityType === "leave_request") {
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status: approval.status,
        approver_name: approval.assignedToName,
        notes: approval.decisionNote ?? null,
      })
      .eq("organization_id", organizationId)
      .eq("id", approval.entityId);

    if (error) {
      throw new ApiError(500, "Failed to sync the approval decision to the PTO request.", error.message);
    }

    return;
  }

  if (approval.entityType === "expense") {
    const { error } = await supabase
      .from("expenses")
      .update({
        status: approval.status,
        approver_name: approval.assignedToName,
        notes: approval.decisionNote ?? null,
      })
      .eq("organization_id", organizationId)
      .eq("id", approval.entityId);

    if (error) {
      throw new ApiError(500, "Failed to sync the approval decision to the expense.", error.message);
    }
  }
}

export async function decideApproval(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  approvalId: string,
  input: ApprovalDecisionInput,
) {
  const { data, error } = await supabase
    .from("approvals")
    .update({
      status: input.status,
      decision_note: input.decisionNote ?? null,
      decided_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", approvalId)
    .select("id, entity_type, entity_id, requested_by_name, assigned_to_name, status, decision_note, decided_at, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the approval.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Approval not found.");
  }

  const normalized = normalizeApproval(data);
  await syncEntityStatus(supabase, organizationId, normalized);

  return normalized;
}
