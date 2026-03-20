import { WellnessDashboardPanel } from "@/components/employee-wellness-dashboard/wellness-dashboard-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("employee wellness dashboard frontend", () => {
  it("renders wellness resources and risk signals", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <WellnessDashboardPanel dashboard={data.employeeWellnessDashboard} />,
    );

    expect(markup).toContain("Employee wellness dashboard");
    expect(markup).toContain(data.employeeWellnessDashboard.resources[0].title);
    expect(markup).toContain(data.employeeWellnessDashboard.signals[0].employeeName);
  });
});
