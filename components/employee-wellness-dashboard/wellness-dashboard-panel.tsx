import type { EmployeeWellnessDashboard } from "@/lib/types";

interface WellnessDashboardPanelProps {
  dashboard: EmployeeWellnessDashboard;
}

export function WellnessDashboardPanel({ dashboard }: WellnessDashboardPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Employee wellness dashboard</h3>
          <p className="panel-subtitle">Track workload, recovery signals, mental health resources, and connected fitness support.</p>
        </div>
        <span className="pill">{dashboard.summary.participatingEmployees} people tracked</span>
      </div>

      <div className="wellness-metrics-grid">
        {dashboard.metrics.map((metric) => (
          <div className="wellness-metric-card" key={metric.label}>
            <span className="small-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="wellness-grid">
        <div className="stack">
          {dashboard.resources.map((resource) => (
            <div className="wellness-card" key={resource.id}>
              <div className="split">
                <span className="small-label">{resource.category}</span>
                <span className="small-label">{resource.availability}</span>
              </div>
              <strong>{resource.title}</strong>
              <p>{resource.description}</p>
            </div>
          ))}
        </div>

        <div className="stack">
          {dashboard.signals.map((signal) => (
            <div className="wellness-card" key={signal.id}>
              <span className="small-label">{signal.focusArea}</span>
              <strong>{signal.employeeName}</strong>
              <p>{signal.signal}</p>
              <p className="muted">{signal.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
