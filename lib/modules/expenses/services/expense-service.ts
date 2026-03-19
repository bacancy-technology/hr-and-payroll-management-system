import { createApproval, upsertApprovalByEntity } from "@/lib/modules/approvals/services/approval-service";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface ExpenseFilters {
  employeeId?: string;
  status?: string;
  category?: string;
}

interface ExpenseInput {
  employeeId?: string;
  category?: string;
  description?: string;
  amount?: number;
  currency?: string;
  incurredOn?: string;
  status?: string;
  approverName?: string;
  notes?: string | null;
  receiptFileName?: string | null;
  receiptStoragePath?: string | null;
  receiptMimeType?: string | null;
}

interface ExpenseRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  incurred_on: string;
  status: string;
  approver_name: string;
  notes: string | null;
  receipt_file_name: string | null;
  receipt_storage_path: string | null;
  receipt_mime_type: string | null;
  reimbursed_at: string | null;
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

const EXPENSE_SELECT = `
  id,
  employee_id,
  employee_name,
  category,
  description,
  amount,
  currency,
  incurred_on,
  status,
  approver_name,
  notes,
  receipt_file_name,
  receipt_storage_path,
  receipt_mime_type,
  reimbursed_at,
  created_at,
  employees (
    id,
    full_name,
    email
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeExpense(row: ExpenseRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    category: row.category,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    incurredOn: row.incurred_on,
    status: row.status,
    approverName: row.approver_name,
    notes: row.notes,
    receiptFileName: row.receipt_file_name,
    receiptStoragePath: row.receipt_storage_path,
    receiptMimeType: row.receipt_mime_type,
    reimbursedAt: row.reimbursed_at,
    createdAt: row.created_at,
    employee: normalizeRelation(row.employees),
  };
}

export async function listExpenses(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: ExpenseFilters = {},
) {
  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("organization_id", organizationId)
    .order("incurred_on", { ascending: false });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load expenses.", error.message);
  }

  return ((data as ExpenseRow[] | null) ?? []).map((row) => normalizeExpense(row));
}

export async function getExpenseById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  expenseId: string,
) {
  const { data, error } = await supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", expenseId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the expense.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Expense not found.");
  }

  return normalizeExpense(data as ExpenseRow);
}

export async function createExpense(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<ExpenseInput, "employeeId" | "category" | "description" | "amount" | "currency" | "incurredOn" | "approverName">
  > &
    ExpenseInput,
) {
  const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId);
  const status = input.status ?? "Pending";

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      incurred_on: input.incurredOn,
      status,
      approver_name: input.approverName,
      notes: input.notes ?? null,
      receipt_file_name: input.receiptFileName ?? null,
      receipt_storage_path: input.receiptStoragePath ?? null,
      receipt_mime_type: input.receiptMimeType ?? null,
    })
    .select(EXPENSE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the expense.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Expense creation did not return a record.");
  }

  const expense = normalizeExpense(data as ExpenseRow);

  await createApproval(supabase, organizationId, {
    entityType: "expense",
    entityId: expense.id,
    requestedByName: expense.employeeName,
    assignedToName: expense.approverName,
    status,
    decisionNote: expense.notes,
    decidedAt: status === "Approved" || status === "Rejected" ? new Date().toISOString() : null,
  });

  return expense;
}

export async function updateExpense(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  expenseId: string,
  input: ExpenseInput,
) {
  const current = await getExpenseById(supabase, organizationId, expenseId);
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
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      incurred_on: input.incurredOn,
      status: input.status,
      approver_name: input.approverName,
      notes: input.notes,
      receipt_file_name: input.receiptFileName,
      receipt_storage_path: input.receiptStoragePath,
      receipt_mime_type: input.receiptMimeType,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one expense field must be provided.");
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", expenseId)
    .select(EXPENSE_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the expense.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Expense not found.");
  }

  const expense = normalizeExpense(data as ExpenseRow);

  await upsertApprovalByEntity(supabase, organizationId, {
    entityType: "expense",
    entityId: expense.id,
    requestedByName: expense.employeeName,
    assignedToName: expense.approverName,
    status: expense.status,
    decisionNote: expense.notes,
    decidedAt: expense.status === "Approved" || expense.status === "Rejected" ? new Date().toISOString() : null,
  });

  return expense;
}

export async function deleteExpense(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  expenseId: string,
) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", expenseId);

  if (error) {
    throw new ApiError(500, "Failed to delete the expense.", error.message);
  }

  const { error: approvalError } = await supabase
    .from("approvals")
    .delete()
    .eq("organization_id", organizationId)
    .eq("entity_type", "expense")
    .eq("entity_id", expenseId);

  if (approvalError) {
    throw new ApiError(500, "Failed to delete the linked approval record.", approvalError.message);
  }
}
