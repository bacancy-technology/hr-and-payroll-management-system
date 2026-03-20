import type {
  CompensationBenchmarkInsight,
  HiringWindowRecommendation,
  PredictiveTurnoverRisk,
  PredictiveWorkforceAnalytics,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";

interface AnalyticsEmployee {
  id: string;
  fullName: string;
  status: string;
  location: string;
  salary: number;
  startDate: string;
  nextReviewAt: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface AnalyticsPtoRequest {
  employeeId: string | null;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function daysUntil(date: string, reference: Date) {
  return Math.round((new Date(date).getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));
}

function monthsSince(date: string, reference: Date) {
  const from = new Date(date);
  return (reference.getFullYear() - from.getFullYear()) * 12 + (reference.getMonth() - from.getMonth());
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toRiskLevel(score: number): PredictiveTurnoverRisk["riskLevel"] {
  if (score >= 78) {
    return "Critical";
  }

  if (score >= 62) {
    return "Elevated";
  }

  return "Watch";
}

function getBenchmarkFactor(department: string) {
  const normalized = department.toLowerCase();

  if (normalized.includes("engineering")) {
    return 1.08;
  }

  if (normalized.includes("design")) {
    return 1.05;
  }

  if (normalized.includes("finance")) {
    return 1.03;
  }

  if (normalized.includes("people")) {
    return 1.02;
  }

  return 1.04;
}

function buildTurnoverRiskInsights(
  employees: AnalyticsEmployee[],
  referenceDate: Date,
): PredictiveTurnoverRisk[] {
  const departmentAverageSalary = employees.reduce<Record<string, { total: number; count: number }>>((totals, employee) => {
    const department = employee.department?.name ?? "Unassigned";
    const current = totals[department] ?? { total: 0, count: 0 };

    totals[department] = {
      total: current.total + employee.salary,
      count: current.count + 1,
    };

    return totals;
  }, {});

  return employees
    .map((employee) => {
      const drivers: string[] = [];
      let score = 34;
      const tenureMonths = monthsSince(employee.startDate, referenceDate);
      const reviewInDays = daysUntil(employee.nextReviewAt, referenceDate);
      const departmentName = employee.department?.name ?? "Unassigned";
      const departmentAverage =
        departmentAverageSalary[departmentName]!.total / departmentAverageSalary[departmentName]!.count;

      if (employee.status === "In Review") {
        score += 28;
        drivers.push("Employee is already flagged as in review.");
      } else if (employee.status === "On Leave") {
        score += 10;
        drivers.push("Extended leave can increase short-term attrition risk.");
      }

      if (tenureMonths < 12) {
        score += 16;
        drivers.push("Employee is within the first year of tenure.");
      } else if (tenureMonths < 24) {
        score += 8;
        drivers.push("Employee is still in the early-tenure retention window.");
      }

      if (reviewInDays <= 14) {
        score += 14;
        drivers.push("Performance review or compensation conversation is imminent.");
      } else if (reviewInDays <= 30) {
        score += 8;
        drivers.push("Upcoming review cycle could influence retention.");
      }

      if (employee.salary < departmentAverage * 0.9) {
        score += 14;
        drivers.push("Compensation sits below the department midpoint.");
      }

      if (employee.location.toLowerCase() === "remote") {
        score += 4;
        drivers.push("Fully remote setup can require extra engagement monitoring.");
      }

      const riskScore = clamp(42, score, 96);

      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        department: departmentName,
        riskLevel: toRiskLevel(riskScore),
        riskScore,
        drivers: drivers.slice(0, 3),
      } satisfies PredictiveTurnoverRisk;
    })
    .filter((employee) => employee.riskScore >= 50)
    .sort((left, right) => right.riskScore - left.riskScore || left.employeeName.localeCompare(right.employeeName))
    .slice(0, 4);
}

function buildHiringWindowRecommendations(
  employees: AnalyticsEmployee[],
  leaveRequests: AnalyticsPtoRequest[],
  referenceDate: Date,
): HiringWindowRecommendation[] {
  const departmentEmployees = employees.reduce<Record<string, AnalyticsEmployee[]>>((groups, employee) => {
    const department = employee.department?.name ?? "Unassigned";
    groups[department] = [...(groups[department] ?? []), employee];
    return groups;
  }, {});

  return Object.entries(departmentEmployees)
    .map(([department, departmentRoster]) => {
      const employeeIds = new Set(departmentRoster.map((employee) => employee.id));
      const leaveLoad = leaveRequests
        .filter((request) => {
          if (!request.employeeId || !employeeIds.has(request.employeeId)) {
            return false;
          }

          const startInDays = daysUntil(request.startDate, referenceDate);
          return startInDays >= 0 && startInDays <= 45 && request.status !== "Rejected";
        })
        .reduce((sum, request) => sum + request.days, 0);
      const reviewsDue = departmentRoster.filter((employee) => {
        const reviewInDays = daysUntil(employee.nextReviewAt, referenceDate);
        return reviewInDays >= 0 && reviewInDays <= 30;
      }).length;

      const pressureScore =
        leaveLoad + reviewsDue * 2 + (departmentRoster.length <= 2 ? 4 : 0) + (departmentRoster.length <= 4 ? 2 : 0);

      let recommendedWindow = "Next quarter";

      if (pressureScore >= 12) {
        recommendedWindow = "Next 30 days";
      } else if (pressureScore >= 7) {
        recommendedWindow = "Next 45 days";
      }

      return {
        id: `hiring-window-${department.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        department,
        recommendedWindow,
        confidenceScore: round(clamp(0.56, 0.58 + pressureScore * 0.03, 0.93)),
        rationale: `${departmentRoster.length} employees, ${leaveLoad} leave days in the next 45 days, and ${reviewsDue} review cycles due soon.`,
      } satisfies HiringWindowRecommendation;
    })
    .sort(
      (left, right) =>
        right.confidenceScore - left.confidenceScore || left.department.localeCompare(right.department),
    )
    .slice(0, 3);
}

function buildCompensationBenchmarkInsights(
  employees: AnalyticsEmployee[],
): CompensationBenchmarkInsight[] {
  const departments = employees.reduce<Record<string, AnalyticsEmployee[]>>((groups, employee) => {
    const department = employee.department?.name ?? "Unassigned";
    groups[department] = [...(groups[department] ?? []), employee];
    return groups;
  }, {});

  return Object.entries(departments)
    .map(([department, roster]) => {
      const averageSalary = roster.reduce((sum, employee) => sum + employee.salary, 0) / roster.length;
      const benchmarkSalary = averageSalary * getBenchmarkFactor(department);
      const gapPercent = round(((averageSalary - benchmarkSalary) / benchmarkSalary) * 100);
      const absoluteGap = Math.abs(gapPercent);
      const position: CompensationBenchmarkInsight["position"] =
        absoluteGap <= 3 ? "Aligned" : gapPercent < 0 ? "Below" : "Above";

      return {
        id: `benchmark-${department.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        department,
        averageSalary: round(averageSalary),
        benchmarkSalary: round(benchmarkSalary),
        gapPercent,
        position,
      };
    })
    .sort((left, right) => Math.abs(right.gapPercent) - Math.abs(left.gapPercent))
    .slice(0, 4);
}

export function buildPredictiveWorkforceAnalytics(input: {
  employees: AnalyticsEmployee[];
  leaveRequests: AnalyticsPtoRequest[];
  referenceDate?: Date;
}) {
  const referenceDate = input.referenceDate ?? new Date();
  const turnoverRisk = buildTurnoverRiskInsights(input.employees, referenceDate);
  const hiringWindows = buildHiringWindowRecommendations(input.employees, input.leaveRequests, referenceDate);
  const compensationBenchmarks = buildCompensationBenchmarkInsights(input.employees);

  return {
    generatedAt: referenceDate.toISOString(),
    summary: {
      monitoredEmployees: input.employees.length,
      highRiskEmployees: turnoverRisk.filter((employee) => employee.riskLevel === "Critical").length,
      recommendedHiringWindows: hiringWindows.filter((window) => window.recommendedWindow !== "Next quarter").length,
      departmentsBelowBenchmark: compensationBenchmarks.filter((item) => item.position === "Below").length,
    },
    turnoverRisk,
    hiringWindows,
    compensationBenchmarks,
  } satisfies PredictiveWorkforceAnalytics;
}

export async function getPredictiveWorkforceAnalytics(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [employees, leaveRequests] = await Promise.all([
    listEmployees(supabase, organizationId),
    listPtoRequests(supabase, organizationId),
  ]);

  return buildPredictiveWorkforceAnalytics({
    employees,
    leaveRequests,
  });
}
