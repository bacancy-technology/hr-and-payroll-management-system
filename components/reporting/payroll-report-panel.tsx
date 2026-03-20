"use client";

import { useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderCurrency, renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PayrollReportPayload {
  summary: {
    totalRuns: number;
    totalAmount: number;
    totalEmployeesProcessed: number;
    latestPayDate: string | null;
    statusBreakdown: Array<{ value: string; count: number }>;
  };
  runs: Array<{
    id: string;
    periodLabel: string;
    status: string;
    employeeCount: number;
    totalAmount: number;
  }>;
}

export function PayrollReportPanel() {
  const [status, setStatus] = useState("");
  const [payload, setPayload] = useState<PayrollReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        const data = await requestApi<PayrollReportPayload>(`/api/reports/payroll${query}`);
        setPayload(data);
        setError(null);
      } catch (loadError) {
        setPayload(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load payroll report.");
      }
    }

    void load();
  }, [status]);

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Payroll Report</h3>
          <p className="panel-subtitle">Operational payroll reporting surface for totals, statuses, and recent cycles.</p>
        </div>
        <div className="field workspace-inline-field">
          <label htmlFor="payroll-report-status">Status filter</label>
          <select id="payroll-report-status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Processing">Processing</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}

      {payload ? (
        <>
          <div className="forecast-summary-grid">
            <div className="forecast-summary-card">
              <span className="small-label">Runs</span>
              <strong>{payload.summary.totalRuns}</strong>
              <p>Latest pay date {payload.summary.latestPayDate ? renderDate(payload.summary.latestPayDate) : "not available"}.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Payroll amount</span>
              <strong>{renderCurrency(payload.summary.totalAmount)}</strong>
              <p>Total gross payroll across the filtered runs.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Employees processed</span>
              <strong>{payload.summary.totalEmployeesProcessed}</strong>
              <p>Combined employee count across the selected payroll runs.</p>
            </div>
          </div>

          <div className="workspace-action-stack">
            {payload.runs.slice(0, 3).map((run) => (
              <div className="workspace-mini-card" key={run.id}>
                <div className="split">
                  <div>
                    <strong>{run.periodLabel}</strong>
                    <p className="muted">{run.employeeCount} employees</p>
                  </div>
                  {renderStatus(run.status)}
                </div>
                <p>{renderCurrency(run.totalAmount)}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </article>
  );
}
