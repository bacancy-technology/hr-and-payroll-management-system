import { ApiError } from "@/lib/api/errors";
import type { AuthenticatedSupabaseClient } from "@/lib/api/context";
import { createApproval } from "@/lib/services/approval-service";
import { getEmployeeSummaryInOrganization } from "@/lib/services/org-reference-service";

interface PtoRequestInput {
  employeeId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  status?: string;
  approverName?: string;
  notes?: string | null;
}

interface PtoRequestRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  approver_name: string;
  notes: string | null;
  created_at: string;
  employees:
    | {
        id: string;
        full_name: string;
        email: string;
      }
    | {
        id: string;
        full_name: string;
        email: string;
      }[]
    | null;
}

const PTO_SELECT = `
  id,
  employee_id,
  employee_name,
  type,
  start_date,
  end_date,
  days,
  status,
  approver_name,
  notes,
  created_at,
  employees (
    id,
    full_name,
    email
  )
`;

function normalizeEmployeeRelation(value: PtoRequestRow["employees"]) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizePtoRequest(row: PtoRequestRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    status: row.status,
    approverName: row.approver_name,
    notes: row.notes,
    createdAt: row.created_at,
    employee: normalizeEmployeeRelation(row.employees),
  };
}

function validateDateRange(startDate: string, endDate: string) {
  if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new ApiError(400, "PTO endDate must be on or after startDate.");
  }
}

export async function listPtoRequests(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("leave_requests")
    .select(PTO_SELECT)
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load PTO requests.", error.message);
  }

  return ((data as PtoRequestRow[] | null) ?? []).map((row) => normalizePtoRequest(row));
}

export async function getPtoRequestById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  requestId: string,
) {
  const { data, error } = await supabase
    .from("leave_requests")
    .select(PTO_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the PTO request.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "PTO request not found.");
  }

  return normalizePtoRequest(data as PtoRequestRow);
}

export async function createPtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<PtoRequestInput, "employeeId" | "type" | "startDate" | "endDate" | "days" | "approverName">> & PtoRequestInput,
) {
  validateDateRange(input.startDate, input.endDate);

  const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId);
  const status = input.status ?? "Pending";

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      days: input.days,
      status,
      approver_name: input.approverName,
      notes: input.notes ?? null,
    })
    .select(PTO_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the PTO request.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "PTO request creation did not return a record.");
  }

  const request = normalizePtoRequest(data as PtoRequestRow);

  await createApproval(supabase, organizationId, {
    entityType: "leave_request",
    entityId: request.id,
    requestedByName: request.employeeName,
    assignedToName: request.approverName,
    status,
    decisionNote: input.notes ?? null,
    decidedAt: status === "Approved" || status === "Rejected" ? new Date().toISOString() : null,
  });

  return request;
}

export async function updatePtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  requestId: string,
  input: PtoRequestInput,
) {
  const current = await getPtoRequestById(supabase, organizationId, requestId);
  const nextStartDate = input.startDate ?? current.startDate;
  const nextEndDate = input.endDate ?? current.endDate;

  validateDateRange(nextStartDate, nextEndDate);

  let employeeId = input.employeeId ?? current.employeeId;
  let employeeName = current.employeeName;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
    employeeName = employee.full_name;
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: employeeId,
      employee_name: employeeName,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      days: input.days,
      status: input.status,
      approver_name: input.approverName,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one PTO request field must be provided.");
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", requestId)
    .select(PTO_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the PTO request.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "PTO request not found.");
  }

  return normalizePtoRequest(data as PtoRequestRow);
}

export async function deletePtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  requestId: string,
) {
  const { error } = await supabase
    .from("leave_requests")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", requestId);

  if (error) {
    throw new ApiError(500, "Failed to delete the PTO request.", error.message);
  }

  const { error: approvalError } = await supabase
    .from("approvals")
    .delete()
    .eq("organization_id", organizationId)
    .eq("entity_type", "leave_request")
    .eq("entity_id", requestId);

  if (approvalError) {
    throw new ApiError(500, "Failed to delete the linked approval record.", approvalError.message);
  }
}
