"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface IntegrationRecord {
  id: string;
  displayName: string;
  provider: string;
  category: string;
  connectionMode: string;
  status: string;
  lastSyncedAt: string | null;
}

export function IntegrationsTablePanel() {
  return (
    <ApiTablePanel<IntegrationRecord>
      title="Integrations"
      subtitle="Connected providers, sync modes, and last-sync health."
      endpoint="/api/integrations"
      emptyMessage="No integrations found."
      countLabel="integrations"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Integration",
          render: (item) => renderPrimary(item.displayName, item.provider),
        },
        {
          label: "Category",
          render: (item) => item.category,
        },
        {
          label: "Mode",
          render: (item) => item.connectionMode,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Last sync",
          render: (item) => renderDate(item.lastSyncedAt),
        },
      ]}
    />
  );
}
