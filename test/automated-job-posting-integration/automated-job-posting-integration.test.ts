import { GET } from "@/app/api/integrations/job-postings/route";
import {
  buildAutomatedJobPostingIntegration,
  getAutomatedJobPostingIntegration,
} from "@/lib/modules/automated-job-posting-integration/services/automated-job-posting-integration-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/automated-job-posting-integration/services/automated-job-posting-integration-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/automated-job-posting-integration/services/automated-job-posting-integration-service")
  >("@/lib/modules/automated-job-posting-integration/services/automated-job-posting-integration-service");

  return {
    ...actual,
    getAutomatedJobPostingIntegration: vi.fn(),
  };
});

describe("automated job posting integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds board connections and active postings", () => {
    const integration = buildAutomatedJobPostingIntegration({
      generatedAt: "2026-03-20T00:00:00.000Z",
      integrations: [
        {
          id: "int-1",
          provider: "linkedin-jobs",
          displayName: "LinkedIn Jobs",
          category: "Recruiting",
          status: "Connected",
          connectionMode: "OAuth",
          scopes: [],
          config: {},
          externalAccountId: null,
          webhookSecretHint: null,
          lastSyncedAt: "2026-03-20T05:30:00Z",
          createdAt: "2026-03-20T05:00:00Z",
        },
      ],
      syncRuns: [
        {
          id: "sync-1",
          integrationId: "int-1",
          triggerSource: "scheduled",
          status: "Completed",
          startedAt: "2026-03-20T05:25:00Z",
          completedAt: "2026-03-20T05:30:00Z",
          recordsProcessed: 12,
          summary: "Synced applications.",
          createdAt: "2026-03-20T05:25:00Z",
          integration: null,
        },
      ],
      departments: [
        { id: "dept-1", name: "People", lead_name: "Anika Raman" },
        { id: "dept-2", name: "Finance", lead_name: "Priya Nair" },
      ],
      employees: [
        {
          id: "emp-1",
          fullName: "Anika Raman",
          email: "anika@pulsehr.app",
          role: "VP, People Operations",
          status: "Active",
          location: "Bengaluru",
          salary: 148000,
          startDate: "2022-05-09",
          managerName: "Executive Team",
          nextReviewAt: "2026-04-12",
          department: { id: "dept-1", name: "People", code: "PEOPLE" },
        },
      ],
    });

    expect(integration.summary.connectedBoards).toBe(1);
    expect(integration.boards[0]?.applicationsTracked).toBe(12);
    expect(integration.postings.length).toBeGreaterThan(0);
    expect(integration.postings[0]?.targetBoards).toContain("LinkedIn Jobs");
  });

  it("loads job posting integration data from the route", async () => {
    const integration = { summary: { connectedBoards: 2 } };
    vi.mocked(getAutomatedJobPostingIntegration).mockResolvedValue(integration as never);

    const response = await GET();

    await expectDataResponse(response, integration);
    expect(getAutomatedJobPostingIntegration).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
