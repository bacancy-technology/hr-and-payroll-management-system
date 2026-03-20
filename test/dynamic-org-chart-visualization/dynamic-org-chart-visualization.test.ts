import { GET } from "@/app/api/directory/org-chart/route";
import {
  buildDynamicOrgChartVisualization,
  getDynamicOrgChartVisualization,
} from "@/lib/modules/dynamic-org-chart-visualization/services/dynamic-org-chart-visualization-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/dynamic-org-chart-visualization/services/dynamic-org-chart-visualization-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/dynamic-org-chart-visualization/services/dynamic-org-chart-visualization-service")
  >("@/lib/modules/dynamic-org-chart-visualization/services/dynamic-org-chart-visualization-service");

  return {
    ...actual,
    getDynamicOrgChartVisualization: vi.fn(),
  };
});

describe("dynamic org chart visualization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds a reporting graph with levels and links", () => {
    const orgChart = buildDynamicOrgChartVisualization({
      generatedAt: "2026-03-20T00:00:00.000Z",
      employees: [
        {
          id: "emp-1",
          fullName: "Maya Chen",
          role: "HR Director",
          managerName: "Executive Team",
          department: { name: "People" },
        },
        {
          id: "emp-2",
          fullName: "Elena Torres",
          role: "Talent Partner",
          managerName: "Maya Chen",
          department: { name: "People" },
        },
        {
          id: "emp-3",
          fullName: "Noah Kim",
          role: "Finance Analyst",
          managerName: "Elena Torres",
          department: { name: "Finance" },
        },
      ],
    });

    expect(orgChart.summary.people).toBe(3);
    expect(orgChart.summary.reportingLinks).toBe(2);
    expect(orgChart.nodes.find((node) => node.fullName === "Maya Chen")?.level).toBe(0);
    expect(orgChart.nodes.find((node) => node.fullName === "Noah Kim")?.level).toBe(2);
  });

  it("loads org chart data from the route", async () => {
    const orgChart = { summary: { people: 6 } };
    vi.mocked(getDynamicOrgChartVisualization).mockResolvedValue(orgChart as never);

    const response = await GET();

    await expectDataResponse(response, orgChart);
    expect(getDynamicOrgChartVisualization).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
