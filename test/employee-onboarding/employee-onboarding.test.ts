import { GET } from "@/app/api/onboarding/workflows/route";
import { listOnboardingWorkflows } from "@/lib/modules/onboarding/services/onboarding-workflow-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/onboarding/services/onboarding-workflow-service", () => ({
  listOnboardingWorkflows: vi.fn(),
  createOnboardingWorkflow: vi.fn(),
}));

describe("employee onboarding", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists onboarding workflows", async () => {
    const workflows = [{ id: "workflow-1", status: "In Progress" }];
    vi.mocked(listOnboardingWorkflows).mockResolvedValue(workflows as never);

    const response = await GET();

    await expectDataResponse(response, workflows);
    expect(listOnboardingWorkflows).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
