import { GET } from "@/app/api/wellness/dashboard/route";
import {
  buildEmployeeWellnessDashboard,
  getEmployeeWellnessDashboard,
} from "@/lib/modules/employee-wellness-dashboard/services/employee-wellness-dashboard-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/employee-wellness-dashboard/services/employee-wellness-dashboard-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/employee-wellness-dashboard/services/employee-wellness-dashboard-service")
  >("@/lib/modules/employee-wellness-dashboard/services/employee-wellness-dashboard-service");

  return {
    ...actual,
    getEmployeeWellnessDashboard: vi.fn(),
  };
});

describe("employee wellness dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds wellness metrics, resources, and signals", () => {
    const dashboard = buildEmployeeWellnessDashboard({
      generatedAt: "2026-03-20T00:00:00.000Z",
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
          payPeriod: null,
        },
      ],
      leaveRequests: [
        {
          id: "leave-1",
          employeeId: "emp-1",
          employeeName: "Jordan Blake",
          type: "Annual Leave",
          startDate: "2026-04-10",
          endDate: "2026-04-11",
          days: 2,
          status: "Approved",
          approverName: "Mina Carter",
          notes: null,
          createdAt: "2026-03-20T00:00:00.000Z",
          employee: null,
        },
      ],
      benefitsEnrollments: [
        {
          id: "enrollment-1",
          employeeId: "emp-1",
          employeeName: "Jordan Blake",
          planId: "plan-1",
          status: "Active",
          effectiveDate: "2026-01-01",
          endDate: null,
          payrollDeduction: 240,
          notes: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          plan: {
            id: "plan-1",
            name: "Health Plus PPO",
            provider_name: "NovaCare",
            category: "Health Insurance",
            coverage_level: "Employee + Family",
            employee_cost: 240,
            employer_cost: 610,
            status: "Active",
          },
          employee: null,
        },
      ],
    });

    expect(dashboard.summary.participatingEmployees).toBe(1);
    expect(dashboard.metrics).toHaveLength(4);
    expect(dashboard.resources.length).toBeGreaterThan(0);
    expect(dashboard.signals.length).toBeGreaterThan(0);
  });

  it("loads wellness dashboard data from the route", async () => {
    const dashboard = { summary: { participatingEmployees: 5 } };
    vi.mocked(getEmployeeWellnessDashboard).mockResolvedValue(dashboard as never);

    const response = await GET();

    await expectDataResponse(response, dashboard);
    expect(getEmployeeWellnessDashboard).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
