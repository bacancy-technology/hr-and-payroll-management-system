"use client";

import { ApiTablePanel, renderCurrency, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface TaxFilingRecord {
  id: string;
  filingName: string;
  jurisdiction: string;
  periodLabel: string;
  dueDate: string;
  amount: number;
  status: string;
}

export function TaxFilingsTablePanel() {
  return (
    <ApiTablePanel<TaxFilingRecord>
      title="Tax Filings"
      subtitle="Payroll-related tax filings with jurisdiction and amount visibility."
      endpoint="/api/tax-filings"
      emptyMessage="No tax filings found."
      countLabel="filings"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Filing",
          render: (item) => renderPrimary(item.filingName, item.jurisdiction),
        },
        {
          label: "Period",
          render: (item) => item.periodLabel,
        },
        {
          label: "Due",
          render: (item) => renderDate(item.dueDate),
        },
        {
          label: "Amount",
          render: (item) => renderCurrency(item.amount),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
