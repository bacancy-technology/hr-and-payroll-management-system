import { GET } from "@/app/api/payroll/anomalies/route";
import {
  detectPayrollAnomalies,
  listPayrollAnomalies,
} from "@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service")
  >("@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service");

  return {
    ...actual,
    listPayrollAnomalies: vi.fn(),
  };
});

describe("payroll anomaly detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("flags unusual payroll run and employee payment patterns", () => {
    const anomalies = detectPayrollAnomalies({
      payrollRuns: [
        {
          id: "run-current",
          periodLabel: "March 2026",
          payDate: "2026-03-29",
          status: "Processing",
          employeeCount: 44,
          totalAmount: 322000,
        },
        {
          id: "run-prev-1",
          periodLabel: "February 2026",
          payDate: "2026-02-27",
          status: "Paid",
          employeeCount: 40,
          totalAmount: 248000,
        },
        {
          id: "run-prev-2",
          periodLabel: "January 2026",
          payDate: "2026-01-31",
          status: "Paid",
          employeeCount: 39,
          totalAmount: 241000,
        },
      ],
      payrollItems: [
        {
          id: "item-1",
          payrollRunId: "run-current",
          employeeId: "emp-1",
          employeeName: "Jordan Blake",
          annualSalary: 132000,
          grossPay: 5500,
          taxAmount: 825,
          deductionsAmount: 260,
          netPay: 4415,
          status: "Calculated",
        },
        {
          id: "item-2",
          payrollRunId: "run-current",
          employeeId: "emp-2",
          employeeName: "Priya Nair",
          annualSalary: 96000,
          grossPay: 12000,
          taxAmount: 4200,
          deductionsAmount: 450,
          netPay: 7350,
          status: "Calculated",
        },
      ],
    });

    expect(anomalies.length).toBeGreaterThanOrEqual(3);
    expect(anomalies.some((anomaly) => anomaly.category === "Run variance")).toBe(true);
    expect(
      anomalies.some(
        (anomaly) => anomaly.category === "Tax withholding drift" && anomaly.subject === "Priya Nair",
      ),
    ).toBe(true);
    expect(
      anomalies.some((anomaly) => anomaly.category === "Net pay deviation" && anomaly.subject === "Priya Nair"),
    ).toBe(true);
    expect(anomalies.every((anomaly) => anomaly.confidenceScore >= 0.7)).toBe(true);
  });

  it("loads anomalies from the payroll anomaly route", async () => {
    const anomalies = [{ id: "anomaly-1", severity: "High" }];
    vi.mocked(listPayrollAnomalies).mockResolvedValue(anomalies as never);

    const response = await GET();

    await expectDataResponse(response, anomalies);
    expect(listPayrollAnomalies).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
