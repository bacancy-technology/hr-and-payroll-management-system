import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listPayrollRuns } from "@/lib/modules/payroll/services/payroll-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";

interface PayrollReportFilters {
  status?: string;
}

interface WorkforceReportFilters {
  departmentId?: string;
  status?: string;
}

interface PtoReportFilters {
  employeeId?: string;
  status?: string;
}

function buildCountBreakdown(values: string[]) {
  return Object.entries(
    values.reduce<Record<string, number>>((counts, value) => {
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

export async function getPayrollReport(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: PayrollReportFilters = {},
) {
  const runs = (await listPayrollRuns(supabase, organizationId)).filter((run) =>
    filters.status ? run.status === filters.status : true,
  );

  const totalAmount = runs.reduce((sum, run) => sum + run.totalAmount, 0);
  const employeeCount = runs.reduce((sum, run) => sum + run.employeeCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    filters,
    summary: {
      totalRuns: runs.length,
      totalAmount,
      totalEmployeesProcessed: employeeCount,
      latestPayDate: runs[0]?.payDate ?? null,
      statusBreakdown: buildCountBreakdown(runs.map((run) => run.status)),
    },
    runs,
  };
}

export async function getWorkforceReport(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: WorkforceReportFilters = {},
) {
  const employees = (await listEmployees(supabase, organizationId)).filter((employee) => {
    if (filters.status && employee.status !== filters.status) {
      return false;
    }

    if (filters.departmentId && employee.department?.id !== filters.departmentId) {
      return false;
    }

    return true;
  });

  const now = Date.now();
  const thirtyDaysFromNow = now + 1000 * 60 * 60 * 24 * 30;
  const salaryTotal = employees.reduce((sum, employee) => sum + employee.salary, 0);

  return {
    generatedAt: new Date().toISOString(),
    filters,
    summary: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((employee) => employee.status === "Active").length,
      upcomingReviews: employees.filter((employee) => {
        const reviewAt = new Date(employee.nextReviewAt).getTime();
        return reviewAt >= now && reviewAt <= thirtyDaysFromNow;
      }).length,
      averageSalary: employees.length === 0 ? 0 : Number((salaryTotal / employees.length).toFixed(2)),
      statusBreakdown: buildCountBreakdown(employees.map((employee) => employee.status)),
      departmentBreakdown: buildCountBreakdown(
        employees.map((employee) => employee.department?.name ?? "Unassigned"),
      ),
      locationBreakdown: buildCountBreakdown(employees.map((employee) => employee.location)),
    },
    employees,
  };
}

export async function getPtoReport(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: PtoReportFilters = {},
) {
  const requests = (await listPtoRequests(supabase, organizationId)).filter((request) => {
    if (filters.status && request.status !== filters.status) {
      return false;
    }

    if (filters.employeeId && request.employeeId !== filters.employeeId) {
      return false;
    }

    return true;
  });

  return {
    generatedAt: new Date().toISOString(),
    filters,
    summary: {
      totalRequests: requests.length,
      totalDaysRequested: requests.reduce((sum, request) => sum + request.days, 0),
      pendingRequests: requests.filter((request) => request.status === "Pending").length,
      approvedDays: requests
        .filter((request) => request.status === "Approved")
        .reduce((sum, request) => sum + request.days, 0),
      statusBreakdown: buildCountBreakdown(requests.map((request) => request.status)),
      typeBreakdown: buildCountBreakdown(requests.map((request) => request.type)),
    },
    requests,
  };
}
