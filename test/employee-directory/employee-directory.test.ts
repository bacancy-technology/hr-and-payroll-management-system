import { GET } from "@/app/api/directory/route";
import {
  getDirectoryOverview,
  listDirectoryEmployees,
} from "@/lib/modules/directory/services/directory-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/directory/services/directory-service", () => ({
  getDirectoryOverview: vi.fn(),
  listDirectoryEmployees: vi.fn(),
}));

describe("employee directory", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("loads the directory overview when no filters are provided", async () => {
    const overview = { summary: { employeeCount: 42 } };
    vi.mocked(getDirectoryOverview).mockResolvedValue(overview as never);

    const response = await GET(new Request("http://localhost/api/directory"));

    await expectDataResponse(response, overview);
    expect(getDirectoryOverview).toHaveBeenCalledWith(expect.anything(), "org-1");
  });

  it("lists directory employees when filters are provided", async () => {
    const employees = [{ id: "emp-1", fullName: "Maya Chen" }];
    vi.mocked(listDirectoryEmployees).mockResolvedValue(employees as never);

    const response = await GET(
      new Request(
        "http://localhost/api/directory?search=maya&departmentId=123e4567-e89b-42d3-a456-426614174005&status=Active&location=Remote",
      ),
    );

    await expectDataResponse(response, employees);
    expect(listDirectoryEmployees).toHaveBeenCalledWith(expect.anything(), "org-1", {
      search: "maya",
      departmentId: "123e4567-e89b-42d3-a456-426614174005",
      status: "Active",
      location: "Remote",
    });
  });
});
