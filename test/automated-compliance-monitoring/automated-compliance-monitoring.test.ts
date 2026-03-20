import { GET } from "@/app/api/compliance/monitoring/route";
import {
  buildAutomatedComplianceMonitoring,
  getAutomatedComplianceMonitoring,
} from "@/lib/modules/automated-compliance-monitoring/services/automated-compliance-monitoring-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/automated-compliance-monitoring/services/automated-compliance-monitoring-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/automated-compliance-monitoring/services/automated-compliance-monitoring-service")
  >("@/lib/modules/automated-compliance-monitoring/services/automated-compliance-monitoring-service");

  return {
    ...actual,
    getAutomatedComplianceMonitoring: vi.fn(),
  };
});

describe("automated compliance monitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds monitoring signals with impact assessment", () => {
    const monitoring = buildAutomatedComplianceMonitoring({
      referenceDate: new Date("2026-03-20T00:00:00.000Z"),
      rules: [
        {
          id: "rule-1",
          name: "Federal Form 941 Q1 Filing",
          jurisdiction: "United States - Federal",
          category: "Payroll Tax",
          deadlineDate: "2026-04-05",
          status: "Open",
        },
        {
          id: "rule-2",
          name: "California UI Wage Report",
          jurisdiction: "California",
          category: "State Payroll Tax",
          deadlineDate: "2026-05-10",
          status: "Open",
        },
      ],
      alerts: [
        {
          id: "alert-1",
          ruleId: "rule-1",
          severity: "High",
          title: "Federal filing deadline approaching",
          message: "Review filing package before submission.",
          status: "Open",
          dueDate: "2026-04-01",
        },
      ],
    });

    expect(monitoring.summary.monitoredRules).toBe(2);
    expect(monitoring.summary.actionRequiredSignals).toBe(1);
    expect(monitoring.signals[0]?.monitoringStatus).toBe("Action Required");
    expect(monitoring.signals[0]?.impactLevel).toBe("High");
  });

  it("loads monitoring output from the route", async () => {
    const monitoring = { summary: { monitoredRules: 2 } };
    vi.mocked(getAutomatedComplianceMonitoring).mockResolvedValue(monitoring as never);

    const response = await GET();

    await expectDataResponse(response, monitoring);
    expect(getAutomatedComplianceMonitoring).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
