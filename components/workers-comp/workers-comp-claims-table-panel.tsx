"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface WorkersCompClaimRecord {
  id: string;
  employeeName: string;
  incidentDate: string;
  injuryType: string;
  status: string;
  claimNumber: string;
}

export function WorkersCompClaimsTablePanel() {
  return (
    <ApiTablePanel<WorkersCompClaimRecord>
      title="Workers' Comp Claims"
      subtitle="Incident and claim tracking across employee cases."
      endpoint="/api/workers-comp/claims"
      emptyMessage="No workers' compensation claims found."
      countLabel="claims"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Claim",
          render: (item) => renderPrimary(item.employeeName, item.claimNumber),
        },
        {
          label: "Incident",
          render: (item) => renderDate(item.incidentDate),
        },
        {
          label: "Injury",
          render: (item) => item.injuryType,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
