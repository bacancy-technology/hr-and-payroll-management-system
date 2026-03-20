import type { SmartBenefitsRecommendations } from "@/lib/types";

import { RecommendationPriorityPill } from "@/components/smart-benefits-recommendations/recommendation-priority-pill";

interface BenefitsRecommendationsPanelProps {
  recommendations: SmartBenefitsRecommendations;
}

export function BenefitsRecommendationsPanel({ recommendations }: BenefitsRecommendationsPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Smart benefits recommendations</h3>
          <p className="panel-subtitle">Personalized plan suggestions based on peer adoption and near-term employee events.</p>
        </div>
        <span className="pill">{recommendations.summary.recommendationsGenerated} suggestions</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Evaluated</span>
          <strong>{recommendations.summary.employeesEvaluated}</strong>
          <p>Employees considered by the recommendation engine.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Recommended</span>
          <strong>{recommendations.summary.recommendationsGenerated}</strong>
          <p>Personalized plan suggestions currently surfaced.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Top category</span>
          <strong>{recommendations.summary.mostRecommendedCategory}</strong>
          <p>Most frequently suggested benefits category right now.</p>
        </div>
      </div>

      <div className="stack">
        {recommendations.recommendations.map((recommendation) => (
          <div className="benefits-recommendation-card" key={recommendation.id}>
            <div className="split">
              <div>
                <span className="small-label">{recommendation.category}</span>
                <strong>
                  {recommendation.employeeName} → {recommendation.recommendedPlanName}
                </strong>
              </div>
              <RecommendationPriorityPill priority={recommendation.priority} />
            </div>
            <p>{recommendation.rationale}</p>
            <div className="benefits-life-events">
              {recommendation.lifeEvents.map((event) => (
                <span className="small-label" key={`${recommendation.id}-${event}`}>
                  {event}
                </span>
              ))}
            </div>
            <p className="muted">
              {recommendation.department} · Confidence {Math.round(recommendation.confidenceScore * 100)}%
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
