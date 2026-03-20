import { ContractorsTablePanel } from "@/components/contractors/contractors-table-panel";
import { DirectoryOverviewPanel } from "@/components/directory/directory-overview-panel";
import { EmployeesTablePanel } from "@/components/employees/employees-table-panel";
import { OnboardingTasksTablePanel } from "@/components/onboarding/onboarding-tasks-table-panel";
import { OnboardingWorkflowsTablePanel } from "@/components/onboarding/onboarding-workflows-table-panel";
import { PerformanceReviewsTablePanel } from "@/components/performance/performance-reviews-table-panel";
import { PerformanceTemplatesTablePanel } from "@/components/performance/performance-templates-table-panel";
import { PtoRequestsTablePanel } from "@/components/pto/pto-requests-table-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";

const WORKFORCE_SECTIONS = [
  {
    id: "people-directory",
    title: "People Directory",
    description: "Employee roster health and searchable directory context.",
  },
  {
    id: "contractor-operations",
    title: "Contractor Operations",
    description: "Current contractor roster and assignment status.",
  },
  {
    id: "time-off-coverage",
    title: "Time-Off Coverage",
    description: "Pending and approved leave workflows needing action.",
  },
  {
    id: "onboarding-programs",
    title: "Onboarding Programs",
    description: "Workflow progress and open onboarding tasks.",
  },
  {
    id: "performance-cycles",
    title: "Performance Cycles",
    description: "Review execution and template readiness in one view.",
  },
];

export default function WorkforcePage() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Workforce"
        title="Manage people operations from roster to review cycles."
        description="This section surfaces the backend employee, contractor, PTO, onboarding, directory, and performance modules as operational frontend screens."
      />

      <WorkspaceSectionMap items={WORKFORCE_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Use the core roster and directory data together to manage reporting lines, employee status, and department placement."
          id="people-directory"
          title="People Directory"
        >
          <EmployeesTablePanel />
          <DirectoryOverviewPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Review contractor engagement status and current assignment coverage without leaving the workspace."
          id="contractor-operations"
          title="Contractor Operations"
        >
          <ContractorsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Keep leave decisions visible alongside the rest of people operations so staffing gaps are easier to catch."
          id="time-off-coverage"
          title="Time-Off Coverage"
        >
          <PtoRequestsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Track onboarding workflow rollout and the remaining tasks new hires still need completed."
          id="onboarding-programs"
          title="Onboarding Programs"
        >
          <OnboardingWorkflowsTablePanel />
          <OnboardingTasksTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="See active review cycles and template health together so calibration and process changes stay aligned."
          id="performance-cycles"
          title="Performance Cycles"
        >
          <PerformanceReviewsTablePanel />
          <PerformanceTemplatesTablePanel />
        </WorkspaceSection>
      </div>
    </>
  );
}
