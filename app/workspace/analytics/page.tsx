import { OrgChartPanel } from "@/components/dynamic-org-chart-visualization/org-chart-panel";
import { PredictiveWorkforcePanel } from "@/components/predictive-workforce-analytics/predictive-workforce-panel";
import { AnalyticsOverviewPanel } from "@/components/reporting/analytics-overview-panel";
import { SentimentAnalysisDashboardPanel } from "@/components/sentiment-analysis-dashboard/sentiment-analysis-dashboard-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { getDashboardData } from "@/lib/data";

export default async function AnalyticsPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Analytics"
        title="See workforce and operational trends in one analytical surface."
        description="These screens expose the backend reporting and analytics capabilities through predictive, sentiment, directory-graph, and KPI-oriented frontend views."
      />

      <section className="workspace-section-grid">
        <AnalyticsOverviewPanel />
        <PredictiveWorkforcePanel analytics={data.predictiveWorkforceAnalytics} />
        <SentimentAnalysisDashboardPanel dashboard={data.sentimentAnalysisDashboard} />
        <OrgChartPanel orgChart={data.dynamicOrgChartVisualization} />
      </section>
    </>
  );
}
