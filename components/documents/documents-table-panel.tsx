"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface DocumentRecord {
  id: string;
  fileName: string;
  category: string;
  entityType: string;
  status: string;
  visibility: string;
  createdAt: string;
}

export function DocumentsTablePanel() {
  return (
    <ApiTablePanel<DocumentRecord>
      title="Documents"
      subtitle="Employee and company documents with category and visibility tracking."
      endpoint="/api/documents"
      emptyMessage="No documents found."
      countLabel="documents"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Document",
          render: (item) => renderPrimary(item.fileName, item.category),
        },
        {
          label: "Entity",
          render: (item) => item.entityType,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Visibility",
          render: (item) => item.visibility,
        },
        {
          label: "Uploaded",
          render: (item) => renderDate(item.createdAt),
        },
      ]}
    />
  );
}
