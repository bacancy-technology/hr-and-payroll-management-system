import { GET } from "@/app/api/workers-comp/policies/route";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { listWorkersCompPolicies } from "@/lib/modules/workers-comp/services/workers-comp-policy-service";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/workers-comp/services/workers-comp-policy-service", () => ({
  createWorkersCompPolicy: vi.fn(),
  listWorkersCompPolicies: vi.fn(),
}));

describe("workers' compensation", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists workers' compensation policies", async () => {
    const policies = [{ id: "policy-1", status: "Active" }];
    vi.mocked(listWorkersCompPolicies).mockResolvedValue(policies as never);

    const response = await GET(
      new Request("http://localhost/api/workers-comp/policies?status=Active"),
    );

    await expectDataResponse(response, policies);
    expect(listWorkersCompPolicies).toHaveBeenCalledWith(expect.anything(), "org-1", {
      status: "Active",
    });
  });
});
