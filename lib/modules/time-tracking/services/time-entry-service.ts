import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import {
  ensureEmployeeExistsInOrganization,
  ensurePayPeriodExistsInOrganization,
} from "@/lib/modules/shared/services/org-reference-service";

interface TimeEntryInput {
  employeeId?: string;
  payPeriodId?: string | null;
  workDate?: string;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  breakMinutes?: number;
  status?: string;
  notes?: string | null;
}

interface TimeEntryFilters {
  employeeId?: string;
  payPeriodId?: string;
  workDate?: string;
}

interface TimeEntryRow {
  id: string;
  work_date: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  break_minutes: number;
  hours_worked: number;
  overtime_hours: number;
  status: string;
  notes: string | null;
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
  pay_periods:
    | {
        id: string;
        label: string;
        start_date: string;
        end_date: string;
        pay_date: string;
      }
    | {
        id: string;
        label: string;
        start_date: string;
        end_date: string;
        pay_date: string;
      }[]
    | null;
}

const TIME_ENTRY_SELECT = `
  id,
  work_date,
  clock_in_at,
  clock_out_at,
  break_minutes,
  hours_worked,
  overtime_hours,
  status,
  notes,
  employees (
    id,
    full_name,
    email
  ),
  pay_periods (
    id,
    label,
    start_date,
    end_date,
    pay_date
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function calculateWorkedHours(clockInAt: string | null, clockOutAt: string | null, breakMinutes: number) {
  if (!clockInAt || !clockOutAt) {
    return {
      hoursWorked: 0,
      overtimeHours: 0,
    };
  }

  const durationMs = new Date(clockOutAt).getTime() - new Date(clockInAt).getTime();

  if (durationMs < 0) {
    throw new ApiError(400, "clockOutAt must be after clockInAt.");
  }

  const rawHours = durationMs / (1000 * 60 * 60) - breakMinutes / 60;
  const hoursWorked = Math.max(0, Number(rawHours.toFixed(2)));
  const overtimeHours = Number(Math.max(0, hoursWorked - 8).toFixed(2));

  return {
    hoursWorked,
    overtimeHours,
  };
}

function normalizeTimeEntry(row: TimeEntryRow) {
  const employee = normalizeRelation(row.employees);
  const payPeriod = normalizeRelation(row.pay_periods);

  return {
    id: row.id,
    workDate: row.work_date,
    clockInAt: row.clock_in_at,
    clockOutAt: row.clock_out_at,
    breakMinutes: row.break_minutes,
    hoursWorked: row.hours_worked,
    overtimeHours: row.overtime_hours,
    status: row.status,
    notes: row.notes,
    employee,
    payPeriod,
  };
}

export async function listTimeEntries(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: TimeEntryFilters = {},
) {
  let query = supabase
    .from("time_entries")
    .select(TIME_ENTRY_SELECT)
    .eq("organization_id", organizationId)
    .order("work_date", { ascending: false });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.payPeriodId) {
    query = query.eq("pay_period_id", filters.payPeriodId);
  }

  if (filters.workDate) {
    query = query.eq("work_date", filters.workDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load time entries.", error.message);
  }

  return ((data as TimeEntryRow[] | null) ?? []).map((row) => normalizeTimeEntry(row));
}

export async function getTimeEntryById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  timeEntryId: string,
) {
  const { data, error } = await supabase
    .from("time_entries")
    .select(TIME_ENTRY_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", timeEntryId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the time entry.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Time entry not found.");
  }

  return normalizeTimeEntry(data as TimeEntryRow);
}

export async function createTimeEntry(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<TimeEntryInput, "employeeId" | "workDate">> & TimeEntryInput,
) {
  await ensureEmployeeExistsInOrganization(supabase, organizationId, input.employeeId);

  if (input.payPeriodId) {
    await ensurePayPeriodExistsInOrganization(supabase, organizationId, input.payPeriodId);
  }

  const breakMinutes = input.breakMinutes ?? 0;
  const { hoursWorked, overtimeHours } = calculateWorkedHours(input.clockInAt ?? null, input.clockOutAt ?? null, breakMinutes);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      organization_id: organizationId,
      employee_id: input.employeeId,
      pay_period_id: input.payPeriodId ?? null,
      work_date: input.workDate,
      clock_in_at: input.clockInAt ?? null,
      clock_out_at: input.clockOutAt ?? null,
      break_minutes: breakMinutes,
      hours_worked: hoursWorked,
      overtime_hours: overtimeHours,
      status: input.status ?? "Draft",
      notes: input.notes ?? null,
    })
    .select(TIME_ENTRY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the time entry.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Time entry creation did not return a record.");
  }

  return normalizeTimeEntry(data as TimeEntryRow);
}

export async function updateTimeEntry(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  timeEntryId: string,
  input: TimeEntryInput,
) {
  const current = await getTimeEntryById(supabase, organizationId, timeEntryId);

  if (input.employeeId) {
    await ensureEmployeeExistsInOrganization(supabase, organizationId, input.employeeId);
  }

  if (input.payPeriodId) {
    await ensurePayPeriodExistsInOrganization(supabase, organizationId, input.payPeriodId);
  }

  const nextClockInAt = input.clockInAt === undefined ? current.clockInAt : input.clockInAt;
  const nextClockOutAt = input.clockOutAt === undefined ? current.clockOutAt : input.clockOutAt;
  const nextBreakMinutes = input.breakMinutes ?? current.breakMinutes;
  const { hoursWorked, overtimeHours } = calculateWorkedHours(nextClockInAt ?? null, nextClockOutAt ?? null, nextBreakMinutes);

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: input.employeeId,
      pay_period_id: input.payPeriodId,
      work_date: input.workDate,
      clock_in_at: input.clockInAt,
      clock_out_at: input.clockOutAt,
      break_minutes: input.breakMinutes,
      status: input.status,
      notes: input.notes,
      hours_worked: hoursWorked,
      overtime_hours: overtimeHours,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one time entry field must be provided.");
  }

  const { data, error } = await supabase
    .from("time_entries")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", timeEntryId)
    .select(TIME_ENTRY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the time entry.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Time entry not found.");
  }

  return normalizeTimeEntry(data as TimeEntryRow);
}

export async function deleteTimeEntry(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  timeEntryId: string,
) {
  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", timeEntryId);

  if (error) {
    throw new ApiError(500, "Failed to delete the time entry.", error.message);
  }
}

export async function clockInEmployee(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<TimeEntryInput, "employeeId" | "workDate">> & TimeEntryInput,
) {
  return createTimeEntry(supabase, organizationId, {
    employeeId: input.employeeId,
    payPeriodId: input.payPeriodId ?? null,
    workDate: input.workDate,
    clockInAt: input.clockInAt ?? new Date().toISOString(),
    breakMinutes: 0,
    status: input.status ?? "In Progress",
    notes: input.notes,
  });
}

export async function clockOutEmployee(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  timeEntryId: string,
  input: Pick<TimeEntryInput, "clockOutAt" | "breakMinutes" | "status" | "notes">,
) {
  return updateTimeEntry(supabase, organizationId, timeEntryId, {
    clockOutAt: input.clockOutAt ?? new Date().toISOString(),
    breakMinutes: input.breakMinutes ?? 0,
    status: input.status ?? "Submitted",
    notes: input.notes,
  });
}
