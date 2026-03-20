import { PayrollAnomalyPanel } from "@/components/payroll-anomaly-detection/payroll-anomaly-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("payroll anomaly detection frontend", () => {
  it("renders anomaly details in the frontend panel", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(<PayrollAnomalyPanel anomalies={data.payrollAnomalies} />);

    expect(markup).toContain("Payroll anomaly detection");
    expect(markup).toContain(data.payrollAnomalies[0].subject);
    expect(markup).toContain(data.payrollAnomalies[0].payrollRunLabel);
  });
});
