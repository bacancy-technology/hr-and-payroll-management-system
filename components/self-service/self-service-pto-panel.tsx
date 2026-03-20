"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface SelfServicePtoRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  notes: string | null;
  approverName: string;
}

function defaultPtoForm() {
  return {
    type: "Vacation",
    startDate: "",
    endDate: "",
    days: "1",
    notes: "",
  };
}

export function SelfServicePtoPanel() {
  const [requests, setRequests] = useState<SelfServicePtoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultPtoForm);
  const [editForms, setEditForms] = useState<Record<string, ReturnType<typeof defaultPtoForm>>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestApi<SelfServicePtoRecord[]>("/api/self-service/pto");
      setRequests(data);
      setError(null);
    } catch (loadError) {
      setRequests([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load PTO requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function createRequest() {
    try {
      setSaving(true);
      setNotice(null);
      await requestApi("/api/self-service/pto", {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          days: Number(form.days),
          notes: form.notes || null,
        }),
      });
      setForm(defaultPtoForm());
      setNotice("PTO request created.");
      await loadRequests();
    } catch (saveError) {
      setNotice(null);
      setError(saveError instanceof Error ? saveError.message : "Failed to create PTO request.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(request: SelfServicePtoRecord) {
    setEditingId(request.id);
    setEditForms((current) => ({
      ...current,
      [request.id]: {
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        days: String(request.days),
        notes: request.notes ?? "",
      },
    }));
  }

  async function updateRequest(requestId: string) {
    const currentForm = editForms[requestId];

    if (!currentForm) {
      return;
    }

    try {
      setSaving(true);
      setNotice(null);
      await requestApi(`/api/self-service/pto/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: currentForm.type,
          startDate: currentForm.startDate,
          endDate: currentForm.endDate,
          days: Number(currentForm.days),
          notes: currentForm.notes || null,
        }),
      });
      setEditingId(null);
      setNotice("PTO request updated.");
      await loadRequests();
    } catch (saveError) {
      setNotice(null);
      setError(saveError instanceof Error ? saveError.message : "Failed to update PTO request.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRequest(requestId: string) {
    try {
      setSaving(true);
      setNotice(null);
      await requestApi(`/api/self-service/pto/${requestId}`, {
        method: "DELETE",
      });
      setNotice("PTO request deleted.");
      await loadRequests();
    } catch (saveError) {
      setNotice(null);
      setError(saveError instanceof Error ? saveError.message : "Failed to delete PTO request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>PTO Requests</h3>
          <p className="panel-subtitle">Create, edit, and remove self-service leave requests from the frontend workspace.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${requests.length} requests`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      <div className="workspace-form-grid">
        <div className="workspace-action-card">
          <strong>New PTO request</strong>
          <div className="workspace-form-grid workspace-form-grid-compact">
            <div className="field">
              <label htmlFor="self-pto-type">Type</label>
              <select id="self-pto-type" onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} value={form.type}>
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="self-pto-days">Days</label>
              <input id="self-pto-days" min="0.5" onChange={(event) => setForm((current) => ({ ...current, days: event.target.value }))} step="0.5" type="number" value={form.days} />
            </div>
          </div>
          <div className="workspace-form-grid workspace-form-grid-compact">
            <div className="field">
              <label htmlFor="self-pto-start">Start date</label>
              <input id="self-pto-start" onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} type="date" value={form.startDate} />
            </div>
            <div className="field">
              <label htmlFor="self-pto-end">End date</label>
              <input id="self-pto-end" onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} type="date" value={form.endDate} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="self-pto-notes">Notes</label>
            <textarea id="self-pto-notes" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
          </div>
          <button
            className="button-secondary"
            disabled={!form.startDate || !form.endDate || saving}
            onClick={() => void createRequest()}
            type="button"
          >
            Submit request
          </button>
        </div>

        <div className="workspace-action-card">
          <strong>Existing requests</strong>
          {requests.length === 0 ? <p className="muted">No PTO requests yet.</p> : null}
          <div className="workspace-action-stack">
            {requests.map((request) => {
              const editForm = editForms[request.id];
              const isEditing = editingId === request.id && editForm;

              return (
                <div className="workspace-mini-card" key={request.id}>
                  <div className="split">
                    <div>
                      <strong>{request.type}</strong>
                      <p className="muted">
                        {renderDate(request.startDate)} to {renderDate(request.endDate)} · {request.days} days
                      </p>
                    </div>
                    {renderStatus(request.status)}
                  </div>

                  <p className="muted">Approver: {request.approverName || "Pending assignment"}</p>

                  {isEditing ? (
                    <div className="workspace-action-stack">
                      <div className="workspace-form-grid workspace-form-grid-compact">
                        <div className="field">
                          <label htmlFor={`pto-type-${request.id}`}>Type</label>
                          <select
                            id={`pto-type-${request.id}`}
                            onChange={(event) =>
                              setEditForms((current) => ({
                                ...current,
                                [request.id]: {
                                  ...current[request.id],
                                  type: event.target.value,
                                },
                              }))
                            }
                            value={editForm.type}
                          >
                            <option value="Vacation">Vacation</option>
                            <option value="Sick">Sick</option>
                            <option value="Personal">Personal</option>
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor={`pto-days-${request.id}`}>Days</label>
                          <input
                            id={`pto-days-${request.id}`}
                            min="0.5"
                            onChange={(event) =>
                              setEditForms((current) => ({
                                ...current,
                                [request.id]: {
                                  ...current[request.id],
                                  days: event.target.value,
                                },
                              }))
                            }
                            step="0.5"
                            type="number"
                            value={editForm.days}
                          />
                        </div>
                      </div>
                      <div className="workspace-form-grid workspace-form-grid-compact">
                        <div className="field">
                          <label htmlFor={`pto-start-${request.id}`}>Start date</label>
                          <input
                            id={`pto-start-${request.id}`}
                            onChange={(event) =>
                              setEditForms((current) => ({
                                ...current,
                                [request.id]: {
                                  ...current[request.id],
                                  startDate: event.target.value,
                                },
                              }))
                            }
                            type="date"
                            value={editForm.startDate}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`pto-end-${request.id}`}>End date</label>
                          <input
                            id={`pto-end-${request.id}`}
                            onChange={(event) =>
                              setEditForms((current) => ({
                                ...current,
                                [request.id]: {
                                  ...current[request.id],
                                  endDate: event.target.value,
                                },
                              }))
                            }
                            type="date"
                            value={editForm.endDate}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor={`pto-notes-${request.id}`}>Notes</label>
                        <textarea
                          id={`pto-notes-${request.id}`}
                          onChange={(event) =>
                            setEditForms((current) => ({
                              ...current,
                              [request.id]: {
                                ...current[request.id],
                                notes: event.target.value,
                              },
                            }))
                          }
                          value={editForm.notes}
                        />
                      </div>
                    </div>
                  ) : request.notes ? (
                    <p>{request.notes}</p>
                  ) : null}

                  <div className="workspace-form-actions">
                    {request.status === "Pending" ? (
                      <>
                        {isEditing ? (
                          <button className="button-secondary" disabled={saving} onClick={() => void updateRequest(request.id)} type="button">
                            Save changes
                          </button>
                        ) : (
                          <button className="button-ghost" onClick={() => startEditing(request)} type="button">
                            Edit
                          </button>
                        )}
                        <button className="button-danger" disabled={saving} onClick={() => void deleteRequest(request.id)} type="button">
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
