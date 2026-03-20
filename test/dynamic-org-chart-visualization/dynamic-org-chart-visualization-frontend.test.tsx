import { OrgChartPanel } from "@/components/dynamic-org-chart-visualization/org-chart-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("dynamic org chart visualization frontend", () => {
  it("renders nodes and relationship summaries", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <OrgChartPanel orgChart={data.dynamicOrgChartVisualization} />,
    );

    expect(markup).toContain("Dynamic org chart visualization");
    expect(markup).toContain(data.dynamicOrgChartVisualization.nodes[0].fullName);
    expect(markup).toContain(String(data.dynamicOrgChartVisualization.summary.reportingLinks));
  });
});
