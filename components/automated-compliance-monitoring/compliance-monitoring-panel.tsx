import type { AutomatedComplianceMonitoring } from "@/lib/types";
import { formatDate } from "@/lib/utils";

import { ComplianceStatusPill } from "@/components/automated-compliance-monitoring/compliance-status-pill";

interface ComplianceMonitoringPanelProps {
  monitoring: AutomatedComplianceMonitoring;
}

export function ComplianceMonitoringPanel({ monitoring }: ComplianceMonitoringPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Automated compliance monitoring</h3>
          <p className="panel-subtitle">Real-time rule watchlist with policy update and impact assessment guidance.</p>
        </div>
        <span className="pill">{monitoring.summary.monitoredRules} rules monitored</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Action required</span>
          <strong>{monitoring.summary.actionRequiredSignals}</strong>
          <p>Rules needing immediate operational follow-up.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Deadlines</span>
          <strong>{monitoring.summary.upcomingDeadlines}</strong>
          <p>Regulatory deadlines landing in the next 30 days.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Jurisdictions</span>
          <strong>{monitoring.summary.jurisdictionsImpacted}</strong>
          <p>Jurisdictions currently represented in active monitoring.</p>
        </div>
      </div>

      <div className="stack">
        {monitoring.signals.map((signal) => (
          <div className="compliance-monitor-card" key={signal.id}>
            <div className="split">
              <div>
                <span className="small-label">{signal.category}</span>
                <strong>{signal.ruleName}</strong>
              </div>
              <ComplianceStatusPill status={signal.monitoringStatus} />
            </div>
            <p>{signal.impactAssessment}</p>
            <p className="muted">{signal.recommendedPolicyUpdate}</p>
            <p className="muted">
              {signal.jurisdiction} · {signal.impactLevel} impact · Due {formatDate(signal.dueDate)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
