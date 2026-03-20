"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface AnalyticsPayload {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    payrollInFlightAmount: number;
    openLeaveRequests: number;
    reviewsDueSoon: number;
    onboardingInProgress: number;
  };
}

export function AnalyticsOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Reporting Overview"
      subtitle="Workspace-level KPIs from the analytics dashboard."
      endpoint="/api/analytics/dashboard"
      selectMetrics={(payload) => {
        const data = payload as AnalyticsPayload;

        return [
          {
            label: "Employees",
            value: String(data.summary.totalEmployees),
            detail: `${data.summary.activeEmployees} active in the current workspace.`,
          },
          {
            label: "Leave requests",
            value: String(data.summary.openLeaveRequests),
            detail: "Open leave approvals awaiting resolution.",
          },
          {
            label: "Reviews due",
            value: String(data.summary.reviewsDueSoon),
            detail: "Reviews due in the next 30 days.",
          },
        ];
      }}
    />
  );
}
