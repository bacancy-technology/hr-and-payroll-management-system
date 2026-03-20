import { IntelligentDocumentProcessingPanel } from "@/components/intelligent-document-processing/intelligent-document-processing-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("intelligent document processing frontend", () => {
  it("renders processed documents and extracted fields", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <IntelligentDocumentProcessingPanel processing={data.intelligentDocumentProcessing} />,
    );

    expect(markup).toContain("Intelligent document processing");
    expect(markup).toContain(data.intelligentDocumentProcessing.documents[0].fileName);
    expect(markup).toContain(
      data.intelligentDocumentProcessing.documents[0].extractedFields[0].label,
    );
  });
});
