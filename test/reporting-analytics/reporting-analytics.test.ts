import { GET } from "@/app/api/analytics/dashboard/route";
import { getAnalyticsDashboard } from "@/lib/modules/reporting/services/analytics-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/reporting/services/analytics-service", () => ({
  getAnalyticsDashboard: vi.fn(),
}));

describe("reporting and analytics", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the analytics dashboard", async () => {
    const dashboard = { payroll: { totalRuns: 4 } };
    vi.mocked(getAnalyticsDashboard).mockResolvedValue(dashboard as never);

    const response = await GET();

    await expectDataResponse(response, dashboard);
    expect(getAnalyticsDashboard).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
