import { GET } from "@/app/api/analytics/sentiment/route";
import {
  buildSentimentAnalysisDashboard,
  getSentimentAnalysisDashboard,
} from "@/lib/modules/sentiment-analysis-dashboard/services/sentiment-analysis-dashboard-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/sentiment-analysis-dashboard/services/sentiment-analysis-dashboard-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/sentiment-analysis-dashboard/services/sentiment-analysis-dashboard-service")
  >("@/lib/modules/sentiment-analysis-dashboard/services/sentiment-analysis-dashboard-service");

  return {
    ...actual,
    getSentimentAnalysisDashboard: vi.fn(),
  };
});

describe("sentiment analysis dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds sentiment themes from reviews, approvals, and announcements", () => {
    const dashboard = buildSentimentAnalysisDashboard({
      generatedAt: "2026-03-20T00:00:00.000Z",
      announcements: [
        {
          id: "announcement-1",
          label: "Payroll",
          title: "Payroll exception rate dropped below 1%",
          body: "Automated checks are clearing with fewer manual interventions.",
        },
      ],
      approvals: [
        {
          id: "approval-1",
          entityType: "leave_request",
          entityId: "leave-1",
          requestedByName: "Noah Kim",
          assignedToName: "Priya Nair",
          status: "In Review",
          decisionNote: "Pending manager review.",
          decidedAt: null,
          createdAt: "2026-03-19T00:00:00.000Z",
        },
      ],
      performanceReviews: [
        {
          id: "review-1",
          employeeId: "emp-1",
          employeeName: "Jordan Blake",
          templateId: "template-1",
          reviewerName: "Mina Carter",
          status: "In Review",
          dueDate: "2026-04-05",
          submittedAt: null,
          score: 4.4,
          summary: "Strong delivery with better reliability outcomes.",
          notes: "Pending final calibration feedback.",
          createdAt: "2026-03-20T00:00:00.000Z",
          template: {
            id: "template-1",
            name: "Quarterly Growth Review",
            cycle_label: "Q2 2026",
            review_type: "Quarterly",
            status: "Active",
          },
          employee: {
            id: "emp-1",
            full_name: "Jordan Blake",
            email: "jordan@pulsehr.app",
          },
        },
      ],
    });

    expect(dashboard.summary.signalsAnalyzed).toBe(3);
    expect(dashboard.themes.length).toBeGreaterThan(0);
    expect(dashboard.signals.some((signal) => signal.sentiment === "Positive")).toBe(true);
  });

  it("loads the sentiment dashboard from the route", async () => {
    const dashboard = { summary: { signalsAnalyzed: 3 } };
    vi.mocked(getSentimentAnalysisDashboard).mockResolvedValue(dashboard as never);

    const response = await GET();

    await expectDataResponse(response, dashboard);
    expect(getSentimentAnalysisDashboard).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
