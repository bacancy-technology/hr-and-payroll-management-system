import type { PredictiveWorkforceAnalytics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { TurnoverRiskPill } from "@/components/predictive-workforce-analytics/turnover-risk-pill";

interface PredictiveWorkforcePanelProps {
  analytics: PredictiveWorkforceAnalytics;
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function PredictiveWorkforcePanel({ analytics }: PredictiveWorkforcePanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Predictive workforce analytics</h3>
          <p className="panel-subtitle">Turnover risk, hiring timing, and compensation pressure signals.</p>
        </div>
        <span className="pill">{analytics.summary.monitoredEmployees} employees monitored</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Retention</span>
          <strong>{analytics.summary.highRiskEmployees}</strong>
          <p>Critical turnover risks needing manager follow-up.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Hiring</span>
          <strong>{analytics.summary.recommendedHiringWindows}</strong>
          <p>Departments with near-term hiring pressure.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Compensation</span>
          <strong>{analytics.summary.departmentsBelowBenchmark}</strong>
          <p>Departments trending below current benchmark assumptions.</p>
        </div>
      </div>

      <div className="forecast-grid">
        <div className="forecast-section">
          <div className="split">
            <strong>Turnover watchlist</strong>
            <span className="small-label">{analytics.turnoverRisk.length} flagged</span>
          </div>
          <div className="stack">
            {analytics.turnoverRisk.map((employee) => (
              <div className="forecast-card" key={employee.employeeId}>
                <div className="split">
                  <div>
                    <strong>{employee.employeeName}</strong>
                    <p className="muted">{employee.department}</p>
                  </div>
                  <TurnoverRiskPill riskLevel={employee.riskLevel} />
                </div>
                <p className="muted">Risk score {employee.riskScore}/100</p>
                <p>{employee.drivers.join(" ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="forecast-section">
          <div className="split">
            <strong>Optimal hiring windows</strong>
            <span className="small-label">{analytics.hiringWindows.length} departments</span>
          </div>
          <div className="stack">
            {analytics.hiringWindows.map((window) => (
              <div className="forecast-card" key={window.id}>
                <div className="split">
                  <strong>{window.department}</strong>
                  <span className="small-label">{window.recommendedWindow}</span>
                </div>
                <p>{window.rationale}</p>
                <p className="muted">Confidence {Math.round(window.confidenceScore * 100)}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="forecast-section">
          <div className="split">
            <strong>Compensation benchmarks</strong>
            <span className="small-label">{analytics.compensationBenchmarks.length} departments</span>
          </div>
          <div className="stack">
            {analytics.compensationBenchmarks.map((benchmark) => (
              <div className="forecast-card" key={benchmark.id}>
                <div className="split">
                  <strong>{benchmark.department}</strong>
                  <span className="small-label">{benchmark.position}</span>
                </div>
                <p>
                  Average comp {formatCurrency(benchmark.averageSalary)} vs benchmark{" "}
                  {formatCurrency(benchmark.benchmarkSalary)}.
                </p>
                <p className="muted">Gap {formatPercent(benchmark.gapPercent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
