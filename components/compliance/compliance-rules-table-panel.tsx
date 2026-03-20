"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ComplianceRuleRecord {
  id: string;
  name: string;
  jurisdiction: string;
  category: string;
  deadlineDate: string;
  status: string;
}

export function ComplianceRulesTablePanel() {
  return (
    <ApiTablePanel<ComplianceRuleRecord>
      title="Compliance Rules"
      subtitle="Jurisdiction-level obligations with deadline tracking."
      endpoint="/api/compliance/rules"
      emptyMessage="No compliance rules found."
      countLabel="rules"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Rule",
          render: (item) => renderPrimary(item.name, item.jurisdiction),
        },
        {
          label: "Category",
          render: (item) => item.category,
        },
        {
          label: "Deadline",
          render: (item) => renderDate(item.deadlineDate),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
