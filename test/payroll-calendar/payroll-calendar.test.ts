import { GET } from "@/app/api/payroll/calendar/route";
import { getPayrollCalendar } from "@/lib/modules/payroll/services/payroll-calendar-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/payroll/services/payroll-calendar-service", () => ({
  getPayrollCalendar: vi.fn(),
}));

describe("payroll calendar", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads calendar entries for the selected date range", async () => {
    const calendar = { periods: [{ id: "period-1" }] };
    vi.mocked(getPayrollCalendar).mockResolvedValue(calendar as never);

    const response = await GET(
      new Request(
        "http://localhost/api/payroll/calendar?startDate=2026-03-01&endDate=2026-03-31",
      ),
    );

    await expectDataResponse(response, calendar);
    expect(getPayrollCalendar).toHaveBeenCalledWith(expect.anything(), "org-1", {
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    });
  });
});
