import type { AdvancedSchedulingEngine } from "@/lib/types";
import { formatDate } from "@/lib/utils";

import { ScheduleStatusPill } from "@/components/advanced-scheduling-engine/schedule-status-pill";

interface AdvancedSchedulingEnginePanelProps {
  engine: AdvancedSchedulingEngine;
}

export function AdvancedSchedulingEnginePanel({ engine }: AdvancedSchedulingEnginePanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Advanced scheduling engine</h3>
          <p className="panel-subtitle">AI-optimized shift coverage using workload patterns, inferred preferences, and scheduling guardrails.</p>
        </div>
        <span className="pill">{engine.summary.scheduledShifts} shifts optimized</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Employees scheduled</span>
          <strong>{engine.summary.employeesScheduled}</strong>
          <p>Unique teammates receiving optimized shift recommendations.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Preference matches</span>
          <strong>{engine.summary.strongPreferenceMatches}</strong>
          <p>Shifts currently aligned with stronger inferred work-pattern preferences.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Compliance alerts</span>
          <strong>{engine.summary.complianceAlerts}</strong>
          <p>Coverage constraints requiring review before finalizing the schedule.</p>
        </div>
      </div>

      <div className="scheduling-grid">
        <div className="stack">
          {engine.shifts.map((shift) => (
            <div className="scheduling-card" key={shift.id}>
              <div className="split">
                <div>
                  <span className="small-label">{shift.department}</span>
                  <strong>{shift.employeeName}</strong>
                </div>
                <ScheduleStatusPill label={shift.complianceStatus} tone={shift.complianceStatus} />
              </div>
              <p>
                {formatDate(shift.shiftDate)} · {shift.shiftWindow}
              </p>
              <p>{shift.focusArea}</p>
              <div className="split">
                <ScheduleStatusPill label={`${shift.preferenceMatch} preference fit`} tone={shift.preferenceMatch} />
                <span className="small-label">{shift.skills.length} skills matched</span>
              </div>
              <div className="scheduling-skill-list">
                {shift.skills.map((skill) => (
                  <span className="scheduling-skill-chip" key={`${shift.id}-${skill}`}>
                    {skill}
                  </span>
                ))}
              </div>
              <p className="muted">{shift.optimizationNote}</p>
            </div>
          ))}
        </div>

        <div className="stack">
          {engine.alerts.map((alert) => (
            <div className="scheduling-alert-card" key={alert.id}>
              <div className="split">
                <strong>{alert.title}</strong>
                <ScheduleStatusPill label={alert.severity} tone={alert.severity} />
              </div>
              <p>{alert.detail}</p>
              <p className="muted">{alert.recommendedAction}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
