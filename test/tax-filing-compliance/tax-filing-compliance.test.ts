import { GET } from "@/app/api/tax-filings/route";
import { listTaxFilings } from "@/lib/modules/compliance/services/tax-filing-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/compliance/services/tax-filing-service", () => ({
  listTaxFilings: vi.fn(),
  createTaxFiling: vi.fn(),
}));

describe("tax filing compliance", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists tax filings", async () => {
    const filings = [{ id: "filing-1", filingName: "941 Q1" }];
    vi.mocked(listTaxFilings).mockResolvedValue(filings as never);

    const response = await GET();

    await expectDataResponse(response, filings);
    expect(listTaxFilings).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
