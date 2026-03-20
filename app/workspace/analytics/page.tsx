import { OrgChartPanel } from "@/components/dynamic-org-chart-visualization/org-chart-panel";
import { PredictiveWorkforcePanel } from "@/components/predictive-workforce-analytics/predictive-workforce-panel";
import { AnalyticsOverviewPanel } from "@/components/reporting/analytics-overview-panel";
import { SentimentAnalysisDashboardPanel } from "@/components/sentiment-analysis-dashboard/sentiment-analysis-dashboard-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";
import { getDashboardData } from "@/lib/data";

const ANALYTICS_SECTIONS = [
  {
    id: "reporting-overview",
    title: "Reporting Overview",
    description: "High-level metrics and reporting readiness.",
  },
  {
    id: "predictive-planning",
    title: "Predictive Planning",
    description: "Turnover and hiring forecasts with workforce timing insights.",
  },
  {
    id: "sentiment-health",
    title: "Sentiment Health",
    description: "Employee communication and feedback signal analysis.",
  },
  {
    id: "org-visibility",
    title: "Org Visibility",
    description: "Interactive organizational structure and reporting relationships.",
  },
];

export default async function AnalyticsPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Analytics"
        title="See workforce and operational trends in one analytical surface."
        description="These screens expose the backend reporting and analytics capabilities through predictive, sentiment, directory-graph, and KPI-oriented frontend views."
      />

      <WorkspaceSectionMap items={ANALYTICS_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Keep executive reporting and health metrics visible before drilling into deeper analytical views."
          id="reporting-overview"
          title="Reporting Overview"
        >
          <AnalyticsOverviewPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use the predictive layer for retention risk, hiring timing, and compensation positioning signals."
          id="predictive-planning"
          title="Predictive Planning"
        >
          <PredictiveWorkforcePanel analytics={data.predictiveWorkforceAnalytics} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Read sentiment changes and communication themes before they become broader employee-relations issues."
          id="sentiment-health"
          title="Sentiment Health"
        >
          <SentimentAnalysisDashboardPanel dashboard={data.sentimentAnalysisDashboard} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use the live org chart to inspect reporting lines and cross-functional structure changes."
          id="org-visibility"
          title="Org Visibility"
        >
          <OrgChartPanel orgChart={data.dynamicOrgChartVisualization} />
        </WorkspaceSection>
      </div>
    </>
  );
}
