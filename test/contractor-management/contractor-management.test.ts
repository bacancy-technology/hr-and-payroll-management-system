import { GET } from "@/app/api/contractors/route";
import { listContractors } from "@/lib/modules/contractors/services/contractor-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/contractors/services/contractor-service", () => ({
  createContractor: vi.fn(),
  listContractors: vi.fn(),
}));

describe("contractor management", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists contractors", async () => {
    const contractors = [{ id: "contractor-1", fullName: "Avery Singh" }];
    vi.mocked(listContractors).mockResolvedValue(contractors as never);

    const response = await GET();

    await expectDataResponse(response, contractors);
    expect(listContractors).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
