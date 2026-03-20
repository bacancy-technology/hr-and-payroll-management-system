"use client";

import { useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderCurrency, renderStatus } from "@/components/workspace-data/api-table-panel";

interface WorkforceReportPayload {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    upcomingReviews: number;
    averageSalary: number;
    statusBreakdown: Array<{ value: string; count: number }>;
  };
  employees: Array<{
    id: string;
    fullName: string;
    role: string;
    location: string;
    status: string;
  }>;
}

export function WorkforceReportPanel() {
  const [status, setStatus] = useState("");
  const [payload, setPayload] = useState<WorkforceReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const query = status ? `?status=${encodeURIComponent(status)}` : "";
        const data = await requestApi<WorkforceReportPayload>(`/api/reports/workforce${query}`);
        setPayload(data);
        setError(null);
      } catch (loadError) {
        setPayload(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load workforce report.");
      }
    }

    void load();
  }, [status]);

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Workforce Report</h3>
          <p className="panel-subtitle">Monitor workforce capacity, review timing, and employee status balance.</p>
        </div>
        <div className="field workspace-inline-field">
          <label htmlFor="workforce-report-status">Status filter</label>
          <select id="workforce-report-status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}

      {payload ? (
        <>
          <div className="forecast-summary-grid">
            <div className="forecast-summary-card">
              <span className="small-label">Employees</span>
              <strong>{payload.summary.totalEmployees}</strong>
              <p>{payload.summary.activeEmployees} active employees in the current filter.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Upcoming reviews</span>
              <strong>{payload.summary.upcomingReviews}</strong>
              <p>Reviews coming due in the next 30 days.</p>
            </div>
            <div className="forecast-summary-card">
              <span className="small-label">Average salary</span>
              <strong>{renderCurrency(payload.summary.averageSalary)}</strong>
              <p>Average salary across the current workforce slice.</p>
            </div>
          </div>

          <div className="workspace-action-stack">
            {payload.employees.slice(0, 3).map((employee) => (
              <div className="workspace-mini-card" key={employee.id}>
                <div className="split">
                  <div>
                    <strong>{employee.fullName}</strong>
                    <p className="muted">
                      {employee.role} · {employee.location}
                    </p>
                  </div>
                  {renderStatus(employee.status)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </article>
  );
}
