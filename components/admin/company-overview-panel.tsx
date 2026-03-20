"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";
import { renderPrimary } from "@/components/workspace-data/api-table-panel";

interface CompanyPayload {
  id: string;
  name: string;
  industry: string;
  headquarters: string;
  created_at: string;
}

export function CompanyOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Company Settings"
      subtitle="Organization-level identity and headquarters metadata."
      endpoint="/api/admin/company"
      metricLabel="fields"
      selectMetrics={(payload) => {
        const data = payload as CompanyPayload;

        return [
          {
            label: "Name",
            value: data.name,
            detail: "Workspace organization name.",
          },
          {
            label: "Industry",
            value: data.industry,
            detail: "Primary industry classification.",
          },
          {
            label: "Headquarters",
            value: data.headquarters,
            detail: "Default company HQ used across the workspace.",
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as CompanyPayload;

        return <div className="announcement-item">{renderPrimary(data.name, `Organization ID: ${data.id}`)}</div>;
      }}
    />
  );
}
