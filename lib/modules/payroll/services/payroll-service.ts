import { upsertApprovalByEntity } from "@/lib/modules/approvals/services/approval-service";
import type { ApiContext, AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { ensurePayPeriodExistsInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface PayrollRunInput {
  payPeriodId?: string | null;
  periodLabel?: string;
  payDate?: string;
  status?: string;
  varianceNote?: string;
  notes?: string | null;
}

interface PayrollRunRow {
  id: string;
  pay_period_id: string | null;
  period_label: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_amount: number;
  variance_note: string;
  notes: string | null;
  calculated_at: string | null;
  finalized_at: string | null;
  created_at: string;
  pay_periods:
    | {
        id: string;
        label: string;
        start_date: string;
        end_date: string;
        pay_date: string;
        status: string;
      }
    | {
        id: string;
        label: string;
        start_date: string;
        end_date: string;
        pay_date: string;
        status: string;
      }[]
    | null;
}

interface PayrollItemRow {
  id: string;
  gross_pay: number;
  tax_amount: number;
  deductions_amount: number;
  net_pay: number;
  status: string;
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

const PAYROLL_RUN_SELECT = `
  id,
  pay_period_id,
  period_label,
  pay_date,
  status,
  employee_count,
  total_amount,
  variance_note,
  notes,
  calculated_at,
  finalized_at,
  created_at,
  pay_periods (
    id,
    label,
    start_date,
    end_date,
    pay_date,
    status
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizePayrollRun(row: PayrollRunRow) {
  return {
    id: row.id,
    payPeriodId: row.pay_period_id,
    periodLabel: row.period_label,
    payDate: row.pay_date,
    status: row.status,
    employeeCount: row.employee_count,
    totalAmount: row.total_amount,
    varianceNote: row.variance_note,
    notes: row.notes,
    calculatedAt: row.calculated_at,
    finalizedAt: row.finalized_at,
    createdAt: row.created_at,
    payPeriod: normalizeRelation(row.pay_periods),
  };
}

function normalizePayrollItem(row: PayrollItemRow) {
  return {
    id: row.id,
    grossPay: row.gross_pay,
    taxAmount: row.tax_amount,
    deductionsAmount: row.deductions_amount,
    netPay: row.net_pay,
    status: row.status,
    employee: normalizeRelation(row.employees),
  };
}

export async function listPayrollRuns(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("payroll_runs")
    .select(PAYROLL_RUN_SELECT)
    .eq("organization_id", organizationId)
    .order("pay_date", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load payroll runs.", error.message);
  }

  return ((data as PayrollRunRow[] | null) ?? []).map((row) => normalizePayrollRun(row));
}

export async function getPayrollRunById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  runId: string,
) {
  const { data, error } = await supabase
    .from("payroll_runs")
    .select(PAYROLL_RUN_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the payroll run.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Payroll run not found.");
  }

  const { data: items, error: itemsError } = await supabase
    .from("payroll_items")
    .select(
      `
        id,
        gross_pay,
        tax_amount,
        deductions_amount,
        net_pay,
        status,
        employees (
          id,
          full_name,
          email
        )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("payroll_run_id", runId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new ApiError(500, "Failed to load payroll items.", itemsError.message);
  }

  return {
    ...normalizePayrollRun(data as PayrollRunRow),
    items: ((items as PayrollItemRow[] | null) ?? []).map((item) => normalizePayrollItem(item)),
  };
}

export async function createPayrollRun(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<PayrollRunInput, "periodLabel" | "payDate">> & PayrollRunInput,
) {
  if (input.payPeriodId) {
    await ensurePayPeriodExistsInOrganization(supabase, organizationId, input.payPeriodId);
  }

  const { data, error } = await supabase
    .from("payroll_runs")
    .insert({
      organization_id: organizationId,
      pay_period_id: input.payPeriodId ?? null,
      period_label: input.periodLabel,
      pay_date: input.payDate,
      status: input.status ?? "Scheduled",
      employee_count: 0,
      total_amount: 0,
      variance_note: input.varianceNote ?? "Awaiting calculation",
      notes: input.notes ?? null,
    })
    .select(PAYROLL_RUN_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the payroll run.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Payroll run creation did not return a record.");
  }

  return normalizePayrollRun(data as PayrollRunRow);
}

export async function updatePayrollRun(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  runId: string,
  input: PayrollRunInput,
) {
  if (input.payPeriodId) {
    await ensurePayPeriodExistsInOrganization(supabase, organizationId, input.payPeriodId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      pay_period_id: input.payPeriodId,
      period_label: input.periodLabel,
      pay_date: input.payDate,
      status: input.status,
      variance_note: input.varianceNote,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one payroll run field must be provided.");
  }

  const { data, error } = await supabase
    .from("payroll_runs")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", runId)
    .select(PAYROLL_RUN_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the payroll run.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Payroll run not found.");
  }

  return normalizePayrollRun(data as PayrollRunRow);
}

export async function deletePayrollRun(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  runId: string,
) {
  const { error } = await supabase
    .from("payroll_runs")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", runId);

  if (error) {
    throw new ApiError(500, "Failed to delete the payroll run.", error.message);
  }
}

async function calculateEmployeePayrollItems(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  payPeriodId: string,
) {
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, full_name, salary, status")
    .eq("organization_id", organizationId)
    .neq("status", "Inactive");

  if (employeesError) {
    throw new ApiError(500, "Failed to load employees for payroll calculation.", employeesError.message);
  }

  const { data: timeEntries, error: timeEntriesError } = await supabase
    .from("time_entries")
    .select("employee_id, overtime_hours, status")
    .eq("organization_id", organizationId)
    .eq("pay_period_id", payPeriodId)
    .in("status", ["Approved", "Submitted"]);

  if (timeEntriesError) {
    throw new ApiError(500, "Failed to load time entries for payroll calculation.", timeEntriesError.message);
  }

  const overtimeByEmployee = new Map<string, number>();

  for (const entry of timeEntries ?? []) {
    overtimeByEmployee.set(entry.employee_id, (overtimeByEmployee.get(entry.employee_id) ?? 0) + Number(entry.overtime_hours));
  }

  return (employees ?? []).map((employee) => {
    const basePay = Number((Number(employee.salary) / 24).toFixed(2));
    const hourlyRate = Number((Number(employee.salary) / 2080).toFixed(2));
    const overtimeHours = overtimeByEmployee.get(employee.id) ?? 0;
    const overtimePay = Number((hourlyRate * overtimeHours * 1.5).toFixed(2));
    const grossPay = Number((basePay + overtimePay).toFixed(2));
    const taxAmount = Number((grossPay * 0.2).toFixed(2));
    const deductionsAmount = Number((grossPay * 0.05).toFixed(2));
    const netPay = Number((grossPay - taxAmount - deductionsAmount).toFixed(2));

    return {
      employeeId: employee.id,
      employeeName: employee.full_name,
      grossPay,
      taxAmount,
      deductionsAmount,
      netPay,
    };
  });
}

export async function calculatePayrollRun(context: ApiContext, runId: string) {
  const { supabase, organizationId } = context;
  const run = await getPayrollRunById(supabase, organizationId, runId);

  if (!run.payPeriodId) {
    throw new ApiError(400, "Payroll calculation requires the run to be linked to a pay period.");
  }

  const calculatedItems = await calculateEmployeePayrollItems(supabase, organizationId, run.payPeriodId);
  const itemsPayload = calculatedItems.map((item) => ({
    organization_id: organizationId,
    payroll_run_id: runId,
    employee_id: item.employeeId,
    gross_pay: item.grossPay,
    tax_amount: item.taxAmount,
    deductions_amount: item.deductionsAmount,
    net_pay: item.netPay,
    status: "Calculated",
  }));

  const { error: itemsError } = await supabase.from("payroll_items").upsert(itemsPayload, {
    onConflict: "payroll_run_id,employee_id",
  });

  if (itemsError) {
    throw new ApiError(500, "Failed to persist payroll items.", itemsError.message);
  }

  const totalAmount = Number(calculatedItems.reduce((sum, item) => sum + item.netPay, 0).toFixed(2));

  const { error: runError } = await supabase
    .from("payroll_runs")
    .update({
      status: "Calculated",
      employee_count: calculatedItems.length,
      total_amount: totalAmount,
      variance_note: `${calculatedItems.length} payroll items recalculated`,
      calculated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", runId);

  if (runError) {
    throw new ApiError(500, "Failed to update payroll run totals.", runError.message);
  }

  return getPayrollRunById(supabase, organizationId, runId);
}

export async function approvePayrollRun(context: ApiContext, runId: string, decisionNote?: string | null) {
  const { supabase, organizationId, profile } = context;
  const run = await getPayrollRunById(supabase, organizationId, runId);

  const { error } = await supabase
    .from("payroll_runs")
    .update({
      status: "Approved",
      notes: decisionNote ?? run.notes ?? null,
    })
    .eq("organization_id", organizationId)
    .eq("id", runId);

  if (error) {
    throw new ApiError(500, "Failed to approve the payroll run.", error.message);
  }

  await upsertApprovalByEntity(supabase, organizationId, {
    entityType: "payroll_run",
    entityId: runId,
    requestedByName: profile.full_name,
    assignedToName: profile.full_name,
    status: "Approved",
    decisionNote: decisionNote ?? "Payroll approved for finalization.",
    decidedAt: new Date().toISOString(),
  });

  return getPayrollRunById(supabase, organizationId, runId);
}

export async function finalizePayrollRun(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  runId: string,
) {
  const { error: itemsError } = await supabase
    .from("payroll_items")
    .update({
      status: "Paid",
    })
    .eq("organization_id", organizationId)
    .eq("payroll_run_id", runId);

  if (itemsError) {
    throw new ApiError(500, "Failed to finalize payroll items.", itemsError.message);
  }

  const { error } = await supabase
    .from("payroll_runs")
    .update({
      status: "Paid",
      finalized_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", runId);

  if (error) {
    throw new ApiError(500, "Failed to finalize the payroll run.", error.message);
  }

  return getPayrollRunById(supabase, organizationId, runId);
}
