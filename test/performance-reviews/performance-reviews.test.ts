import { GET } from "@/app/api/performance/reviews/route";
import { listPerformanceReviews } from "@/lib/modules/performance/services/performance-review-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/performance/services/performance-review-service", () => ({
  createPerformanceReview: vi.fn(),
  listPerformanceReviews: vi.fn(),
}));

describe("performance reviews", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists reviews with employee and status filters", async () => {
    const reviews = [{ id: "review-1", status: "Draft" }];
    vi.mocked(listPerformanceReviews).mockResolvedValue(reviews as never);

    const response = await GET(
      new Request(
        "http://localhost/api/performance/reviews?employeeId=123e4567-e89b-42d3-a456-426614174001&status=Draft&templateId=123e4567-e89b-42d3-a456-426614174002",
      ),
    );

    await expectDataResponse(response, reviews);
    expect(listPerformanceReviews).toHaveBeenCalledWith(expect.anything(), "org-1", {
      employeeId: "123e4567-e89b-42d3-a456-426614174001",
      status: "Draft",
      templateId: "123e4567-e89b-42d3-a456-426614174002",
    });
  });
});
