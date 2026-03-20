import { GET } from "@/app/api/multi-company-support/route";
import {
  getMultiCompanySupportOverview,
  listCompanyEntities,
} from "@/lib/modules/multi-company-support/services/company-entity-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/multi-company-support/services/company-entity-service", () => ({
  createCompanyEntity: vi.fn(),
  getMultiCompanySupportOverview: vi.fn(),
  listCompanyEntities: vi.fn(),
}));

describe("multi-company support", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the multi-company overview when no filters are provided", async () => {
    const overview = { summary: { entityCount: 3 } };
    vi.mocked(getMultiCompanySupportOverview).mockResolvedValue(overview as never);

    const response = await GET(new Request("http://localhost/api/multi-company-support"));

    await expectDataResponse(response, overview);
    expect(getMultiCompanySupportOverview).toHaveBeenCalledWith(expect.anything(), "org-1");
  });

  it("lists company entities when filters are provided", async () => {
    const entities = [{ id: "entity-1", status: "Active" }];
    vi.mocked(listCompanyEntities).mockResolvedValue(entities as never);

    const response = await GET(
      new Request(
        "http://localhost/api/multi-company-support?status=Active&registrationState=CA&entityType=LLC",
      ),
    );

    await expectDataResponse(response, entities);
    expect(listCompanyEntities).toHaveBeenCalledWith(expect.anything(), "org-1", {
      status: "Active",
      registrationState: "CA",
      entityType: "LLC",
    });
  });
});
