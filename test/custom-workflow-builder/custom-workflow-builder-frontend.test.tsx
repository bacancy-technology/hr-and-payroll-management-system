import { CustomWorkflowBuilderPanel } from "@/components/custom-workflow-builder/custom-workflow-builder-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("custom workflow builder frontend", () => {
  it("renders workflow templates and nodes", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <CustomWorkflowBuilderPanel builder={data.customWorkflowBuilder} />,
    );

    expect(markup).toContain("Custom workflow builder");
    expect(markup).toContain(data.customWorkflowBuilder.templates[0].name);
    expect(markup).toContain(data.customWorkflowBuilder.nodes[0].label);
  });
});
