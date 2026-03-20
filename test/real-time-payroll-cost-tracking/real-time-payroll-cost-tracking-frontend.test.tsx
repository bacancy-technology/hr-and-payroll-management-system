import { PayrollCostTrackingPanel } from "@/components/real-time-payroll-cost-tracking/payroll-cost-tracking-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("real-time payroll cost tracking frontend", () => {
  it("renders summary metrics and department breakdowns", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <PayrollCostTrackingPanel tracking={data.realTimePayrollCostTracking} />,
    );

    expect(markup).toContain("Real-time payroll cost tracking");
    expect(markup).toContain(data.realTimePayrollCostTracking.metrics[0].label);
    expect(markup).toContain(data.realTimePayrollCostTracking.breakdown[0].department);
  });
});
