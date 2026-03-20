import type {
  PayrollCostDepartmentBreakdown,
  PayrollCostMetric,
  RealTimePayrollCostTracking,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listTimeEntries } from "@/lib/modules/time-tracking/services/time-entry-service";

interface PayrollRunRow {
  id: string;
  pay_period_id: string | null;
  period_label: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_amount: number;
}

interface PayPeriodRow {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: string;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function daysBetween(startDate: string, endDate: string) {
  return Math.max(
    1,
    Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
}

function selectCurrentPayPeriod(payPeriods: PayPeriodRow[]) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    payPeriods.find((period) => period.start_date <= today && period.end_date >= today) ??
    payPeriods.find((period) => period.status === "Open" || period.status === "Scheduled") ??
    payPeriods[0] ??
    null
  );
}

function getDailyRate(annualSalary: number) {
  return annualSalary / 260;
}

export function buildRealTimePayrollCostTracking(input: {
  payPeriods: PayPeriodRow[];
  payrollRuns: PayrollRunRow[];
  employees: Awaited<ReturnType<typeof listEmployees>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  generatedAt?: string;
}) {
  const currentPeriod = selectCurrentPayPeriod(input.payPeriods);

  if (!currentPeriod) {
    return {
      generatedAt: input.generatedAt ?? new Date().toISOString(),
      summary: {
        currentAccruedCost: 0,
        projectedCloseCost: 0,
        budgetVariancePercent: 0,
        activeDepartments: 0,
      },
      metrics: [],
      breakdown: [],
    } satisfies RealTimePayrollCostTracking;
  }

  const currentPeriodEntries = input.timeEntries.filter((entry) => entry.payPeriod?.id === currentPeriod.id);
  const totalDays = daysBetween(currentPeriod.start_date, currentPeriod.end_date);
  const elapsedDays = Math.min(
    totalDays,
    daysBetween(currentPeriod.start_date, input.generatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)),
  );

  const overtimeByEmployeeId = currentPeriodEntries.reduce<Record<string, number>>((accumulator, entry) => {
    const employeeId = entry.employee?.id;

    if (!employeeId) {
      return accumulator;
    }

    accumulator[employeeId] = (accumulator[employeeId] ?? 0) + entry.overtimeHours;
    return accumulator;
  }, {});

  const breakdownMap = input.employees.reduce<Record<string, PayrollCostDepartmentBreakdown>>((accumulator, employee) => {
    const department = employee.department?.name ?? "Unassigned";
    const accruedBaseCost = getDailyRate(employee.salary) * elapsedDays;
    const overtimeCost = (overtimeByEmployeeId[employee.id] ?? 0) * ((employee.salary / 2080) * 1.5);
    const accruedCost = accruedBaseCost + overtimeCost;
    const projectedCost = getDailyRate(employee.salary) * totalDays + overtimeCost;
    const current = accumulator[department] ?? {
      department,
      accruedCost: 0,
      projectedCost: 0,
      headcount: 0,
    };

    accumulator[department] = {
      department,
      accruedCost: round(current.accruedCost + accruedCost),
      projectedCost: round(current.projectedCost + projectedCost),
      headcount: current.headcount + 1,
    };

    return accumulator;
  }, {});

  const breakdown = Object.values(breakdownMap).sort((left, right) => right.projectedCost - left.projectedCost);
  const currentAccruedCost = round(breakdown.reduce((sum, item) => sum + item.accruedCost, 0));
  const projectedCloseCost = round(breakdown.reduce((sum, item) => sum + item.projectedCost, 0));
  const latestRun = [...input.payrollRuns]
    .sort((left, right) => right.pay_date.localeCompare(left.pay_date))
    .find((run) => run.total_amount > 0);
  const baselineBudget = latestRun?.total_amount ?? projectedCloseCost;
  const budgetVariancePercent =
    baselineBudget === 0 ? 0 : round(((projectedCloseCost - baselineBudget) / baselineBudget) * 100);
  const dailyBurnRate = round(currentAccruedCost / Math.max(elapsedDays, 1));

  const metrics: PayrollCostMetric[] = [
    {
      label: "Current accrued payroll",
      amount: currentAccruedCost,
      detail: `${elapsedDays} of ${totalDays} days accrued in ${currentPeriod.label}.`,
    },
    {
      label: "Projected close cost",
      amount: projectedCloseCost,
      detail: "Projected end-of-period payroll using salary pace and current overtime.",
    },
    {
      label: "Budget baseline",
      amount: baselineBudget,
      detail: latestRun ? `Compared with ${latestRun.period_label}.` : "No prior paid run available.",
    },
    {
      label: "Daily burn rate",
      amount: dailyBurnRate,
      detail: "Average payroll cost accruing per elapsed workday.",
    },
  ];

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      currentAccruedCost,
      projectedCloseCost,
      budgetVariancePercent,
      activeDepartments: breakdown.length,
    },
    metrics,
    breakdown,
  } satisfies RealTimePayrollCostTracking;
}

export async function getRealTimePayrollCostTracking(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [payPeriodsResult, payrollRunsResult, employees, timeEntries] = await Promise.all([
    supabase
      .from("pay_periods")
      .select("id, label, start_date, end_date, pay_date, status")
      .eq("organization_id", organizationId)
      .order("start_date", { ascending: false }),
    supabase
      .from("payroll_runs")
      .select("id, pay_period_id, period_label, pay_date, status, employee_count, total_amount")
      .eq("organization_id", organizationId)
      .order("pay_date", { ascending: false }),
    listEmployees(supabase, organizationId),
    listTimeEntries(supabase, organizationId),
  ]);

  if (payPeriodsResult.error) {
    throw new ApiError(500, "Failed to load pay periods for payroll cost tracking.", payPeriodsResult.error.message);
  }

  if (payrollRunsResult.error) {
    throw new ApiError(500, "Failed to load payroll runs for payroll cost tracking.", payrollRunsResult.error.message);
  }

  return buildRealTimePayrollCostTracking({
    payPeriods: (payPeriodsResult.data ?? []) as PayPeriodRow[],
    payrollRuns: (payrollRunsResult.data ?? []) as PayrollRunRow[],
    employees,
    timeEntries,
  });
}
