"use client";

import { useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderStatus } from "@/components/workspace-data/api-table-panel";

interface PtoReportPayload {
  summary: {
    totalRequests: number;
    totalDaysRequested: number;
    pendingRequests: number;
    approvedDays: number;
    statusBreakdown: Array<{ value: string; count: number }>;
    typeBreakdown: Array<{ value: string; count: number }>;
  };
  requests: Array<{
    id: string;
    employeeName: string;
    type: string;
    days: number;
    status: string;
  }>;
}

export function PtoReportPanel() {
  const [status, setStatus] = useState("");
  const [payload, setPayload] = useState<PtoReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        const data = await requestApi<PtoReportPayload>(`/api/reports/pto${query}`);
        setPayload(data);
        setError(null);
      } catch (loadError) {
        setPayload(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load PTO report.");
      }
    }

    void load();
  }, [status]);

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>PTO Report</h3>
          <p className="panel-subtitle">Track leave demand, pending approvals, and approved day volume.</p>
        </div>
        <div className="field workspace-inline-field">
          <label htmlFor="pto-report-status">Status filter</label>
          <select id="pto-report-status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}

      {payload ? (
        <>
          <div className="forecast-summary-grid">
            <div className="forecast-summary-card">
              <span className="small-label">Requests</span>
              <strong>{payload.summary.totalRequests}</strong>
              <p>Total leave requests in the selected report scope.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Days requested</span>
              <strong>{payload.summary.totalDaysRequested}</strong>
              <p>Requested leave days across the selected requests.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Pending</span>
              <strong>{payload.summary.pendingRequests}</strong>
              <p>{payload.summary.approvedDays} approved days already on the calendar.</p>
            </div>
          </div>

          <div className="workspace-action-stack">
            {payload.requests.slice(0, 3).map((request) => (
              <div className="workspace-mini-card" key={request.id}>
                <div className="split">
                  <div>
                    <strong>{request.employeeName}</strong>
                    <p className="muted">
                      {request.type} · {request.days} days
                    </p>
                  </div>
                  {renderStatus(request.status)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </article>
  );
}
