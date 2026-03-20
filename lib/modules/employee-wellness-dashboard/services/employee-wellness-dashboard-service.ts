import type { EmployeeWellnessDashboard, WellnessMetric, WellnessResource, WellnessSignal } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listBenefitsEnrollments } from "@/lib/modules/benefits/services/benefits-enrollment-service";
import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";
import { listTimeEntries } from "@/lib/modules/time-tracking/services/time-entry-service";

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function buildMetrics(input: {
  employees: Awaited<ReturnType<typeof listEmployees>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  leaveRequests: Awaited<ReturnType<typeof listPtoRequests>>;
  benefitsEnrollments: Awaited<ReturnType<typeof listBenefitsEnrollments>>;
}): WellnessMetric[] {
  const activeEmployees = input.employees.filter((employee) => employee.status === "Active").length;
  const averageHours =
    input.timeEntries.length === 0
      ? 0
      : round(
          input.timeEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0) / input.timeEntries.length,
        );
  const approvedPtoDays = input.leaveRequests
    .filter((request) => request.status === "Approved")
    .reduce((sum, request) => sum + request.days, 0);
  const wellnessCoverage = input.benefitsEnrollments.filter((enrollment) =>
    enrollment.plan?.category?.toLowerCase().includes("health"),
  ).length;

  return [
    {
      label: "Participation rate",
      value: `${activeEmployees === 0 ? 0 : Math.round((input.timeEntries.length / activeEmployees) * 100)}%`,
      detail: "Employees contributing wellness-relevant activity signals this cycle.",
    },
    {
      label: "Average workday",
      value: `${averageHours} hrs`,
      detail: "Based on approved and submitted tracked hours.",
    },
    {
      label: "Approved recovery time",
      value: `${approvedPtoDays} days`,
      detail: "Upcoming and completed approved PTO supporting time away.",
    },
    {
      label: "Health coverage",
      value: `${wellnessCoverage}`,
      detail: "Employees currently enrolled in health-related benefits.",
    },
  ];
}

function buildResources(): WellnessResource[] {
  return [
    {
      id: "resource-mental-health-eap",
      title: "Employee Assistance Program",
      category: "Mental Health",
      availability: "24/7",
      description: "Confidential counseling sessions and manager escalation guidance.",
    },
    {
      id: "resource-fitness-sync",
      title: "Fitness App Sync",
      category: "Fitness",
      availability: "Connected",
      description: "Weekly activity goals synced from supported wellness apps.",
    },
    {
      id: "resource-burnout-coaching",
      title: "Burnout Prevention Coaching",
      category: "Manager Support",
      availability: "Bookable",
      description: "Structured coaching for workload planning and recovery routines.",
    },
  ];
}

function buildSignals(input: {
  employees: Awaited<ReturnType<typeof listEmployees>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  leaveRequests: Awaited<ReturnType<typeof listPtoRequests>>;
}) {
  const timeEntriesByEmployee = input.timeEntries.reduce<Record<string, { hours: number; overtime: number }>>(
    (accumulator, entry) => {
      const employeeId = entry.employee?.id;

      if (!employeeId) {
        return accumulator;
      }

      const current = accumulator[employeeId] ?? { hours: 0, overtime: 0 };
      accumulator[employeeId] = {
        hours: current.hours + entry.hoursWorked,
        overtime: current.overtime + entry.overtimeHours,
      };

      return accumulator;
    },
    {},
  );

  const approvedLeaveByEmployee = input.leaveRequests.reduce<Record<string, number>>((accumulator, request) => {
    if (!request.employeeId || request.status !== "Approved") {
      return accumulator;
    }

    accumulator[request.employeeId] = (accumulator[request.employeeId] ?? 0) + request.days;
    return accumulator;
  }, {});

  return input.employees
    .map((employee) => {
      const timeSummary = timeEntriesByEmployee[employee.id] ?? { hours: 0, overtime: 0 };
      const approvedLeave = approvedLeaveByEmployee[employee.id] ?? 0;

      if (timeSummary.overtime >= 3) {
        return {
          id: `wellness-signal-${employee.id}-burnout`,
          employeeName: employee.fullName,
          focusArea: "Workload balance",
          signal: `${employee.fullName} logged ${round(timeSummary.overtime)} overtime hours recently.`,
          recommendation: "Encourage recovery time and rebalance sprint or payroll-close responsibilities.",
        } satisfies WellnessSignal;
      }

      if (approvedLeave === 0 && employee.status === "Active") {
        return {
          id: `wellness-signal-${employee.id}-recovery`,
          employeeName: employee.fullName,
          focusArea: "Recovery time",
          signal: `${employee.fullName} has no approved leave currently scheduled.`,
          recommendation: "Prompt a manager check-in about rest, flexibility, and upcoming time-off plans.",
        } satisfies WellnessSignal;
      }

      return {
        id: `wellness-signal-${employee.id}-steady`,
        employeeName: employee.fullName,
        focusArea: "Steady state",
        signal: `${employee.fullName} is trending within expected workload and time-away ranges.`,
        recommendation: "Maintain existing cadence and keep wellness resources visible.",
      } satisfies WellnessSignal;
    })
    .slice(0, 4);
}

export function buildEmployeeWellnessDashboard(input: {
  employees: Awaited<ReturnType<typeof listEmployees>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  leaveRequests: Awaited<ReturnType<typeof listPtoRequests>>;
  benefitsEnrollments: Awaited<ReturnType<typeof listBenefitsEnrollments>>;
  generatedAt?: string;
}) {
  const metrics = buildMetrics(input);
  const resources = buildResources();
  const signals = buildSignals(input);

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      participatingEmployees: input.employees.filter((employee) => employee.status === "Active").length,
      wellnessResources: resources.length,
      activeSignals: signals.length,
      connectedApps: 1,
    },
    metrics,
    resources,
    signals,
  } satisfies EmployeeWellnessDashboard;
}

export async function getEmployeeWellnessDashboard(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [employees, timeEntries, leaveRequests, benefitsEnrollments] = await Promise.all([
    listEmployees(supabase, organizationId),
    listTimeEntries(supabase, organizationId),
    listPtoRequests(supabase, organizationId),
    listBenefitsEnrollments(supabase, organizationId),
  ]);

  return buildEmployeeWellnessDashboard({
    employees,
    timeEntries,
    leaveRequests,
    benefitsEnrollments,
  });
}
