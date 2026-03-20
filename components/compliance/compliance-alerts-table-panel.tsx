"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ComplianceAlertRecord {
  id: string;
  title: string;
  severity: string;
  status: string;
  dueDate: string;
  message: string;
}

export function ComplianceAlertsTablePanel() {
  return (
    <ApiTablePanel<ComplianceAlertRecord>
      title="Compliance Alerts"
      subtitle="Open compliance escalations and follow-up deadlines."
      endpoint="/api/compliance/alerts"
      emptyMessage="No compliance alerts found."
      countLabel="alerts"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Alert",
          render: (item) => renderPrimary(item.title, item.message),
        },
        {
          label: "Severity",
          render: (item) => item.severity,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Due",
          render: (item) => renderDate(item.dueDate),
        },
      ]}
    />
  );
}
