import { requireApiContext } from "@/lib/modules/shared/api/context";
import { calculatePayrollRun } from "@/lib/modules/payroll/services/payroll-service";
import { POST } from "@/app/api/payroll/runs/[runId]/calculate/route";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/payroll/services/payroll-service", () => ({
  calculatePayrollRun: vi.fn(),
}));

describe("automated payroll processing", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("calculates a payroll run", async () => {
    const run = { id: "run-1", status: "Calculated" };
    vi.mocked(calculatePayrollRun).mockResolvedValue(run as never);

    const response = await POST(new Request("http://localhost/api/payroll/runs/run-1/calculate"), {
      params: Promise.resolve({ runId: "run-1" }),
    });

    await expectDataResponse(response, run);
    expect(calculatePayrollRun).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "org-1" }), "run-1");
  });
});
