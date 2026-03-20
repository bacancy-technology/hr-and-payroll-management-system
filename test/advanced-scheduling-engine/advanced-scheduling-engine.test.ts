import { GET } from "@/app/api/time-tracking/advanced-scheduling/route";
import {
  buildAdvancedSchedulingEngine,
  getAdvancedSchedulingEngine,
} from "@/lib/modules/advanced-scheduling-engine/services/advanced-scheduling-engine-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/advanced-scheduling-engine/services/advanced-scheduling-engine-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/advanced-scheduling-engine/services/advanced-scheduling-engine-service")
  >("@/lib/modules/advanced-scheduling-engine/services/advanced-scheduling-engine-service");

  return {
    ...actual,
    getAdvancedSchedulingEngine: vi.fn(),
  };
});

describe("advanced scheduling engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds optimized shifts from staffing and guardrail signals", () => {
    const engine = buildAdvancedSchedulingEngine({
      generatedAt: "2026-03-20T08:00:00.000Z",
      employees: [
        {
          id: "emp-1",
          fullName: "Jordan Blake",
          email: "jordan@pulsehr.app",
          role: "Senior Backend Engineer",
          status: "Active",
          location: "Remote",
          salary: 132000,
          startDate: "2023-01-16",
          managerName: "Mina Carter",
          nextReviewAt: "2026-05-03",
          department: { id: "dept-eng", name: "Engineering", code: "ENG" },
        },
        {
          id: "emp-2",
          fullName: "Elena Torres",
          email: "elena@pulsehr.app",
          role: "Talent Partner",
          status: "Active",
          location: "Barcelona",
          salary: 92000,
          startDate: "2023-08-14",
          managerName: "Anika Raman",
          nextReviewAt: "2026-04-19",
          department: { id: "dept-people", name: "People", code: "PEOPLE" },
        },
        {
          id: "emp-3",
          fullName: "Marcus Lee",
          email: "marcus@pulsehr.app",
          role: "Product Designer",
          status: "On Leave",
          location: "Singapore",
          salary: 104000,
          startDate: "2024-02-05",
          managerName: "Daniel Moss",
          nextReviewAt: "2026-06-14",
          department: { id: "dept-design", name: "Design", code: "DES" },
        },
      ],
      ptoRequests: [
        {
          id: "pto-1",
          employeeId: "emp-2",
          employeeName: "Elena Torres",
          type: "Work From Anywhere",
          startDate: "2026-03-25",
          endDate: "2026-03-26",
          days: 2,
          status: "Pending",
          approverName: "Anika Raman",
          notes: null,
          createdAt: "2026-03-20T00:00:00.000Z",
          employee: { id: "emp-2", full_name: "Elena Torres", email: "elena@pulsehr.app" },
        },
      ],
      holidays: [
        {
          id: "holiday-1",
          name: "Company Offsite Recovery Day",
          holidayDate: "2026-03-30",
          type: "Company Holiday",
          appliesTo: "Global",
          status: "Scheduled",
          createdAt: "2026-03-20T00:00:00.000Z",
        },
      ],
      payPeriods: [
        {
          id: "period-1",
          label: "Late March 2026",
          startDate: "2026-03-16",
          endDate: "2026-03-31",
          payDate: "2026-04-04",
          status: "Scheduled",
          createdAt: "2026-03-01T00:00:00.000Z",
        },
      ],
      timeEntries: [
        {
          id: "time-1",
          workDate: "2026-03-18",
          clockInAt: "2026-03-18T08:31:00Z",
          clockOutAt: "2026-03-18T18:12:00Z",
          breakMinutes: 50,
          hoursWorked: 8.85,
          overtimeHours: 0.85,
          status: "Approved",
          notes: null,
          employee: { id: "emp-1", full_name: "Jordan Blake", email: "jordan@pulsehr.app" },
          payPeriod: {
            id: "period-1",
            label: "Late March 2026",
            start_date: "2026-03-16",
            end_date: "2026-03-31",
            pay_date: "2026-04-04",
          },
        },
        {
          id: "time-2",
          workDate: "2026-03-18",
          clockInAt: "2026-03-18T09:45:00Z",
          clockOutAt: "2026-03-18T17:40:00Z",
          breakMinutes: 35,
          hoursWorked: 7.33,
          overtimeHours: 0,
          status: "Approved",
          notes: null,
          employee: { id: "emp-2", full_name: "Elena Torres", email: "elena@pulsehr.app" },
          payPeriod: {
            id: "period-1",
            label: "Late March 2026",
            start_date: "2026-03-16",
            end_date: "2026-03-31",
            pay_date: "2026-04-04",
          },
        },
      ],
    });

    expect(engine.summary.scheduledShifts).toBe(2);
    expect(engine.summary.complianceAlerts).toBeGreaterThan(0);
    expect(engine.shifts[0]?.skills.length).toBeGreaterThan(0);
    expect(engine.alerts.some((alert) => alert.title.includes("Jordan Blake"))).toBe(true);
  });

  it("loads the scheduling engine from the route", async () => {
    const engine = { summary: { scheduledShifts: 2 } };
    vi.mocked(getAdvancedSchedulingEngine).mockResolvedValue(engine as never);

    const response = await GET();

    await expectDataResponse(response, engine);
    expect(getAdvancedSchedulingEngine).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
