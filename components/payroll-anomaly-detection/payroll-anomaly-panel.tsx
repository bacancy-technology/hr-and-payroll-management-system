import type { PayrollAnomaly } from "@/lib/types";
import { formatDate } from "@/lib/utils";

import { AnomalySeverityPill } from "@/components/payroll-anomaly-detection/anomaly-severity-pill";

interface PayrollAnomalyPanelProps {
  anomalies: PayrollAnomaly[];
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatMetricValue(anomaly: PayrollAnomaly, label: string, value: number) {
  if (label === "Headcount") {
    return value.toFixed(0);
  }

  if (anomaly.category === "Tax withholding drift") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PayrollAnomalyPanel({ anomalies }: PayrollAnomalyPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Payroll anomaly detection</h3>
          <p className="panel-subtitle">Flag unusual payroll patterns before approval and release.</p>
        </div>
        <span className="pill">{anomalies.length} flagged items</span>
      </div>

      {anomalies.length === 0 ? (
        <div className="announcement-item">
          <strong>No active anomalies</strong>
          <p>Recent payroll activity is tracking within the expected range for this organization.</p>
        </div>
      ) : (
        <div className="stack">
          {anomalies.map((anomaly) => (
            <div className="anomaly-card" key={anomaly.id}>
              <div className="split">
                <div>
                  <span className="small-label">{anomaly.category}</span>
                  <strong>{anomaly.subject}</strong>
                </div>
                <AnomalySeverityPill severity={anomaly.severity} />
              </div>

              <p>{anomaly.summary}</p>
              <p className="muted">{anomaly.detail}</p>
              <span className="muted">
                {anomaly.payrollRunLabel} · Paid on {formatDate(anomaly.payDate)} · Confidence{" "}
                {Math.round(anomaly.confidenceScore * 100)}%
              </span>

              <div className="anomaly-metrics">
                {anomaly.metrics.map((metric) => (
                  <div className="anomaly-metric" key={`${anomaly.id}-${metric.label}`}>
                    <span className="small-label">{metric.label}</span>
                    <strong>{formatMetricValue(anomaly, metric.label, metric.observed)}</strong>
                    <span className="muted">
                      Expected {formatMetricValue(anomaly, metric.label, metric.expected)} ·{" "}
                      {formatPercent(metric.deltaPercent)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="muted">{anomaly.recommendedAction}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
