import { GET } from "@/app/api/expenses/route";
import { listExpenses } from "@/lib/modules/expenses/services/expense-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/expenses/services/expense-service", () => ({
  createExpense: vi.fn(),
  listExpenses: vi.fn(),
}));

describe("expense management", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists expenses with filters", async () => {
    const expenses = [{ id: "expense-1", status: "Submitted" }];
    vi.mocked(listExpenses).mockResolvedValue(expenses as never);

    const response = await GET(
      new Request(
        "http://localhost/api/expenses?employeeId=123e4567-e89b-42d3-a456-426614174003&status=Submitted&category=Travel",
      ),
    );

    await expectDataResponse(response, expenses);
    expect(listExpenses).toHaveBeenCalledWith(expect.anything(), "org-1", {
      employeeId: "123e4567-e89b-42d3-a456-426614174003",
      status: "Submitted",
      category: "Travel",
    });
  });
});
