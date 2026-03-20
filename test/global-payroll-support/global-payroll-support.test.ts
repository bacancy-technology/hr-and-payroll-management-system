import { GET } from "@/app/api/payroll/global-support/route";
import {
  buildGlobalPayrollSupport,
  getGlobalPayrollSupport,
} from "@/lib/modules/global-payroll-support/services/global-payroll-support-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/global-payroll-support/services/global-payroll-support-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/global-payroll-support/services/global-payroll-support-service")
  >("@/lib/modules/global-payroll-support/services/global-payroll-support-service");

  return {
    ...actual,
    getGlobalPayrollSupport: vi.fn(),
  };
});

describe("global payroll support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds country and currency coverage", () => {
    const support = buildGlobalPayrollSupport({
      generatedAt: "2026-03-20T00:00:00.000Z",
      entities: [
        {
          id: "entity-1",
          name: "Northstar India",
          legalName: "Northstar People Ops India Pvt Ltd",
          entityType: "Private Limited",
          taxId: "GSTIN",
          registrationState: "Karnataka",
          headquarters: "Bengaluru",
          payrollFrequency: "Monthly",
          employeeCount: 38,
          status: "Active",
          primaryContactName: "Anika Raman",
          primaryContactEmail: "anika@pulsehr.app",
          createdAt: "2026-03-20T00:00:00.000Z",
        },
        {
          id: "entity-2",
          name: "Northstar US",
          legalName: "Northstar People Ops LLC",
          entityType: "LLC",
          taxId: "EIN",
          registrationState: "California",
          headquarters: "San Francisco",
          payrollFrequency: "Biweekly",
          employeeCount: 24,
          status: "Active",
          primaryContactName: "Priya Nair",
          primaryContactEmail: "priya@pulsehr.app",
          createdAt: "2026-03-20T00:00:00.000Z",
        },
      ],
      complianceRules: [
        {
          id: "rule-1",
          name: "Federal Form 941 Q1 Filing",
          jurisdiction: "United States - Federal",
          category: "Payroll Tax",
          deadlineDate: "2026-04-30",
          status: "Open",
          notes: null,
          createdAt: "2026-03-20T00:00:00.000Z",
        },
      ],
    });

    expect(support.summary.countries).toBe(2);
    expect(support.summary.currencies).toBe(2);
    expect(support.regions[0]?.currency).toBeDefined();
  });

  it("loads global payroll support from the route", async () => {
    const support = { summary: { countries: 2 } };
    vi.mocked(getGlobalPayrollSupport).mockResolvedValue(support as never);

    const response = await GET();

    await expectDataResponse(response, support);
    expect(getGlobalPayrollSupport).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
