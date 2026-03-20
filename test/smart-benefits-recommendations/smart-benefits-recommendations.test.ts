import { GET } from "@/app/api/benefits/recommendations/route";
import {
  buildSmartBenefitsRecommendations,
  getSmartBenefitsRecommendations,
} from "@/lib/modules/smart-benefits-recommendations/services/smart-benefits-recommendations-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/smart-benefits-recommendations/services/smart-benefits-recommendations-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/smart-benefits-recommendations/services/smart-benefits-recommendations-service")
  >("@/lib/modules/smart-benefits-recommendations/services/smart-benefits-recommendations-service");

  return {
    ...actual,
    getSmartBenefitsRecommendations: vi.fn(),
  };
});

describe("smart benefits recommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds personalized plan suggestions", () => {
    const recommendations = buildSmartBenefitsRecommendations({
      referenceDate: new Date("2026-03-20T00:00:00.000Z"),
      employees: [
        {
          id: "emp-1",
          fullName: "Jordan Blake",
          status: "Active",
          location: "Remote",
          salary: 132000,
          startDate: "2023-01-16",
          nextReviewAt: "2026-04-03",
          department: { id: "dept-1", name: "Engineering" },
        },
        {
          id: "emp-2",
          fullName: "Elena Torres",
          status: "Active",
          location: "Barcelona",
          salary: 92000,
          startDate: "2025-09-14",
          nextReviewAt: "2026-04-10",
          department: { id: "dept-2", name: "People" },
        },
      ],
      plans: [
        {
          id: "plan-health",
          name: "Health Plus PPO",
          category: "Health Insurance",
          coverageLevel: "Employee + Family",
          employeeCost: 240,
          status: "Active",
        },
        {
          id: "plan-retirement",
          name: "Retirement Match 401(k)",
          category: "Retirement",
          coverageLevel: "Employee",
          employeeCost: 180,
          status: "Active",
        },
      ],
      enrollments: [
        {
          employeeId: "emp-1",
          planId: "plan-retirement",
          status: "Pending",
        },
      ],
      leaveRequests: [
        {
          employeeId: "emp-2",
          startDate: "2026-03-30",
          status: "Pending",
        },
      ],
    });

    expect(recommendations.summary.employeesEvaluated).toBe(2);
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
    expect(
      recommendations.recommendations.some(
        (recommendation) =>
          recommendation.employeeName === "Elena Torres" &&
          recommendation.category === "Health Insurance" &&
          recommendation.lifeEvents.includes("Coverage-sensitive leave"),
      ),
    ).toBe(true);
  });

  it("loads recommendations from the route", async () => {
    const recommendations = { summary: { recommendationsGenerated: 4 } };
    vi.mocked(getSmartBenefitsRecommendations).mockResolvedValue(recommendations as never);

    const response = await GET();

    await expectDataResponse(response, recommendations);
    expect(getSmartBenefitsRecommendations).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
