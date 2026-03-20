"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ApprovalRecord {
  id: string;
  entityType: string;
  requestedByName: string;
  assignedToName: string;
  status: string;
  decisionNote: string | null;
  createdAt: string;
}

export function ApprovalDecisionPanel() {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestApi<ApprovalRecord[]>("/api/approvals?status=Pending");
      setApprovals(data);
      setError(null);
    } catch (loadError) {
      setApprovals([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  async function submitDecision(approvalId: string, action: "approve" | "reject") {
    try {
      setSubmittingId(approvalId);
      setNotice(null);
      await requestApi(`/api/approvals/${approvalId}/${action}`, {
        method: "POST",
        body: JSON.stringify({
          decisionNote: notesById[approvalId] ? notesById[approvalId] : null,
        }),
      });
      setNotice(action === "approve" ? "Approval marked as approved." : "Approval marked as rejected.");
      await loadApprovals();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Decision update failed.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Approval Decisions</h3>
          <p className="panel-subtitle">Approve or reject pending leave and expense requests without leaving operations.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${approvals.length} pending`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      {!error && loading ? <p className="workspace-panel-message">Loading approval queue...</p> : null}

      {!error && !loading && approvals.length === 0 ? (
        <p className="workspace-panel-message">No pending approvals require action right now.</p>
      ) : null}

      <div className="workspace-action-grid">
        {approvals.map((approval) => (
          <div className="workspace-action-card" key={approval.id}>
            <div className="split">
              <div>
                <strong>{approval.requestedByName}</strong>
                <p className="muted">
                  {approval.entityType.replace(/_/g, " ")} assigned to {approval.assignedToName}
                </p>
              </div>
              {renderStatus(approval.status)}
            </div>

            <p className="muted">Requested {renderDate(approval.createdAt)}</p>

            <div className="field">
              <label htmlFor={`approval-note-${approval.id}`}>Decision note</label>
              <textarea
                id={`approval-note-${approval.id}`}
                onChange={(event) =>
                  setNotesById((current) => ({
                    ...current,
                    [approval.id]: event.target.value,
                  }))
                }
                placeholder="Add context for the requester or audit trail."
                value={notesById[approval.id] ?? ""}
              />
            </div>

            <div className="workspace-form-actions">
              <button
                className="button-secondary"
                disabled={submittingId === approval.id}
                onClick={() => void submitDecision(approval.id, "approve")}
                type="button"
              >
                Approve
              </button>
              <button
                className="button-danger"
                disabled={submittingId === approval.id}
                onClick={() => void submitDecision(approval.id, "reject")}
                type="button"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
