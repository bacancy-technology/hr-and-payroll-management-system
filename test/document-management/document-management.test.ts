import { GET } from "@/app/api/documents/route";
import { listDocuments } from "@/lib/modules/documents/services/document-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/documents/services/document-service", () => ({
  createDocument: vi.fn(),
  listDocuments: vi.fn(),
}));

describe("document management", () => {
  beforeEach(() => {
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("lists documents with entity filters", async () => {
    const documents = [{ id: "doc-1", fileName: "offer-letter.pdf" }];
    vi.mocked(listDocuments).mockResolvedValue(documents as never);

    const response = await GET(
      new Request(
        "http://localhost/api/documents?entityType=employee&entityId=emp-1&category=contract&visibility=private",
      ),
    );

    await expectDataResponse(response, documents);
    expect(listDocuments).toHaveBeenCalledWith(expect.anything(), "org-1", {
      entityType: "employee",
      entityId: "emp-1",
      category: "contract",
      visibility: "private",
    });
  });
});
