import { POST } from "@/app/api/direct-deposit/verify/route";
import { verifyDirectDeposit } from "@/lib/modules/direct-deposit/services/direct-deposit-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import {
  createApiContext,
  createJsonRequest,
  expectDataResponse,
} from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/direct-deposit/services/direct-deposit-service", () => ({
  verifyDirectDeposit: vi.fn(),
}));

describe("direct deposit setup", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("verifies a direct deposit account", async () => {
    const bankAccount = { id: "bank-1", status: "Verified" };
    vi.mocked(verifyDirectDeposit).mockResolvedValue(bankAccount as never);

    const response = await POST(
      createJsonRequest("http://localhost/api/direct-deposit/verify", "POST", {
        bankAccountId: "123e4567-e89b-42d3-a456-426614174000",
      }),
    );

    await expectDataResponse(response, bankAccount);
    expect(verifyDirectDeposit).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "123e4567-e89b-42d3-a456-426614174000",
    );
  });
});
