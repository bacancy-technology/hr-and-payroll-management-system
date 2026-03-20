"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PtoRequestRecord {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  approverName: string;
}

export function PtoRequestsTablePanel() {
  return (
    <ApiTablePanel<PtoRequestRecord>
      title="PTO Requests"
      subtitle="Employee time-off requests and approval coverage."
      endpoint="/api/pto/requests"
      emptyMessage="No PTO requests found."
      countLabel="requests"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Employee",
          render: (item) => renderPrimary(item.employeeName, item.type),
        },
        {
          label: "Dates",
          render: (item) => `${renderDate(item.startDate)} - ${renderDate(item.endDate)}`,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Approver",
          render: (item) => item.approverName,
        },
      ]}
    />
  );
}
