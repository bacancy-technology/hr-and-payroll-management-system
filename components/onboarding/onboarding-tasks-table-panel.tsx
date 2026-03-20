"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface OnboardingTaskRecord {
  id: string;
  title: string;
  category: string;
  assignedToName: string;
  status: string;
  dueDate: string;
}

export function OnboardingTasksTablePanel() {
  return (
    <ApiTablePanel<OnboardingTaskRecord>
      title="Onboarding Tasks"
      subtitle="Task-level onboarding execution with due dates and status."
      endpoint="/api/onboarding/tasks"
      emptyMessage="No onboarding tasks found."
      countLabel="tasks"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Task",
          render: (item) => renderPrimary(item.title, item.category),
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
          label: "Due",
          render: (item) => renderDate(item.dueDate),
        },
      ]}
    />
  );
}
