import { GET } from "@/app/api/approvals/route";
import { listApprovals } from "@/lib/modules/approvals/services/approval-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/approvals/services/approval-service", () => ({
  listApprovals: vi.fn(),
}));

describe("approval workflows", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists approvals with entity filters", async () => {
    const approvals = [{ id: "approval-1", status: "Pending" }];
    vi.mocked(listApprovals).mockResolvedValue(approvals as never);

    const response = await GET(
      new Request("http://localhost/api/approvals?entityType=expense&status=Pending"),
    );

    await expectDataResponse(response, approvals);
    expect(listApprovals).toHaveBeenCalledWith(expect.anything(), "org-1", {
      entityType: "expense",
      status: "Pending",
    });
  });
});
