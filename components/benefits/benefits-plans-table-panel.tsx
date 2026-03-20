"use client";

import { ApiTablePanel, renderCurrency, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface BenefitsPlanRecord {
  id: string;
  name: string;
  providerName: string;
  category: string;
  employeeCost: number;
  employerCost: number;
  status: string;
}

export function BenefitsPlansTablePanel() {
  return (
    <ApiTablePanel<BenefitsPlanRecord>
      title="Benefits Plans"
      subtitle="Available plans with employee and employer cost coverage."
      endpoint="/api/benefits/plans"
      emptyMessage="No benefits plans found."
      countLabel="plans"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Plan",
          render: (item) => renderPrimary(item.name, item.providerName),
        },
        {
          label: "Category",
          render: (item) => item.category,
        },
        {
          label: "Employee cost",
          render: (item) => renderCurrency(item.employeeCost),
        },
        {
          label: "Employer cost",
          render: (item) => renderCurrency(item.employerCost),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
