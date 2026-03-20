import type { RealTimePayrollCostTracking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PayrollCostTrackingPanelProps {
  tracking: RealTimePayrollCostTracking;
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function PayrollCostTrackingPanel({ tracking }: PayrollCostTrackingPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Real-time payroll cost tracking</h3>
          <p className="panel-subtitle">Live payroll accrual, projected close cost, and department-level budget pacing.</p>
        </div>
        <span className="pill">{tracking.summary.activeDepartments} departments tracked</span>
      </div>

      <div className="wellness-metrics-grid">
        {tracking.metrics.map((metric) => (
          <div className="wellness-metric-card" key={metric.label}>
            <span className="small-label">{metric.label}</span>
            <strong>{formatCurrency(metric.amount)}</strong>
            <p>{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="stack">
        {tracking.breakdown.map((item) => (
          <div className="payroll-cost-card" key={item.department}>
            <div className="split">
              <div>
                <span className="small-label">{item.headcount} people</span>
                <strong>{item.department}</strong>
              </div>
              <span className="small-label">{formatCurrency(item.projectedCost)} projected</span>
            </div>
            <p>
              Accrued {formatCurrency(item.accruedCost)} · Budget variance{" "}
              {formatPercent(
                item.projectedCost === 0 ? 0 : ((item.projectedCost - item.accruedCost) / item.projectedCost) * 100,
              )}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
