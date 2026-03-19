import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listOnboardingWorkflows } from "@/lib/modules/onboarding/services/onboarding-workflow-service";
import { listPayrollRuns } from "@/lib/modules/payroll/services/payroll-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";

function buildBreakdown(values: string[]) {
  return Object.entries(
    values.reduce<Record<string, number>>((counts, value) => {
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

export async function getAnalyticsDashboard(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [employees, payrollRuns, leaveRequests, onboardingWorkflows] = await Promise.all([
    listEmployees(supabase, organizationId),
    listPayrollRuns(supabase, organizationId),
    listPtoRequests(supabase, organizationId),
    listOnboardingWorkflows(supabase, organizationId),
  ]);

  const now = Date.now();
  const thirtyDaysFromNow = now + 1000 * 60 * 60 * 24 * 30;
  const payrollInFlight = payrollRuns.find((run) => run.status !== "Paid") ?? payrollRuns[0] ?? null;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((employee) => employee.status === "Active").length,
      payrollInFlightAmount: payrollInFlight?.totalAmount ?? 0,
      openLeaveRequests: leaveRequests.filter((request) => request.status !== "Approved").length,
      reviewsDueSoon: employees.filter((employee) => {
        const reviewAt = new Date(employee.nextReviewAt).getTime();
        return reviewAt >= now && reviewAt <= thirtyDaysFromNow;
      }).length,
      onboardingInProgress: onboardingWorkflows.filter((workflow) => workflow.status === "In Progress").length,
    },
    breakdowns: {
      employeesByDepartment: buildBreakdown(
        employees.map((employee) => employee.department?.name ?? "Unassigned"),
      ),
      employeesByStatus: buildBreakdown(employees.map((employee) => employee.status)),
      payrollByStatus: buildBreakdown(payrollRuns.map((run) => run.status)).map((item) => ({
        ...item,
        totalAmount: payrollRuns
          .filter((run) => run.status === item.value)
          .reduce((sum, run) => sum + run.totalAmount, 0),
      })),
      leaveByStatus: buildBreakdown(leaveRequests.map((request) => request.status)),
      onboardingByStatus: buildBreakdown(onboardingWorkflows.map((workflow) => workflow.status)),
    },
    upcoming: {
      payrollRuns: payrollRuns.slice(0, 3),
      leaveRequests: leaveRequests.slice(0, 5),
      onboardingWorkflows: onboardingWorkflows.slice(0, 5),
    },
  };
}
