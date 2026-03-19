import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface PayrollCalendarFilters {
  startDate?: string;
  endDate?: string;
}

function withinRange(date: string, filters: PayrollCalendarFilters) {
  if (filters.startDate && date < filters.startDate) {
    return false;
  }

  if (filters.endDate && date > filters.endDate) {
    return false;
  }

  return true;
}

export async function getPayrollCalendar(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: PayrollCalendarFilters = {},
) {
  const [payPeriodsResult, payrollRunsResult, holidaysResult] = await Promise.all([
    supabase
      .from("pay_periods")
      .select("id, label, start_date, end_date, pay_date, status, created_at")
      .eq("organization_id", organizationId)
      .order("start_date", { ascending: true }),
    supabase
      .from("payroll_runs")
      .select("id, period_label, pay_date, status, employee_count, total_amount, variance_note, created_at")
      .eq("organization_id", organizationId)
      .order("pay_date", { ascending: true }),
    supabase
      .from("holidays")
      .select("id, name, holiday_date, type, applies_to, status, created_at")
      .eq("organization_id", organizationId)
      .order("holiday_date", { ascending: true }),
  ]);

  if (payPeriodsResult.error) {
    throw new ApiError(500, "Failed to load pay periods for the payroll calendar.", payPeriodsResult.error.message);
  }

  if (payrollRunsResult.error) {
    throw new ApiError(500, "Failed to load payroll runs for the payroll calendar.", payrollRunsResult.error.message);
  }

  if (holidaysResult.error) {
    throw new ApiError(500, "Failed to load holidays for the payroll calendar.", holidaysResult.error.message);
  }

  const payPeriods = (payPeriodsResult.data ?? [])
    .map((period) => ({
      id: period.id,
      type: "pay_period",
      label: period.label,
      startDate: period.start_date,
      endDate: period.end_date,
      payDate: period.pay_date,
      status: period.status,
      createdAt: period.created_at,
    }))
    .filter((period) => withinRange(period.startDate, filters) || withinRange(period.payDate, filters));

  const payrollRuns = (payrollRunsResult.data ?? [])
    .map((run) => ({
      id: run.id,
      type: "payroll_run",
      label: run.period_label,
      payDate: run.pay_date,
      status: run.status,
      employeeCount: run.employee_count,
      totalAmount: run.total_amount,
      varianceNote: run.variance_note,
      createdAt: run.created_at,
    }))
    .filter((run) => withinRange(run.payDate, filters));

  const holidays = (holidaysResult.data ?? [])
    .map((holiday) => ({
      id: holiday.id,
      type: "holiday",
      label: holiday.name,
      holidayDate: holiday.holiday_date,
      holidayType: holiday.type,
      appliesTo: holiday.applies_to,
      status: holiday.status,
      createdAt: holiday.created_at,
    }))
    .filter((holiday) => withinRange(holiday.holidayDate, filters));

  const timeline = [
    ...payPeriods.map((period) => ({
      id: period.id,
      eventType: period.type,
      date: period.startDate,
      label: `${period.label} opens`,
      status: period.status,
      meta: period,
    })),
    ...payPeriods.map((period) => ({
      id: `${period.id}:pay-date`,
      eventType: "pay_date",
      date: period.payDate,
      label: `${period.label} pay date`,
      status: period.status,
      meta: period,
    })),
    ...payrollRuns.map((run) => ({
      id: run.id,
      eventType: run.type,
      date: run.payDate,
      label: run.label,
      status: run.status,
      meta: run,
    })),
    ...holidays.map((holiday) => ({
      id: holiday.id,
      eventType: holiday.type,
      date: holiday.holidayDate,
      label: holiday.label,
      status: holiday.status,
      meta: holiday,
    })),
  ].sort((left, right) => left.date.localeCompare(right.date) || left.label.localeCompare(right.label));

  return {
    generatedAt: new Date().toISOString(),
    filters,
    summary: {
      payPeriods: payPeriods.length,
      payrollRuns: payrollRuns.length,
      holidays: holidays.length,
      nextPayDate: timeline.find((event) => event.eventType === "pay_date")?.date ?? null,
    },
    payPeriods,
    payrollRuns,
    holidays,
    timeline,
  };
}
