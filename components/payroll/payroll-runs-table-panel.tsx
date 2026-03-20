"use client";

import { ApiTablePanel, renderCurrency, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PayrollRunRecord {
  id: string;
  periodLabel: string;
  employeeCount: number;
  payDate: string;
  status: string;
  totalAmount: number;
  varianceNote: string;
}

export function PayrollRunsTablePanel() {
  return (
    <ApiTablePanel<PayrollRunRecord>
      title="Payroll Runs"
      subtitle="Cycle status, headcount, variance, and payout totals."
      endpoint="/api/payroll/runs"
      emptyMessage="No payroll runs found."
      countLabel="runs"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Run",
          render: (item) => renderPrimary(item.periodLabel, item.varianceNote),
        },
        {
          label: "Employees",
          render: (item) => item.employeeCount,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Pay date",
          render: (item) => renderDate(item.payDate),
        },
        {
          label: "Total",
          render: (item) => renderCurrency(item.totalAmount),
        },
      ]}
    />
  );
}
