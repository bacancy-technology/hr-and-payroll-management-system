import { ApprovalsTablePanel } from "@/components/approvals/approvals-table-panel";
import { BackupRecoveryOverviewPanel } from "@/components/backup-recovery/backup-recovery-overview-panel";
import { BenefitsEnrollmentsTablePanel } from "@/components/benefits/benefits-enrollments-table-panel";
import { BenefitsPlansTablePanel } from "@/components/benefits/benefits-plans-table-panel";
import { CustomWorkflowBuilderPanel } from "@/components/custom-workflow-builder/custom-workflow-builder-panel";
import { DocumentsTablePanel } from "@/components/documents/documents-table-panel";
import { ExpensesTablePanel } from "@/components/expenses/expenses-table-panel";
import { IntegrationsTablePanel } from "@/components/integrations/integrations-table-panel";
import { IntelligentDocumentProcessingPanel } from "@/components/intelligent-document-processing/intelligent-document-processing-panel";
import { JobPostingPanel } from "@/components/automated-job-posting-integration/job-posting-panel";
import { BenefitsRecommendationsPanel } from "@/components/smart-benefits-recommendations/benefits-recommendations-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { getDashboardData } from "@/lib/data";

export default async function OperationsPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Operations"
        title="Run the finance and HR operating system from one place."
        description="Frontend coverage here spans expenses, approvals, benefits, documents, integrations, recruiting distribution, intelligent document processing, backups, and workflow automation."
      />

      <section className="workspace-section-grid">
        <ExpensesTablePanel />
        <ApprovalsTablePanel />
        <DocumentsTablePanel />
        <BenefitsPlansTablePanel />
        <BenefitsEnrollmentsTablePanel />
        <BenefitsRecommendationsPanel recommendations={data.smartBenefitsRecommendations} />
        <JobPostingPanel integration={data.automatedJobPostingIntegration} />
        <IntegrationsTablePanel />
        <BackupRecoveryOverviewPanel />
        <IntelligentDocumentProcessingPanel processing={data.intelligentDocumentProcessing} />
        <CustomWorkflowBuilderPanel builder={data.customWorkflowBuilder} />
      </section>
    </>
  );
}
