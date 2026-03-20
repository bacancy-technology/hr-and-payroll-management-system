"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface TimeEntryRecord {
  id: string;
  workDate: string;
  hoursWorked: number;
  overtimeHours: number;
  status: string;
  employee: { full_name: string } | null;
}

export function TimeEntriesTablePanel() {
  return (
    <ApiTablePanel<TimeEntryRecord>
      title="Time Entries"
      subtitle="Tracked hours, overtime, and submission status."
      endpoint="/api/time-tracking/entries"
      emptyMessage="No time entries found."
      countLabel="entries"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Entry",
          render: (item) => renderPrimary(item.employee?.full_name ?? "Unknown employee", `${item.hoursWorked} hrs`),
        },
        {
          label: "Date",
          render: (item) => renderDate(item.workDate),
        },
        {
          label: "Overtime",
          render: (item) => `${item.overtimeHours} hrs`,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
