import { ApprovalDecisionPanel } from "@/components/approvals/approval-decision-panel";
import { ApprovalsTablePanel } from "@/components/approvals/approvals-table-panel";
import { JobPostingPanel } from "@/components/automated-job-posting-integration/job-posting-panel";
import { BackupRecoveryOverviewPanel } from "@/components/backup-recovery/backup-recovery-overview-panel";
import { BenefitsEnrollmentsTablePanel } from "@/components/benefits/benefits-enrollments-table-panel";
import { BenefitsPlansTablePanel } from "@/components/benefits/benefits-plans-table-panel";
import { CustomWorkflowBuilderPanel } from "@/components/custom-workflow-builder/custom-workflow-builder-panel";
import { DocumentsTablePanel } from "@/components/documents/documents-table-panel";
import { ExpensesTablePanel } from "@/components/expenses/expenses-table-panel";
import { IntegrationSyncPanel } from "@/components/integrations/integration-sync-panel";
import { IntegrationsTablePanel } from "@/components/integrations/integrations-table-panel";
import { IntelligentDocumentProcessingPanel } from "@/components/intelligent-document-processing/intelligent-document-processing-panel";
import { BenefitsRecommendationsPanel } from "@/components/smart-benefits-recommendations/benefits-recommendations-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";
import { getDashboardData } from "@/lib/data";

const OPERATIONS_SECTIONS = [
  {
    id: "spend-controls",
    title: "Spend Controls",
    description: "Expenses and approvals that affect daily operations.",
  },
  {
    id: "documents-intake",
    title: "Documents Intake",
    description: "Operational document tracking plus AI-assisted processing.",
  },
  {
    id: "benefits-operations",
    title: "Benefits Operations",
    description: "Plan, enrollment, and recommendation views for benefits teams.",
  },
  {
    id: "recruiting-integrations",
    title: "Recruiting Integrations",
    description: "Job distribution and external system connection status.",
  },
  {
    id: "automation-resilience",
    title: "Automation and Resilience",
    description: "Workflow automation and recovery coverage for the platform.",
  },
];

export default async function OperationsPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Operations"
        title="Run the finance and HR operating system from one place."
        description="Frontend coverage here spans expenses, approvals, benefits, documents, integrations, recruiting distribution, intelligent document processing, backups, and workflow automation."
      />

      <WorkspaceSectionMap items={OPERATIONS_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Keep approvals close to employee spend so operational decisions and pending action stay aligned."
          id="spend-controls"
          title="Spend Controls"
        >
          <ExpensesTablePanel />
          <ApprovalsTablePanel />
          <ApprovalDecisionPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Manage incoming documents while the extraction layer highlights what can be processed automatically."
          id="documents-intake"
          title="Documents Intake"
        >
          <DocumentsTablePanel />
          <IntelligentDocumentProcessingPanel processing={data.intelligentDocumentProcessing} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Review plan inventory, live enrollments, and recommendation signals from the same benefits workspace."
          id="benefits-operations"
          title="Benefits Operations"
        >
          <BenefitsPlansTablePanel />
          <BenefitsEnrollmentsTablePanel />
          <BenefitsRecommendationsPanel recommendations={data.smartBenefitsRecommendations} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Track outbound job posting coverage and the health of the connected systems supporting operations."
          id="recruiting-integrations"
          title="Recruiting Integrations"
        >
          <JobPostingPanel integration={data.automatedJobPostingIntegration} />
          <IntegrationsTablePanel />
          <IntegrationSyncPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use workflow automation and recovery readiness together to tighten the operational backbone."
          id="automation-resilience"
          title="Automation and Resilience"
        >
          <CustomWorkflowBuilderPanel builder={data.customWorkflowBuilder} />
          <BackupRecoveryOverviewPanel />
        </WorkspaceSection>
      </div>
    </>
  );
}
