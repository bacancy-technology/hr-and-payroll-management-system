import { GET } from "@/app/api/integrations/route";
import { listIntegrations } from "@/lib/modules/integrations/services/integration-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/integrations/services/integration-service", () => ({
  createIntegration: vi.fn(),
  listIntegrations: vi.fn(),
}));

describe("api integration framework", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists integrations with provider filters", async () => {
    const integrations = [{ id: "integration-1", provider: "QuickBooks" }];
    vi.mocked(listIntegrations).mockResolvedValue(integrations as never);

    const response = await GET(
      new Request(
        "http://localhost/api/integrations?provider=QuickBooks&status=Connected&category=Accounting",
      ),
    );

    await expectDataResponse(response, integrations);
    expect(listIntegrations).toHaveBeenCalledWith(expect.anything(), "org-1", {
      provider: "QuickBooks",
      status: "Connected",
      category: "Accounting",
    });
  });
});
