"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface BackupRecoveryOverviewPayload {
  summary: {
    backups: number;
    completedBackups: number;
    recoveries: number;
    successfulRecoveries: number;
    retainedStorageMb: number;
  };
  recentBackups: Array<{
    id: string;
    backupType: string;
    status: string;
    snapshotSizeMb: number;
  }>;
  recentRecoveries: Array<{
    id: string;
    recoveryType: string;
    status: string;
    targetScope: string;
  }>;
}

export function BackupRecoveryOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Backup Recovery"
      subtitle="Backup health, recovery activity, and retained storage visibility."
      endpoint="/api/backup-recovery"
      selectMetrics={(payload) => {
        const data = payload as BackupRecoveryOverviewPayload;

        return [
          {
            label: "Backups",
            value: String(data.summary.backups),
            detail: `${data.summary.completedBackups} completed successfully.`,
          },
          {
            label: "Recoveries",
            value: String(data.summary.recoveries),
            detail: `${data.summary.successfulRecoveries} successful recovery events.`,
          },
          {
            label: "Storage",
            value: `${Math.round(data.summary.retainedStorageMb)} MB`,
            detail: "Retained snapshot storage currently tracked.",
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as BackupRecoveryOverviewPayload;

        return (
          <div className="workspace-card-grid">
            {data.recentBackups.slice(0, 2).map((backup) => (
              <div className="workspace-inline-card" key={backup.id}>
                <span className="small-label">{backup.backupType}</span>
                <strong>{backup.status}</strong>
                <p>{Math.round(backup.snapshotSizeMb)} MB snapshot</p>
              </div>
            ))}
            {data.recentRecoveries.slice(0, 1).map((recovery) => (
              <div className="workspace-inline-card" key={recovery.id}>
                <span className="small-label">{recovery.recoveryType}</span>
                <strong>{recovery.status}</strong>
                <p>{recovery.targetScope}</p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
