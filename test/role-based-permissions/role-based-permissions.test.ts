import { GET } from "@/app/api/admin/roles/route";
import { listAccessRoles } from "@/lib/modules/admin/services/access-role-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/admin/services/access-role-service", () => ({
  createAccessRole: vi.fn(),
  listAccessRoles: vi.fn(),
}));

describe("role-based permissions", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists access roles", async () => {
    const roles = [{ id: "role-1", name: "HR Admin" }];
    vi.mocked(listAccessRoles).mockResolvedValue(roles as never);

    const response = await GET();

    await expectDataResponse(response, roles);
    expect(listAccessRoles).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
