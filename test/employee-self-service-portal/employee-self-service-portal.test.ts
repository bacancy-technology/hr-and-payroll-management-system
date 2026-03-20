import { GET } from "@/app/api/self-service/route";
import { getSelfServiceWorkspace } from "@/lib/modules/self-service/services/self-service-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/self-service/services/self-service-service", () => ({
  getSelfServiceWorkspace: vi.fn(),
}));

describe("employee self-service portal", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the self-service workspace", async () => {
    const workspace = { summary: { paystubCount: 2 } };
    vi.mocked(getSelfServiceWorkspace).mockResolvedValue(workspace as never);

    const response = await GET();

    await expectDataResponse(response, workspace);
    expect(getSelfServiceWorkspace).toHaveBeenCalledWith(expect.anything(), "org-1", "user-1");
  });
});
