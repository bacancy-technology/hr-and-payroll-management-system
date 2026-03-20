import { GET } from "@/app/api/backup-recovery/route";
import { getBackupRecoveryOverview } from "@/lib/modules/backup-recovery/services/backup-recovery-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/backup-recovery/services/backup-recovery-service", () => ({
  getBackupRecoveryOverview: vi.fn(),
}));

describe("backup and recovery", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the backup and recovery overview", async () => {
    const overview = { summary: { backupJobs: 5, recoveryEvents: 1 } };
    vi.mocked(getBackupRecoveryOverview).mockResolvedValue(overview as never);

    const response = await GET();

    await expectDataResponse(response, overview);
    expect(getBackupRecoveryOverview).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
