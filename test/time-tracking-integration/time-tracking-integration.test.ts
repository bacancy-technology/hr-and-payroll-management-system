import { POST } from "@/app/api/time-tracking/clock-in/route";
import { clockInEmployee } from "@/lib/modules/time-tracking/services/time-entry-service";
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

vi.mock("@/lib/modules/time-tracking/services/time-entry-service", () => ({
  clockInEmployee: vi.fn(),
}));

describe("time tracking integration", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("creates a clock-in entry", async () => {
    const entry = { id: "entry-1", status: "Draft" };
    vi.mocked(clockInEmployee).mockResolvedValue(entry as never);

    const response = await POST(
      createJsonRequest("http://localhost/api/time-tracking/clock-in", "POST", {
        employeeId: "emp-1",
        workDate: "2026-03-20",
      }),
    );

    await expectDataResponse(response, entry, 201);
    expect(clockInEmployee).toHaveBeenCalledWith(expect.anything(), "org-1", expect.objectContaining({
      employeeId: "emp-1",
      workDate: "2026-03-20",
    }));
  });
});
