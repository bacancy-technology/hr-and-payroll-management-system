import { GET } from "@/app/api/benefits/plans/route";
import { listBenefitsPlans } from "@/lib/modules/benefits/services/benefits-plan-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/benefits/services/benefits-plan-service", () => ({
  listBenefitsPlans: vi.fn(),
  createBenefitsPlan: vi.fn(),
}));

describe("benefits administration", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists benefits plans", async () => {
    const plans = [{ id: "plan-1", name: "Health Plus" }];
    vi.mocked(listBenefitsPlans).mockResolvedValue(plans as never);

    const response = await GET();

    await expectDataResponse(response, plans);
    expect(listBenefitsPlans).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
