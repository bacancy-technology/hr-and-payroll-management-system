import { GET } from "@/app/api/multi-state-compliance/route";
import { getMultiStateComplianceOverview } from "@/lib/modules/multi-state-compliance/services/multi-state-compliance-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/multi-state-compliance/services/multi-state-compliance-service", () => ({
  getMultiStateComplianceOverview: vi.fn(),
}));

describe("multi-state compliance", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the compliance overview with filters", async () => {
    const overview = { summary: { jurisdictions: 3 } };
    vi.mocked(getMultiStateComplianceOverview).mockResolvedValue(overview as never);

    const response = await GET(
      new Request("http://localhost/api/multi-state-compliance?scope=state"),
    );

    await expectDataResponse(response, overview);
    expect(getMultiStateComplianceOverview).toHaveBeenCalledWith(expect.anything(), "org-1", {
      scope: "state",
    });
  });
});
