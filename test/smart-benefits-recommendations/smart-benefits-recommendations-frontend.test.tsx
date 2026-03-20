import { BenefitsRecommendationsPanel } from "@/components/smart-benefits-recommendations/benefits-recommendations-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("smart benefits recommendations frontend", () => {
  it("renders personalized recommendations and plans", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <BenefitsRecommendationsPanel recommendations={data.smartBenefitsRecommendations} />,
    );

    expect(markup).toContain("Smart benefits recommendations");
    expect(markup).toContain(data.smartBenefitsRecommendations.recommendations[0].employeeName);
    expect(markup).toContain(
      data.smartBenefitsRecommendations.recommendations[0].recommendedPlanName,
    );
  });
});
