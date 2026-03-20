"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface WorkersCompPolicyRecord {
  id: string;
  policyName: string;
  carrierName: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: string;
}

export function WorkersCompPoliciesTablePanel() {
  return (
    <ApiTablePanel<WorkersCompPolicyRecord>
      title="Workers' Comp Policies"
      subtitle="Carrier coverage windows and policy status tracking."
      endpoint="/api/workers-comp/policies"
      emptyMessage="No workers' compensation policies found."
      countLabel="policies"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Policy",
          render: (item) => renderPrimary(item.policyName, item.carrierName),
        },
        {
          label: "Start",
          render: (item) => renderDate(item.coverageStartDate),
        },
        {
          label: "End",
          render: (item) => renderDate(item.coverageEndDate),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
