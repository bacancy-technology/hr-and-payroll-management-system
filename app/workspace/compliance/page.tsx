import { ComplianceMonitoringPanel } from "@/components/automated-compliance-monitoring/compliance-monitoring-panel";
import { ComplianceAlertsTablePanel } from "@/components/compliance/compliance-alerts-table-panel";
import { ComplianceRulesTablePanel } from "@/components/compliance/compliance-rules-table-panel";
import { TaxFilingsTablePanel } from "@/components/compliance/tax-filings-table-panel";
import { MultiStateComplianceOverviewPanel } from "@/components/multi-state-compliance/multi-state-compliance-overview-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkersCompClaimsTablePanel } from "@/components/workers-comp/workers-comp-claims-table-panel";
import { WorkersCompPoliciesTablePanel } from "@/components/workers-comp/workers-comp-policies-table-panel";
import { getDashboardData } from "@/lib/data";

export default async function CompliancePage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Compliance"
        title="Track obligations, escalations, filings, and coverage risk."
        description="This section surfaces the backend compliance modules with operational views for rules, alerts, automated monitoring, workers’ compensation, filings, and multi-state readiness."
      />

      <section className="workspace-section-grid">
        <ComplianceRulesTablePanel />
        <ComplianceAlertsTablePanel />
        <TaxFilingsTablePanel />
        <WorkersCompPoliciesTablePanel />
        <WorkersCompClaimsTablePanel />
        <MultiStateComplianceOverviewPanel />
        <ComplianceMonitoringPanel monitoring={data.automatedComplianceMonitoring} />
      </section>
    </>
  );
}
