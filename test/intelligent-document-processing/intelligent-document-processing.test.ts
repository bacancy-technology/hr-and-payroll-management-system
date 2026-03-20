import { GET } from "@/app/api/documents/intelligent-processing/route";
import {
  buildIntelligentDocumentProcessing,
  getIntelligentDocumentProcessing,
} from "@/lib/modules/intelligent-document-processing/services/intelligent-document-processing-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/intelligent-document-processing/services/intelligent-document-processing-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/intelligent-document-processing/services/intelligent-document-processing-service")
  >("@/lib/modules/intelligent-document-processing/services/intelligent-document-processing-service");

  return {
    ...actual,
    getIntelligentDocumentProcessing: vi.fn(),
  };
});

describe("intelligent document processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("builds extracted fields and review statuses", () => {
    const processing = buildIntelligentDocumentProcessing({
      generatedAt: "2026-03-20T00:00:00.000Z",
      documents: [
        {
          id: "doc-1",
          entityType: "employee",
          entityId: "emp-1",
          category: "Offer Letter",
          fileName: "offer-letter.pdf",
          storagePath: "documents/offer-letter.pdf",
          mimeType: "application/pdf",
          sizeBytes: 12000,
          status: "Active",
          visibility: "Private",
          uploadedByName: "Maya Chen",
          createdAt: "2026-03-20T00:00:00.000Z",
        },
      ],
    });

    expect(processing.summary.processedDocuments).toBe(1);
    expect(processing.documents[0]?.processingStatus).toBe("Processed");
    expect(processing.documents[0]?.extractedFields.length).toBeGreaterThan(2);
  });

  it("loads intelligent document processing from the route", async () => {
    const processing = { summary: { processedDocuments: 4 } };
    vi.mocked(getIntelligentDocumentProcessing).mockResolvedValue(processing as never);

    const response = await GET();

    await expectDataResponse(response, processing);
    expect(getIntelligentDocumentProcessing).toHaveBeenCalledWith(expect.anything(), "org-1");
  });
});
