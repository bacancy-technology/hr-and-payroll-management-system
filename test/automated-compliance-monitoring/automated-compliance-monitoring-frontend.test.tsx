import { ComplianceMonitoringPanel } from "@/components/automated-compliance-monitoring/compliance-monitoring-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("automated compliance monitoring frontend", () => {
  it("renders monitored rules and signals", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <ComplianceMonitoringPanel monitoring={data.automatedComplianceMonitoring} />,
    );

    expect(markup).toContain("Automated compliance monitoring");
    expect(markup).toContain(data.automatedComplianceMonitoring.signals[0].ruleName);
    expect(markup).toContain(data.automatedComplianceMonitoring.signals[0].jurisdiction);
  });
});
