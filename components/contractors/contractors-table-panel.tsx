"use client";

import { ApiTablePanel, renderCurrency, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ContractorRecord {
  id: string;
  fullName: string;
  specialization: string;
  status: string;
  location: string;
  paymentType: string;
  hourlyRate: number;
  flatRate: number;
}

export function ContractorsTablePanel() {
  return (
    <ApiTablePanel<ContractorRecord>
      title="Contractors"
      subtitle="External workforce, payment terms, and active engagements."
      endpoint="/api/contractors"
      emptyMessage="No contractors found."
      countLabel="contractors"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Contractor",
          render: (item) => renderPrimary(item.fullName, item.specialization),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Location",
          render: (item) => item.location,
        },
        {
          label: "Payment",
          render: (item) =>
            item.paymentType === "Hourly" ? `${item.paymentType} · ${renderCurrency(item.hourlyRate)}` : `${item.paymentType} · ${renderCurrency(item.flatRate)}`,
        },
      ]}
    />
  );
}
