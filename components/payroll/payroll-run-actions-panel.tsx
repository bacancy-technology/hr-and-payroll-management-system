"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderCurrency, renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PayrollRunRecord {
  id: string;
  periodLabel: string;
  employeeCount: number;
  payDate: string;
  status: string;
  totalAmount: number;
  varianceNote: string;
}

export function PayrollRunActionsPanel() {
  const [runs, setRuns] = useState<PayrollRunRecord[]>([]);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestApi<PayrollRunRecord[]>("/api/payroll/runs");
      setRuns(data);
      setError(null);
    } catch (loadError) {
      setRuns([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load payroll runs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  async function runAction(runId: string, action: "calculate" | "approve" | "finalize") {
    const submittingId = `${runId}:${action}`;

    try {
      setSubmittingKey(submittingId);
      setNotice(null);
      await requestApi(`/api/payroll/runs/${runId}/${action}`, {
        method: "POST",
        body:
          action === "approve"
            ? JSON.stringify({
                decisionNote: notesById[runId] ? notesById[runId] : null,
              })
            : JSON.stringify({}),
      });
      setNotice(`Payroll run ${action} completed successfully.`);
      await loadRuns();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Payroll action failed.");
    } finally {
      setSubmittingKey(null);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Payroll Run Actions</h3>
          <p className="panel-subtitle">Calculate, approve, and finalize payroll cycles directly from the payroll workspace.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${runs.length} runs`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      {!error && loading ? <p className="workspace-panel-message">Loading payroll actions...</p> : null}

      <div className="workspace-action-grid">
        {runs.map((run) => (
          <div className="workspace-action-card" key={run.id}>
            <div className="split">
              <div>
                <strong>{run.periodLabel}</strong>
                <p className="muted">
                  {run.employeeCount} employees · pay date {renderDate(run.payDate)}
                </p>
              </div>
              {renderStatus(run.status)}
            </div>

            <div className="workspace-inline-metadata">
              <span>{renderCurrency(run.totalAmount)}</span>
              <span>{run.varianceNote}</span>
            </div>

            <div className="field">
              <label htmlFor={`payroll-note-${run.id}`}>Approval note</label>
              <textarea
                id={`payroll-note-${run.id}`}
                onChange={(event) =>
                  setNotesById((current) => ({
                    ...current,
                    [run.id]: event.target.value,
                  }))
                }
                placeholder="Optional note for the payroll approval record."
                value={notesById[run.id] ?? ""}
              />
            </div>

            <div className="workspace-form-actions">
              <button
                className="button-ghost"
                disabled={submittingKey === `${run.id}:calculate`}
                onClick={() => void runAction(run.id, "calculate")}
                type="button"
              >
                Calculate
              </button>
              <button
                className="button-secondary"
                disabled={submittingKey === `${run.id}:approve`}
                onClick={() => void runAction(run.id, "approve")}
                type="button"
              >
                Approve
              </button>
              <button
                className="button"
                disabled={submittingKey === `${run.id}:finalize`}
                onClick={() => void runAction(run.id, "finalize")}
                type="button"
              >
                Finalize
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
