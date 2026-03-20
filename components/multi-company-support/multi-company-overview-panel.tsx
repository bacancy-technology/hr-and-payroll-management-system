"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface MultiCompanyOverviewPayload {
  summary: {
    totalEntities: number;
    activeEntities: number;
    totalEmployees: number;
    payrollFrequencies: number;
  };
  entities: Array<{
    id: string;
    name: string;
    registrationState: string;
    payrollFrequency: string;
    employeeCount: number;
    status: string;
  }>;
}

export function MultiCompanyOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Multi-Company Support"
      subtitle="Entity coverage across payroll frequencies and active operating units."
      endpoint="/api/multi-company-support"
      selectMetrics={(payload) => {
        const data = payload as MultiCompanyOverviewPayload;

        return [
          {
            label: "Entities",
            value: String(data.summary.totalEntities),
            detail: "Total legal entities tracked in the workspace.",
          },
          {
            label: "Active",
            value: String(data.summary.activeEntities),
            detail: "Entities currently operating.",
          },
          {
            label: "Employees",
            value: String(data.summary.totalEmployees),
            detail: "Headcount covered by entity modeling.",
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as MultiCompanyOverviewPayload;

        return (
          <div className="workspace-card-grid">
            {data.entities.map((entity) => (
              <div className="workspace-inline-card" key={entity.id}>
                <span className="small-label">{entity.registrationState}</span>
                <strong>{entity.name}</strong>
                <p>
                  {entity.employeeCount} employees · {entity.payrollFrequency}
                </p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
