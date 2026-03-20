"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface PerformanceReviewRecord {
  id: string;
  employeeName: string;
  reviewerName: string;
  status: string;
  dueDate: string;
  summary: string | null;
}

export function PerformanceReviewsTablePanel() {
  return (
    <ApiTablePanel<PerformanceReviewRecord>
      title="Performance Reviews"
      subtitle="Review status, reviewer ownership, and due-date visibility."
      endpoint="/api/performance/reviews"
      emptyMessage="No performance reviews found."
      countLabel="reviews"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Review",
          render: (item) => renderPrimary(item.employeeName, item.summary),
        },
        {
          label: "Reviewer",
          render: (item) => item.reviewerName,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Due",
          render: (item) => renderDate(item.dueDate),
        },
      ]}
    />
  );
}
