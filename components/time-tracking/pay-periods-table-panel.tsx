"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PayPeriodRecord {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
}

export function PayPeriodsTablePanel() {
  return (
    <ApiTablePanel<PayPeriodRecord>
      title="Pay Periods"
      subtitle="Open and scheduled payroll periods with pay dates."
      endpoint="/api/time-tracking/pay-periods"
      emptyMessage="No pay periods found."
      countLabel="periods"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Period",
          render: (item) => renderPrimary(item.label, `${renderDate(item.startDate)} - ${renderDate(item.endDate)}`),
        },
        {
          label: "Pay date",
          render: (item) => renderDate(item.payDate),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
