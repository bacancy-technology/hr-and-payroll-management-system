import type {
  CustomWorkflowBuilder,
  WorkflowBuilderNode,
  WorkflowBuilderTemplate,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listApprovals } from "@/lib/modules/approvals/services/approval-service";
import { listOnboardingTasks } from "@/lib/modules/onboarding/services/onboarding-task-service";
import { listOnboardingWorkflows } from "@/lib/modules/onboarding/services/onboarding-workflow-service";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildCustomWorkflowBuilder(input: {
  approvals: Awaited<ReturnType<typeof listApprovals>>;
  onboardingTasks: Awaited<ReturnType<typeof listOnboardingTasks>>;
  onboardingWorkflows: Awaited<ReturnType<typeof listOnboardingWorkflows>>;
  generatedAt?: string;
}) {
  const leaveApprovals = input.approvals.filter((approval) => approval.entityType === "leave_request");
  const expenseApprovals = input.approvals.filter((approval) => approval.entityType === "expense");
  const onboardingPendingTasks = input.onboardingTasks.filter((task) => task.status !== "Completed");

  const templates: WorkflowBuilderTemplate[] = [
    {
      id: "workflow-template-onboarding",
      name: "Employee Onboarding",
      category: "People Ops",
      status: onboardingPendingTasks.length > 0 ? "Active" : "Draft",
      automationCoverage: onboardingPendingTasks.length === 0 ? 75 : 67,
      conditionalBranches: 1,
      stepCount: 4,
      summary: "Coordinates provisioning, document collection, and payroll readiness for new hires.",
    },
    {
      id: "workflow-template-leave",
      name: "Leave Approval",
      category: "Manager Workflow",
      status: leaveApprovals.some((approval) => approval.status !== "Approved") ? "Needs Review" : "Active",
      automationCoverage: 50,
      conditionalBranches: 1,
      stepCount: 4,
      summary: "Routes requests through manager review with coverage checks before approval sync.",
    },
    {
      id: "workflow-template-expense",
      name: "Expense Reimbursement",
      category: "Finance",
      status: expenseApprovals.some((approval) => approval.status === "Pending") ? "Active" : "Draft",
      automationCoverage: 75,
      conditionalBranches: 1,
      stepCount: 4,
      summary: "Applies policy checks and approval routing before reimbursement handoff.",
    },
  ];

  const nodes: WorkflowBuilderNode[] = [
    {
      id: "workflow-node-onboarding-trigger",
      templateId: "workflow-template-onboarding",
      label: "New hire created",
      nodeType: "Trigger",
      owner: "People Ops",
      executionMode: "Automated",
      status: "Ready",
      detail: "Starts onboarding when a new employee record is created.",
    },
    {
      id: "workflow-node-onboarding-documents",
      templateId: "workflow-template-onboarding",
      label: "Collect documents",
      nodeType: "Action",
      owner: "Employee",
      executionMode: "Assisted",
      status: onboardingPendingTasks.some((task) => task.category === "Documents") ? "Watch" : "Ready",
      detail: `${input.onboardingTasks.filter((task) => task.category === "Documents").length} document-related task(s) currently modeled.`,
    },
    {
      id: "workflow-node-onboarding-conditional",
      templateId: "workflow-template-onboarding",
      label: "If payroll setup incomplete",
      nodeType: "Condition",
      owner: "Payroll",
      executionMode: "Manual",
      status: onboardingPendingTasks.some((task) => task.category === "Payroll") ? "Watch" : "Ready",
      detail: "Branches to payroll validation when tax or banking setup is still pending.",
    },
    {
      id: "workflow-node-onboarding-finish",
      templateId: "workflow-template-onboarding",
      label: "Close onboarding",
      nodeType: "Action",
      owner: "People Ops",
      executionMode: "Automated",
      status: onboardingPendingTasks.length > 0 ? "Watch" : "Ready",
      detail: "Final status updates can be automated when dependent tasks are complete.",
    },
    {
      id: "workflow-node-leave-trigger",
      templateId: "workflow-template-leave",
      label: "Leave request submitted",
      nodeType: "Trigger",
      owner: "Employee",
      executionMode: "Automated",
      status: "Ready",
      detail: "Launches manager review as soon as a leave request is created.",
    },
    {
      id: "workflow-node-leave-coverage",
      templateId: "workflow-template-leave",
      label: "Check coverage overlap",
      nodeType: "Condition",
      owner: "Manager",
      executionMode: "Assisted",
      status: leaveApprovals.some((approval) => approval.status === "In Review") ? "Watch" : "Ready",
      detail: "Coverage and payroll-close timing can branch the workflow before final approval.",
    },
    {
      id: "workflow-node-leave-approval",
      templateId: "workflow-template-leave",
      label: "Manager approval",
      nodeType: "Approval",
      owner: "Manager",
      executionMode: "Manual",
      status: leaveApprovals.some((approval) => approval.status === "Pending") ? "Blocked" : "Watch",
      detail: `${leaveApprovals.filter((approval) => approval.status !== "Approved").length} leave approval(s) still require attention.`,
    },
    {
      id: "workflow-node-expense-trigger",
      templateId: "workflow-template-expense",
      label: "Expense submitted",
      nodeType: "Trigger",
      owner: "Employee",
      executionMode: "Automated",
      status: "Ready",
      detail: "Submission metadata and receipts can automatically start reimbursement routing.",
    },
    {
      id: "workflow-node-expense-policy",
      templateId: "workflow-template-expense",
      label: "Check policy threshold",
      nodeType: "Condition",
      owner: "Finance",
      executionMode: "Automated",
      status: "Ready",
      detail: "Expense category rules determine whether the workflow needs finance review or straight-through handling.",
    },
    {
      id: "workflow-node-expense-approval",
      templateId: "workflow-template-expense",
      label: "Finance approval",
      nodeType: "Approval",
      owner: "Finance",
      executionMode: "Assisted",
      status: expenseApprovals.some((approval) => approval.status === "Pending") ? "Watch" : "Ready",
      detail: `${expenseApprovals.filter((approval) => approval.status !== "Approved").length} expense approval(s) remain active.`,
    },
  ];

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      templates: templates.length,
      automatedSteps: nodes.filter((node) => node.executionMode === "Automated").length,
      conditionalBranches: nodes.filter((node) => node.nodeType === "Condition").length,
      activeWorkflows:
        input.onboardingWorkflows.filter((workflow) => workflow.status !== "Completed").length +
        input.approvals.filter((approval) => approval.status !== "Approved").length,
    },
    templates: templates.map((template) => ({
      ...template,
      automationCoverage: round(template.automationCoverage),
    })),
    nodes,
  } satisfies CustomWorkflowBuilder;
}

export async function getCustomWorkflowBuilder(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [approvals, onboardingTasks, onboardingWorkflows] = await Promise.all([
    listApprovals(supabase, organizationId),
    listOnboardingTasks(supabase, organizationId),
    listOnboardingWorkflows(supabase, organizationId),
  ]);

  return buildCustomWorkflowBuilder({
    approvals,
    onboardingTasks,
    onboardingWorkflows,
  });
}
