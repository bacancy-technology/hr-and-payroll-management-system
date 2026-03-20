"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ApprovalRecord {
  id: string;
  entityType: string;
  requestedByName: string;
  assignedToName: string;
  status: string;
  decisionNote: string | null;
  createdAt: string;
}

export function ApprovalsTablePanel() {
  return (
    <ApiTablePanel<ApprovalRecord>
      title="Approvals"
      subtitle="Approval workloads across leave and expenses."
      endpoint="/api/approvals"
      emptyMessage="No approvals found."
      countLabel="approvals"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Approval",
          render: (item) => renderPrimary(item.requestedByName, item.entityType.replace(/_/g, " ")),
        },
        {
          label: "Assigned",
          render: (item) => item.assignedToName,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Created",
          render: (item) => renderDate(item.createdAt),
        },
      ]}
    />
  );
}
