import { GET } from "@/app/api/automation/workflow-builder/route";
import {
  buildCustomWorkflowBuilder,
  getCustomWorkflowBuilder,
} from "@/lib/modules/custom-workflow-builder/services/custom-workflow-builder-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/custom-workflow-builder/services/custom-workflow-builder-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/custom-workflow-builder/services/custom-workflow-builder-service")
  >("@/lib/modules/custom-workflow-builder/services/custom-workflow-builder-service");

  return {
    ...actual,
    getCustomWorkflowBuilder: vi.fn(),
  };
});

describe("custom workflow builder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds workflow templates and nodes from live process data", () => {
    const builder = buildCustomWorkflowBuilder({
      generatedAt: "2026-03-20T00:00:00.000Z",
      approvals: [
        {
          id: "approval-1",
          entityType: "leave_request",
          entityId: "leave-1",
          requestedByName: "Elena Torres",
          assignedToName: "Anika Raman",
          status: "Pending",
          decisionNote: null,
          decidedAt: null,
          createdAt: "2026-03-20T00:00:00.000Z",
        },
        {
          id: "approval-2",
          entityType: "expense",
          entityId: "expense-1",
          requestedByName: "Priya Nair",
          assignedToName: "Anika Raman",
          status: "Approved",
          decisionNote: "Approved",
          decidedAt: "2026-03-20T00:00:00.000Z",
          createdAt: "2026-03-19T00:00:00.000Z",
        },
      ],
      onboardingTasks: [
        {
          id: "task-1",
          workflowId: "workflow-1",
          title: "Collect signed offer letter",
          category: "Documents",
          assignedToName: "Elena Torres",
          status: "In Progress",
          dueDate: "2026-03-22",
          completedAt: null,
          notes: null,
          createdAt: "2026-03-20T00:00:00.000Z",
          workflow: null,
        },
        {
          id: "task-2",
          workflowId: "workflow-1",
          title: "Submit tax and bank details",
          category: "Payroll",
          assignedToName: "Elena Torres",
          status: "Pending",
          dueDate: "2026-03-23",
          completedAt: null,
          notes: null,
          createdAt: "2026-03-20T00:00:00.000Z",
          workflow: null,
        },
      ],
      onboardingWorkflows: [
        {
          id: "workflow-1",
          employeeId: "emp-1",
          employeeName: "Elena Torres",
          ownerName: "Anika Raman",
          status: "In Progress",
          startDate: "2026-03-18",
          targetDate: "2026-04-01",
          notes: null,
          createdAt: "2026-03-18T00:00:00.000Z",
          employee: null,
        },
      ],
    });

    expect(builder.summary.templates).toBe(3);
    expect(builder.summary.conditionalBranches).toBeGreaterThan(0);
    expect(builder.nodes.some((node) => node.nodeType === "Condition")).toBe(true);
  });

  it("loads the custom workflow builder from the route", async () => {
    const builder = { summary: { templates: 3 } };
    vi.mocked(getCustomWorkflowBuilder).mockResolvedValue(builder as never);

    const response = await GET();

    await expectDataResponse(response, builder);
    expect(getCustomWorkflowBuilder).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
