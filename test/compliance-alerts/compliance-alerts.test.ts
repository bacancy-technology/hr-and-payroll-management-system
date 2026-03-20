import { GET } from "@/app/api/compliance/alerts/route";
import { listComplianceAlerts } from "@/lib/modules/compliance/services/compliance-alert-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/compliance/services/compliance-alert-service", () => ({
  createComplianceAlert: vi.fn(),
  listComplianceAlerts: vi.fn(),
}));

describe("compliance alerts", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists compliance alerts with filters", async () => {
    const alerts = [{ id: "alert-1", severity: "High" }];
    vi.mocked(listComplianceAlerts).mockResolvedValue(alerts as never);

    const response = await GET(
      new Request(
        "http://localhost/api/compliance/alerts?status=Open&severity=High&ruleId=123e4567-e89b-42d3-a456-426614174004",
      ),
    );

    await expectDataResponse(response, alerts);
    expect(listComplianceAlerts).toHaveBeenCalledWith(expect.anything(), "org-1", {
      status: "Open",
      severity: "High",
      ruleId: "123e4567-e89b-42d3-a456-426614174004",
    });
  });
});
