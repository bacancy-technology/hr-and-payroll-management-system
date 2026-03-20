import type {
  IntelligentDocumentProcessing,
  IntelligentDocumentRecord,
  ProcessedDocumentField,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listDocuments } from "@/lib/modules/documents/services/document-service";

function buildExtractedFields(document: Awaited<ReturnType<typeof listDocuments>>[number]) {
  const normalizedName = document.fileName.toLowerCase();
  const fields: ProcessedDocumentField[] = [
    {
      label: "Document type",
      value: document.category,
      confidenceScore: 0.94,
    },
    {
      label: "File format",
      value: document.mimeType,
      confidenceScore: 0.98,
    },
  ];

  if (normalizedName.includes("offer")) {
    fields.push(
      {
        label: "Template",
        value: "Offer Letter",
        confidenceScore: 0.91,
      },
      {
        label: "Review focus",
        value: "Compensation and start date terms",
        confidenceScore: 0.84,
      },
    );
  } else if (normalizedName.includes("tax")) {
    fields.push(
      {
        label: "Template",
        value: "Tax Form",
        confidenceScore: 0.93,
      },
      {
        label: "Review focus",
        value: "TIN and withholding completeness",
        confidenceScore: 0.82,
      },
    );
  } else if (normalizedName.includes("policy")) {
    fields.push(
      {
        label: "Template",
        value: "Policy Document",
        confidenceScore: 0.9,
      },
      {
        label: "Review focus",
        value: "Acknowledgement and version tracking",
        confidenceScore: 0.79,
      },
    );
  } else {
    fields.push({
      label: "Review focus",
      value: "General OCR extraction and metadata validation",
      confidenceScore: 0.74,
    });
  }

  return fields;
}

function buildProcessingStatus(document: Awaited<ReturnType<typeof listDocuments>>[number]) {
  if (document.mimeType.includes("pdf")) {
    return "Processed";
  }

  if (document.mimeType.startsWith("image/")) {
    return "Needs Review";
  }

  return "Queued";
}

export function buildIntelligentDocumentProcessing(input: {
  documents: Awaited<ReturnType<typeof listDocuments>>;
  generatedAt?: string;
}) {
  const processedDocuments = input.documents.slice(0, 5).map((document) => {
    const extractedFields = buildExtractedFields(document);
    const processingStatus = buildProcessingStatus(document);

    return {
      id: `processed-${document.id}`,
      documentId: document.id,
      fileName: document.fileName,
      category: document.category,
      processingStatus,
      extractedSummary: `${document.fileName} classified for ${document.category} extraction and validation.`,
      extractedFields,
    } satisfies IntelligentDocumentRecord;
  });

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      processedDocuments: processedDocuments.length,
      fieldsExtracted: processedDocuments.reduce((sum, document) => sum + document.extractedFields.length, 0),
      reviewQueue: processedDocuments.filter((document) => document.processingStatus === "Needs Review").length,
      ocrReadyFormats: processedDocuments.filter(
        (document) =>
          document.processingStatus === "Processed" || document.processingStatus === "Needs Review",
      ).length,
    },
    documents: processedDocuments,
  } satisfies IntelligentDocumentProcessing;
}

export async function getIntelligentDocumentProcessing(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const documents = await listDocuments(supabase, organizationId);

  return buildIntelligentDocumentProcessing({
    documents,
  });
}
