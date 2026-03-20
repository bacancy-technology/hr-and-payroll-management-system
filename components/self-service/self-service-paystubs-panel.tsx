"use client";

import { ApiTablePanel, renderCurrency, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface SelfServicePaystubRecord {
  id: string;
  netPay: number;
  grossPay: number;
  status: string;
  createdAt: string;
  payrollRun: {
    period_label?: string;
    periodLabel?: string;
    pay_date?: string;
    payDate?: string;
  } | null;
}

export function SelfServicePaystubsPanel() {
  return (
    <ApiTablePanel<SelfServicePaystubRecord>
      title="Paystubs"
      subtitle="Self-service paystub history from the employee-facing payroll API."
      endpoint="/api/self-service/paystubs"
      emptyMessage="No paystubs are available yet."
      countLabel="paystubs"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Pay period",
          render: (item) =>
            renderPrimary(
              item.payrollRun?.periodLabel ?? item.payrollRun?.period_label ?? "Payroll run",
              item.payrollRun?.payDate ?? item.payrollRun?.pay_date ?? null,
            ),
        },
        {
          label: "Net pay",
          render: (item) => renderCurrency(item.netPay),
        },
        {
          label: "Gross pay",
          render: (item) => renderCurrency(item.grossPay),
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
