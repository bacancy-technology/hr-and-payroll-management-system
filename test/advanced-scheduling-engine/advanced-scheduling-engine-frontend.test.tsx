import { AdvancedSchedulingEnginePanel } from "@/components/advanced-scheduling-engine/advanced-scheduling-engine-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("advanced scheduling engine frontend", () => {
  it("renders optimized shifts and alerts", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <AdvancedSchedulingEnginePanel engine={data.advancedSchedulingEngine} />,
    );

    expect(markup).toContain("Advanced scheduling engine");
    expect(markup).toContain(data.advancedSchedulingEngine.shifts[0].employeeName);
    expect(markup).toContain(data.advancedSchedulingEngine.alerts[0].title);
  });
});
