import { ContractorsTablePanel } from "@/components/contractors/contractors-table-panel";
import { DirectoryOverviewPanel } from "@/components/directory/directory-overview-panel";
import { EmployeesTablePanel } from "@/components/employees/employees-table-panel";
import { OnboardingTasksTablePanel } from "@/components/onboarding/onboarding-tasks-table-panel";
import { OnboardingWorkflowsTablePanel } from "@/components/onboarding/onboarding-workflows-table-panel";
import { PerformanceReviewsTablePanel } from "@/components/performance/performance-reviews-table-panel";
import { PerformanceTemplatesTablePanel } from "@/components/performance/performance-templates-table-panel";
import { PtoRequestsTablePanel } from "@/components/pto/pto-requests-table-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";

export default function WorkforcePage() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Workforce"
        title="Manage people operations from roster to review cycles."
        description="This section surfaces the backend employee, contractor, PTO, onboarding, directory, and performance modules as operational frontend screens."
      />

      <section className="workspace-section-grid">
        <EmployeesTablePanel />
        <DirectoryOverviewPanel />
        <ContractorsTablePanel />
        <PtoRequestsTablePanel />
        <OnboardingWorkflowsTablePanel />
        <OnboardingTasksTablePanel />
        <PerformanceReviewsTablePanel />
        <PerformanceTemplatesTablePanel />
      </section>
    </>
  );
}
