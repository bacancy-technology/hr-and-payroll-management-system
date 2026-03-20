import type { DynamicOrgChartVisualization } from "@/lib/types";

interface OrgChartPanelProps {
  orgChart: DynamicOrgChartVisualization;
}

function buildLevelLabel(level: number) {
  return level === 0 ? "Leadership" : `Level ${level}`;
}

export function OrgChartPanel({ orgChart }: OrgChartPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Dynamic org chart visualization</h3>
          <p className="panel-subtitle">Real-time reporting map built from manager relationships and department structure.</p>
        </div>
        <span className="pill">{orgChart.summary.people} people mapped</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Leaders</span>
          <strong>{orgChart.summary.rootLeaders}</strong>
          <p>Top-level leaders in the current reporting map.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Links</span>
          <strong>{orgChart.summary.reportingLinks}</strong>
          <p>Manager-to-report relationships currently connected.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Departments</span>
          <strong>{orgChart.summary.departments}</strong>
          <p>Departments represented in the chart.</p>
        </div>
      </div>

      <div className="org-chart-grid">
        {orgChart.nodes.map((node) => (
          <div className="org-chart-card" key={node.id}>
            <div className="split">
              <span className="small-label">{buildLevelLabel(node.level)}</span>
              <span className="small-label">{node.directReportCount} reports</span>
            </div>
            <strong>{node.fullName}</strong>
            <p>{node.role}</p>
            <p className="muted">
              {node.departmentName} · Reports to {node.managerName || "Executive Team"}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
