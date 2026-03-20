"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface MultiStatePayload {
  summary: {
    jurisdictions: number;
    states: number;
    localities: number;
    federalJurisdictions: number;
    openRules: number;
    openAlerts: number;
    pendingTaxFilings: number;
  };
  jurisdictions: Array<{
    jurisdiction: string;
    scope: string;
    summary: {
      openRules: number;
      openAlerts: number;
      pendingTaxFilings: number;
      workersCompPolicies: number;
    };
  }>;
}

export function MultiStateComplianceOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Multi-State Compliance"
      subtitle="Jurisdiction coverage across rules, alerts, filings, and policy support."
      endpoint="/api/multi-state-compliance"
      selectMetrics={(payload) => {
        const data = payload as MultiStatePayload;

        return [
          {
            label: "Jurisdictions",
            value: String(data.summary.jurisdictions),
            detail: "All covered jurisdictions in the compliance scope.",
          },
          {
            label: "Open rules",
            value: String(data.summary.openRules),
            detail: "Rules requiring continued tracking.",
          },
          {
            label: "Open alerts",
            value: String(data.summary.openAlerts),
            detail: "Compliance alerts still unresolved.",
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as MultiStatePayload;

        return (
          <div className="workspace-card-grid">
            {data.jurisdictions.map((item) => (
              <div className="workspace-inline-card" key={item.jurisdiction}>
                <span className="small-label">{item.scope}</span>
                <strong>{item.jurisdiction}</strong>
                <p>
                  {item.summary.openRules} rules · {item.summary.openAlerts} alerts · {item.summary.pendingTaxFilings} filings
                </p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
