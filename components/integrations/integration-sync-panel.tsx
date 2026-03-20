"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface IntegrationRecord {
  id: string;
  displayName: string;
  provider: string;
  status: string;
}

interface IntegrationSyncRun {
  id: string;
  triggerSource: string;
  status: string;
  recordsProcessed: number;
  completedAt: string | null;
  summary: string | null;
}

export function IntegrationSyncPanel() {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [syncRuns, setSyncRuns] = useState<IntegrationSyncRun[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    const data = await requestApi<IntegrationRecord[]>("/api/integrations");
    setIntegrations(data);
    setSelectedIntegrationId((current) => current || data[0]?.id || "");
    return data;
  }, []);

  const loadSyncRuns = useCallback(async (integrationId: string) => {
    if (!integrationId) {
      setSyncRuns([]);
      return;
    }

    const data = await requestApi<IntegrationSyncRun[]>(`/api/integrations/${integrationId}/sync`);
    setSyncRuns(data);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const integrationData = await loadIntegrations();
      await loadSyncRuns(selectedIntegrationId || integrationData[0]?.id || "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load integrations.");
    } finally {
      setLoading(false);
    }
  }, [loadIntegrations, loadSyncRuns, selectedIntegrationId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedIntegrationId) {
      return;
    }

    void loadSyncRuns(selectedIntegrationId).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load sync history.");
    });
  }, [loadSyncRuns, selectedIntegrationId]);

  async function runSync() {
    try {
      setSyncing(true);
      setNotice(null);
      await requestApi(`/api/integrations/${selectedIntegrationId}/sync`, {
        method: "POST",
        body: JSON.stringify({
          triggerSource: "workspace",
          recordsProcessed: 24,
          summary: "Manual sync triggered from the frontend workspace.",
        }),
      });
      setNotice("Integration sync completed.");
      await loadSyncRuns(selectedIntegrationId);
      await loadIntegrations();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Integration sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Integration Sync</h3>
          <p className="panel-subtitle">Run provider syncs and inspect recent sync history from the operations workspace.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${syncRuns.length} runs`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      <div className="workspace-form-grid">
        <div className="workspace-action-card">
          <strong>Run manual sync</strong>
          <div className="field">
            <label htmlFor="integration-select">Integration</label>
            <select
              id="integration-select"
              onChange={(event) => setSelectedIntegrationId(event.target.value)}
              value={selectedIntegrationId}
            >
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.displayName} · {integration.provider} · {integration.status}
                </option>
              ))}
            </select>
          </div>
          <button
            className="button-secondary"
            disabled={!selectedIntegrationId || syncing}
            onClick={() => void runSync()}
            type="button"
          >
            Run sync
          </button>
        </div>

        <div className="workspace-action-card">
          <strong>Recent sync runs</strong>
          {syncRuns.length === 0 ? <p className="muted">No sync runs recorded yet.</p> : null}
          <div className="workspace-action-stack">
            {syncRuns.map((run) => (
              <div className="workspace-mini-card" key={run.id}>
                <div className="split">
                  <div>
                    <strong>{run.triggerSource}</strong>
                    <p className="muted">{run.recordsProcessed} records processed</p>
                  </div>
                  {renderStatus(run.status)}
                </div>
                <p className="muted">
                  Completed {run.completedAt ? renderDate(run.completedAt) : "not yet"}
                </p>
                {run.summary ? <p>{run.summary}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
