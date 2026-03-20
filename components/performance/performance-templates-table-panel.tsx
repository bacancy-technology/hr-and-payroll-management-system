"use client";

import { ApiTablePanel, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PerformanceTemplateRecord {
  id: string;
  name: string;
  cycleLabel: string;
  reviewType: string;
  status: string;
}

export function PerformanceTemplatesTablePanel() {
  return (
    <ApiTablePanel<PerformanceTemplateRecord>
      title="Performance Templates"
      subtitle="Reusable review frameworks supporting manager and quarterly cycles."
      endpoint="/api/performance/templates"
      emptyMessage="No performance templates found."
      countLabel="templates"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Template",
          render: (item) => renderPrimary(item.name, item.cycleLabel),
        },
        {
          label: "Type",
          render: (item) => item.reviewType,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
