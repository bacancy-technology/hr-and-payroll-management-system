import type { IntelligentDocumentProcessing } from "@/lib/types";

interface IntelligentDocumentProcessingPanelProps {
  processing: IntelligentDocumentProcessing;
}

export function IntelligentDocumentProcessingPanel({
  processing,
}: IntelligentDocumentProcessingPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Intelligent document processing</h3>
          <p className="panel-subtitle">OCR-style extraction, document classification, and review queue management for HR records.</p>
        </div>
        <span className="pill">{processing.summary.processedDocuments} documents analyzed</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Fields</span>
          <strong>{processing.summary.fieldsExtracted}</strong>
          <p>Structured fields extracted from analyzed documents.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Review queue</span>
          <strong>{processing.summary.reviewQueue}</strong>
          <p>Documents needing manual verification after extraction.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">OCR-ready</span>
          <strong>{processing.summary.ocrReadyFormats}</strong>
          <p>Files currently compatible with automated extraction.</p>
        </div>
      </div>

      <div className="stack">
        {processing.documents.map((document) => (
          <div className="document-processing-card" key={document.id}>
            <div className="split">
              <div>
                <span className="small-label">{document.category}</span>
                <strong>{document.fileName}</strong>
              </div>
              <span className="small-label">{document.processingStatus}</span>
            </div>
            <p>{document.extractedSummary}</p>
            <div className="document-field-grid">
              {document.extractedFields.map((field) => (
                <div className="document-field-card" key={`${document.id}-${field.label}`}>
                  <span className="small-label">{field.label}</span>
                  <strong>{field.value}</strong>
                  <p className="muted">Confidence {Math.round(field.confidenceScore * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
