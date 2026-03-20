"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface OnboardingWorkflowRecord {
  id: string;
  employeeName: string;
  ownerName: string;
  status: string;
  startDate: string;
  targetDate: string;
}

export function OnboardingWorkflowsTablePanel() {
  return (
    <ApiTablePanel<OnboardingWorkflowRecord>
      title="Onboarding Workflows"
      subtitle="Active onboarding timelines and owner coverage."
      endpoint="/api/onboarding/workflows"
      emptyMessage="No onboarding workflows found."
      countLabel="workflows"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Employee",
          render: (item) => renderPrimary(item.employeeName, item.ownerName),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Start",
          render: (item) => renderDate(item.startDate),
        },
        {
          label: "Target",
          render: (item) => renderDate(item.targetDate),
        },
      ]}
    />
  );
}
