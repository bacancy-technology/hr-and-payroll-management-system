import { GlobalPayrollSupportPanel } from "@/components/global-payroll-support/global-payroll-support-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("global payroll support frontend", () => {
  it("renders region and currency readiness details", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <GlobalPayrollSupportPanel support={data.globalPayrollSupport} />,
    );

    expect(markup).toContain("Global payroll support");
    expect(markup).toContain(data.globalPayrollSupport.regions[0].entityName);
    expect(markup).toContain(data.globalPayrollSupport.currencies[0].currency);
  });
});
