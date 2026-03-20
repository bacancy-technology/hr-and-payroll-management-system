import { ComplianceMonitoringPanel } from "@/components/automated-compliance-monitoring/compliance-monitoring-panel";
import { ComplianceAlertsTablePanel } from "@/components/compliance/compliance-alerts-table-panel";
import { ComplianceRulesTablePanel } from "@/components/compliance/compliance-rules-table-panel";
import { TaxFilingsTablePanel } from "@/components/compliance/tax-filings-table-panel";
import { MultiStateComplianceOverviewPanel } from "@/components/multi-state-compliance/multi-state-compliance-overview-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";
import { WorkersCompClaimsTablePanel } from "@/components/workers-comp/workers-comp-claims-table-panel";
import { WorkersCompPoliciesTablePanel } from "@/components/workers-comp/workers-comp-policies-table-panel";
import { getDashboardData } from "@/lib/data";

const COMPLIANCE_SECTIONS = [
  {
    id: "policy-controls",
    title: "Policy Controls",
    description: "Rules, alerts, and live monitoring for regulatory changes.",
  },
  {
    id: "filing-calendar",
    title: "Filing Calendar",
    description: "Tax filings and upcoming submission obligations.",
  },
  {
    id: "workers-comp-coverage",
    title: "Workers' Compensation",
    description: "Policy and claims visibility for workplace incidents.",
  },
  {
    id: "state-readiness",
    title: "State Readiness",
    description: "Multi-state expansion and coverage posture.",
  },
];

export default async function CompliancePage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Compliance"
        title="Track obligations, escalations, filings, and coverage risk."
        description="This section surfaces the backend compliance modules with operational views for rules, alerts, automated monitoring, workers’ compensation, filings, and multi-state readiness."
      />

      <WorkspaceSectionMap items={COMPLIANCE_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Use rule tracking, live alerts, and automated regulatory monitoring as one control surface."
          id="policy-controls"
          title="Policy Controls"
        >
          <ComplianceRulesTablePanel />
          <ComplianceAlertsTablePanel />
          <ComplianceMonitoringPanel monitoring={data.automatedComplianceMonitoring} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Keep filing obligations visible so tax work does not get lost inside broader compliance activity."
          id="filing-calendar"
          title="Filing Calendar"
        >
          <TaxFilingsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Review policy coverage and claims activity together to catch unresolved exposure."
          id="workers-comp-coverage"
          title="Workers' Compensation"
        >
          <WorkersCompPoliciesTablePanel />
          <WorkersCompClaimsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use the multi-state view to understand readiness before entering or scaling in new jurisdictions."
          id="state-readiness"
          title="State Readiness"
        >
          <MultiStateComplianceOverviewPanel />
        </WorkspaceSection>
      </div>
    </>
  );
}
