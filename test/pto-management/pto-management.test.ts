import { GET } from "@/app/api/pto/requests/route";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/pto/services/pto-service", () => ({
  listPtoRequests: vi.fn(),
  createPtoRequest: vi.fn(),
}));

describe("pto management", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists pto requests", async () => {
    const requests = [{ id: "pto-1", status: "Pending" }];
    vi.mocked(listPtoRequests).mockResolvedValue(requests as never);

    const response = await GET();

    await expectDataResponse(response, requests);
    expect(listPtoRequests).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
