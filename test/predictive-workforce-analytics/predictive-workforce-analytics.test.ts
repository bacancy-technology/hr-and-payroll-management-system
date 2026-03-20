import { GET } from "@/app/api/analytics/predictive-workforce/route";
import {
  buildPredictiveWorkforceAnalytics,
  getPredictiveWorkforceAnalytics,
} from "@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service")
  >("@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service");

  return {
    ...actual,
    getPredictiveWorkforceAnalytics: vi.fn(),
  };
});

describe("predictive workforce analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds turnover, hiring, and compensation forecasts", () => {
    const analytics = buildPredictiveWorkforceAnalytics({
      referenceDate: new Date("2026-03-20T00:00:00.000Z"),
      employees: [
        {
          id: "emp-1",
          fullName: "Ava Stone",
          status: "Active",
          location: "Remote",
          salary: 102000,
          startDate: "2025-09-15",
          nextReviewAt: "2026-03-26",
          department: { id: "dept-1", name: "Engineering" },
        },
        {
          id: "emp-2",
          fullName: "Noah Kim",
          status: "In Review",
          location: "Mumbai",
          salary: 88000,
          startDate: "2025-01-06",
          nextReviewAt: "2026-04-07",
          department: { id: "dept-2", name: "Finance" },
        },
        {
          id: "emp-3",
          fullName: "Priya Nair",
          status: "Active",
          location: "Mumbai",
          salary: 120000,
          startDate: "2021-11-22",
          nextReviewAt: "2026-05-16",
          department: { id: "dept-2", name: "Finance" },
        },
      ],
      leaveRequests: [
        {
          employeeId: "emp-2",
          employeeName: "Noah Kim",
          startDate: "2026-03-28",
          endDate: "2026-03-29",
          days: 2,
          status: "Pending",
        },
      ],
    });

    expect(analytics.summary.monitoredEmployees).toBe(3);
    expect(analytics.turnoverRisk.some((employee) => employee.employeeName === "Noah Kim")).toBe(true);
    expect(
      analytics.hiringWindows.some(
        (window) => window.department === "Finance" && window.recommendedWindow !== "Next quarter",
      ),
    ).toBe(true);
    expect(analytics.compensationBenchmarks.some((item) => item.department === "Engineering")).toBe(true);
  });

  it("loads predictive analytics from the route", async () => {
    const analytics = { summary: { monitoredEmployees: 6 } };
    vi.mocked(getPredictiveWorkforceAnalytics).mockResolvedValue(analytics as never);

    const response = await GET();

    await expectDataResponse(response, analytics);
    expect(getPredictiveWorkforceAnalytics).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
