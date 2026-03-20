import { GET } from "@/app/api/payroll/cost-tracking/route";
import {
  buildRealTimePayrollCostTracking,
  getRealTimePayrollCostTracking,
} from "@/lib/modules/real-time-payroll-cost-tracking/services/real-time-payroll-cost-tracking-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/real-time-payroll-cost-tracking/services/real-time-payroll-cost-tracking-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/real-time-payroll-cost-tracking/services/real-time-payroll-cost-tracking-service")
  >("@/lib/modules/real-time-payroll-cost-tracking/services/real-time-payroll-cost-tracking-service");

  return {
    ...actual,
    getRealTimePayrollCostTracking: vi.fn(),
  };
});

describe("real-time payroll cost tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds accrued and projected payroll costs", () => {
    const tracking = buildRealTimePayrollCostTracking({
      generatedAt: "2026-03-20T00:00:00.000Z",
      payPeriods: [
        {
          id: "period-1",
          label: "March 2026",
          start_date: "2026-03-01",
          end_date: "2026-03-31",
          pay_date: "2026-04-04",
          status: "Open",
        },
      ],
      payrollRuns: [
        {
          id: "run-1",
          pay_period_id: "period-1",
          period_label: "February 2026",
          pay_date: "2026-02-27",
          status: "Paid",
          employee_count: 2,
          total_amount: 100000,
        },
      ],
      employees: [
        {
          id: "emp-1",
          fullName: "Jordan Blake",
          email: "jordan@pulsehr.app",
          role: "Engineer",
          status: "Active",
          location: "Remote",
          salary: 132000,
          startDate: "2023-01-16",
          managerName: "Mina Carter",
          nextReviewAt: "2026-04-03",
          department: { id: "dept-1", name: "Engineering", code: "ENG" },
        },
      ],
      timeEntries: [
        {
          id: "entry-1",
          workDate: "2026-03-19",
          clockInAt: "2026-03-19T08:00:00.000Z",
          clockOutAt: "2026-03-19T18:00:00.000Z",
          breakMinutes: 30,
          hoursWorked: 9.5,
          overtimeHours: 1.5,
          status: "Approved",
          notes: null,
          employee: { id: "emp-1", full_name: "Jordan Blake", email: "jordan@pulsehr.app" },
          payPeriod: {
            id: "period-1",
            label: "March 2026",
            start_date: "2026-03-01",
            end_date: "2026-03-31",
            pay_date: "2026-04-04",
          },
        },
      ],
    });

    expect(tracking.summary.currentAccruedCost).toBeGreaterThan(0);
    expect(tracking.summary.projectedCloseCost).toBeGreaterThan(tracking.summary.currentAccruedCost);
    expect(tracking.breakdown[0]?.department).toBe("Engineering");
  });

  it("loads payroll cost tracking from the route", async () => {
    const tracking = { summary: { currentAccruedCost: 1000 } };
    vi.mocked(getRealTimePayrollCostTracking).mockResolvedValue(tracking as never);

    const response = await GET();

    await expectDataResponse(response, tracking);
    expect(getRealTimePayrollCostTracking).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
