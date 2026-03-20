import { SentimentAnalysisDashboardPanel } from "@/components/sentiment-analysis-dashboard/sentiment-analysis-dashboard-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("sentiment analysis dashboard frontend", () => {
  it("renders themes and signals", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <SentimentAnalysisDashboardPanel dashboard={data.sentimentAnalysisDashboard} />,
    );

    expect(markup).toContain("Sentiment analysis dashboard");
    expect(markup).toContain(data.sentimentAnalysisDashboard.themes[0].topic);
    expect(markup).toContain(data.sentimentAnalysisDashboard.signals[0].subject);
  });
});
