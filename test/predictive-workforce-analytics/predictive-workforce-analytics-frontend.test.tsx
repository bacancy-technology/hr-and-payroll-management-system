import { PredictiveWorkforcePanel } from "@/components/predictive-workforce-analytics/predictive-workforce-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("predictive workforce analytics frontend", () => {
  it("renders predictive analytics sections and employee signals", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <PredictiveWorkforcePanel analytics={data.predictiveWorkforceAnalytics} />,
    );

    expect(markup).toContain("Predictive workforce analytics");
    expect(markup).toContain("Turnover watchlist");
    expect(markup).toContain(data.predictiveWorkforceAnalytics.turnoverRisk[0].employeeName);
  });
});
