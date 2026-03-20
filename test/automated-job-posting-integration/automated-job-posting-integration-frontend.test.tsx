import { JobPostingPanel } from "@/components/automated-job-posting-integration/job-posting-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("automated job posting integration frontend", () => {
  it("renders connected boards and active postings", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <JobPostingPanel integration={data.automatedJobPostingIntegration} />,
    );

    expect(markup).toContain("Automated job posting integration");
    expect(markup).toContain(data.automatedJobPostingIntegration.boards[0].displayName);
    expect(markup).toContain(data.automatedJobPostingIntegration.postings[0].title);
  });
});
