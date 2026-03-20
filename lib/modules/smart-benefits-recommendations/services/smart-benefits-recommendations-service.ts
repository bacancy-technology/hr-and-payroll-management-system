import type { BenefitsRecommendation, SmartBenefitsRecommendations } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listBenefitsEnrollments } from "@/lib/modules/benefits/services/benefits-enrollment-service";
import { listBenefitsPlans } from "@/lib/modules/benefits/services/benefits-plan-service";
import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";

interface RecommendationEmployee {
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

interface RecommendationPlan {
  id: string;
  name: string;
  category: string;
  coverageLevel: string;
  employeeCost: number;
  status: string;
}

interface RecommendationEnrollment {
  employeeId: string | null;
  planId: string;
  status: string;
}

interface RecommendationPtoRequest {
  employeeId: string | null;
  startDate: string;
  status: string;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function monthsSince(date: string, referenceDate: Date) {
  const from = new Date(date);
  return (referenceDate.getFullYear() - from.getFullYear()) * 12 + (referenceDate.getMonth() - from.getMonth());
}

function daysUntil(date: string, referenceDate: Date) {
  return Math.round((new Date(date).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toPriority(score: number): BenefitsRecommendation["priority"] {
  if (score >= 80) {
    return "Priority";
  }

  if (score >= 66) {
    return "Recommended";
  }

  return "Consider";
}

function buildLifeEvents(
  employee: RecommendationEmployee,
  leaveRequests: RecommendationPtoRequest[],
  referenceDate: Date,
) {
  const lifeEvents: string[] = [];
  const tenureMonths = monthsSince(employee.startDate, referenceDate);
  const reviewInDays = daysUntil(employee.nextReviewAt, referenceDate);
  const hasUpcomingLeave = leaveRequests.some((request) => {
    if (request.employeeId !== employee.id || request.status === "Rejected") {
      return false;
    }

    const startInDays = daysUntil(request.startDate, referenceDate);
    return startInDays >= 0 && startInDays <= 45;
  });

  if (tenureMonths < 12) {
    lifeEvents.push("New hire window");
  }

  if (reviewInDays >= 0 && reviewInDays <= 30) {
    lifeEvents.push("Comp review approaching");
  }

  if (hasUpcomingLeave || employee.status === "On Leave") {
    lifeEvents.push("Coverage-sensitive leave");
  }

  if (employee.location.toLowerCase() === "remote") {
    lifeEvents.push("Remote work setup");
  }

  return lifeEvents;
}

export function buildSmartBenefitsRecommendations(input: {
  employees: RecommendationEmployee[];
  plans: RecommendationPlan[];
  enrollments: RecommendationEnrollment[];
  leaveRequests: RecommendationPtoRequest[];
  referenceDate?: Date;
}) {
  const referenceDate = input.referenceDate ?? new Date();
  const activePlans = input.plans.filter((plan) => plan.status === "Active");
  const adoptionByPlan = input.enrollments.reduce<Record<string, number>>((counts, enrollment) => {
    if (enrollment.status !== "Active" && enrollment.status !== "Pending") {
      return counts;
    }

    counts[enrollment.planId] = (counts[enrollment.planId] ?? 0) + 1;
    return counts;
  }, {});

  const recommendations = input.employees
    .flatMap((employee) => {
      const department = employee.department?.name ?? "Unassigned";
      const currentPlanIds = new Set(
        input.enrollments
          .filter((enrollment) => enrollment.employeeId === employee.id && enrollment.status !== "Cancelled")
          .map((enrollment) => enrollment.planId),
      );
      const lifeEvents = buildLifeEvents(employee, input.leaveRequests, referenceDate);
      const tenureMonths = monthsSince(employee.startDate, referenceDate);
      const reviewInDays = daysUntil(employee.nextReviewAt, referenceDate);

      return activePlans
        .filter((plan) => !currentPlanIds.has(plan.id))
        .map((plan) => {
          let score = 42;
          const rationaleParts: string[] = [];
          const adoptionScore = (adoptionByPlan[plan.id] ?? 0) / Math.max(input.employees.length, 1);

          score += adoptionScore * 24;

          if (adoptionScore > 0.2) {
            rationaleParts.push("Peer adoption is strong for this plan.");
          }

          if (plan.category === "Health Insurance") {
            if (lifeEvents.includes("Coverage-sensitive leave")) {
              score += 24;
              rationaleParts.push("Upcoming or active leave makes health coverage more relevant.");
            }

            if (tenureMonths < 12) {
              score += 16;
              rationaleParts.push("Newer employees typically finalize health selections during first-year setup.");
            }
          }

          if (plan.category === "Retirement") {
            if (tenureMonths >= 12) {
              score += 20;
              rationaleParts.push("Employee has enough tenure to benefit from retirement matching.");
            }

            if (employee.salary >= 100000) {
              score += 10;
              rationaleParts.push("Compensation level suggests higher retirement planning value.");
            }

            if (reviewInDays >= 0 && reviewInDays <= 30) {
              score += 8;
              rationaleParts.push("Upcoming compensation review is a natural benefits refresh moment.");
            }
          }

          if (lifeEvents.includes("Remote work setup") && plan.category === "Health Insurance") {
            score += 6;
            rationaleParts.push("Remote employees often respond well to stronger core coverage options.");
          }

          const confidenceScore = round(clamp(0.55, 0.5 + score / 140, 0.96));

          return {
            id: `benefits-rec-${employee.id}-${plan.id}`,
            employeeId: employee.id,
            employeeName: employee.fullName,
            department,
            recommendedPlanId: plan.id,
            recommendedPlanName: plan.name,
            category: plan.category,
            priority: toPriority(score),
            confidenceScore,
            rationale: rationaleParts.slice(0, 3).join(" "),
            lifeEvents,
          } satisfies BenefitsRecommendation;
        })
        .filter((recommendation) => recommendation.rationale !== "");
    })
    .sort(
      (left, right) =>
        right.confidenceScore - left.confidenceScore || left.employeeName.localeCompare(right.employeeName),
    )
    .slice(0, 5);

  const categoryCounts = recommendations.reduce<Record<string, number>>((counts, recommendation) => {
    counts[recommendation.category] = (counts[recommendation.category] ?? 0) + 1;
    return counts;
  }, {});

  const mostRecommendedCategory =
    Object.entries(categoryCounts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ??
    "None";

  return {
    generatedAt: referenceDate.toISOString(),
    summary: {
      employeesEvaluated: input.employees.length,
      recommendationsGenerated: recommendations.length,
      mostRecommendedCategory,
    },
    recommendations,
  } satisfies SmartBenefitsRecommendations;
}

export async function getSmartBenefitsRecommendations(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [employees, plans, enrollments, leaveRequests] = await Promise.all([
    listEmployees(supabase, organizationId),
    listBenefitsPlans(supabase, organizationId),
    listBenefitsEnrollments(supabase, organizationId),
    listPtoRequests(supabase, organizationId),
  ]);

  return buildSmartBenefitsRecommendations({
    employees,
    plans,
    enrollments,
    leaveRequests,
  });
}
