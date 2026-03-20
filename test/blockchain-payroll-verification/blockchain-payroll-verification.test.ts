import { GET } from "@/app/api/payroll/blockchain-verification/route";
import {
  buildBlockchainPayrollVerification,
  getBlockchainPayrollVerification,
} from "@/lib/modules/blockchain-payroll-verification/services/blockchain-payroll-verification-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/blockchain-payroll-verification/services/blockchain-payroll-verification-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/blockchain-payroll-verification/services/blockchain-payroll-verification-service")
  >("@/lib/modules/blockchain-payroll-verification/services/blockchain-payroll-verification-service");

  return {
    ...actual,
    getBlockchainPayrollVerification: vi.fn(),
  };
});

describe("blockchain payroll verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds a deterministic payroll verification chain", () => {
    const verification = buildBlockchainPayrollVerification({
      generatedAt: "2026-03-20T00:00:00.000Z",
      payrollRuns: [
        {
          id: "run-1",
          periodLabel: "January 2026",
          payDate: "2026-01-30",
          status: "Paid",
          employeeCount: 2,
          totalAmount: 10000,
          varianceNote: "Stable",
          calculatedAt: "2026-01-28T00:00:00.000Z",
          finalizedAt: "2026-01-30T00:00:00.000Z",
          createdAt: "2026-01-20T00:00:00.000Z",
        },
        {
          id: "run-2",
          periodLabel: "February 2026",
          payDate: "2026-02-27",
          status: "Processing",
          employeeCount: 2,
          totalAmount: 10500,
          varianceNote: "+5%",
          calculatedAt: "2026-02-25T00:00:00.000Z",
          finalizedAt: null,
          createdAt: "2026-02-20T00:00:00.000Z",
        },
      ],
      payrollItems: [
        {
          id: "item-1",
          payrollRunId: "run-1",
          grossPay: 6000,
          taxAmount: 1200,
          deductionsAmount: 300,
          netPay: 4500,
          status: "Paid",
        },
        {
          id: "item-2",
          payrollRunId: "run-2",
          grossPay: 6300,
          taxAmount: 1260,
          deductionsAmount: 315,
          netPay: 4725,
          status: "Calculated",
        },
      ],
    });

    expect(verification.summary.chainLength).toBe(2);
    expect(verification.summary.anchoredRuns).toBe(1);
    expect(verification.blocks[0]?.verificationStatus).toBe("Verified");
    expect(verification.blocks[0]?.previousHash).toBe(verification.blocks[1]?.blockHash);
    expect(verification.blocks[1]?.previousHash).toBe("GENESIS");
  });

  it("loads blockchain verification from the route", async () => {
    const verification = { summary: { chainLength: 3 } };
    vi.mocked(getBlockchainPayrollVerification).mockResolvedValue(verification as never);

    const response = await GET();

    await expectDataResponse(response, verification);
    expect(getBlockchainPayrollVerification).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
