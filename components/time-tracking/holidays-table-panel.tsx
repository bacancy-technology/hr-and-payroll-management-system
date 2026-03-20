"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface HolidayRecord {
  id: string;
  name: string;
  holidayDate: string;
  type: string;
  appliesTo: string;
  status: string;
}

export function HolidaysTablePanel() {
  return (
    <ApiTablePanel<HolidayRecord>
      title="Holidays"
      subtitle="Company and public holidays affecting scheduling and payroll timing."
      endpoint="/api/time-tracking/holidays"
      emptyMessage="No holidays found."
      countLabel="holidays"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Holiday",
          render: (item) => renderPrimary(item.name, item.type),
        },
        {
          label: "Applies to",
          render: (item) => item.appliesTo,
        },
        {
          label: "Date",
          render: (item) => renderDate(item.holidayDate),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
