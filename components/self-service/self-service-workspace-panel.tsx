"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface SelfServiceWorkspacePayload {
  profile: {
    fullName: string;
    email: string;
    role: string;
  };
  summary: {
    paystubCount: number;
    pendingPtoRequests: number;
    upcomingApprovedPtoDays: number;
    directDepositStatus: string;
  };
  paystubs: Array<{
    id: string;
    netPay: number;
    payrollRun: { periodLabel: string; payDate: string } | null;
  }>;
  employee: {
    location: string;
  };
  bankAccounts: Array<unknown>;
}

export function SelfServiceWorkspacePanel() {
  return (
    <ApiOverviewPanel
      title="Self-Service Workspace"
      subtitle="Employee-facing profile, paystub, and PTO overview from the self-service API."
      endpoint="/api/self-service"
      selectMetrics={(payload) => {
        const data = payload as SelfServiceWorkspacePayload;

        return [
          {
            label: "Bank accounts",
            value: String(data.bankAccounts.length),
            detail: "Disbursement accounts linked for self-service users.",
          },
          {
            label: "Paystubs",
            value: String(data.summary.paystubCount),
            detail: "Recent paystubs available to the employee.",
          },
          {
            label: "Approved PTO",
            value: String(data.summary.upcomingApprovedPtoDays),
            detail: `${data.summary.pendingPtoRequests} more requests still pending review.`,
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as SelfServiceWorkspacePayload;

        return (
          <div className="workspace-card-grid">
            <div className="workspace-inline-card">
              <span className="small-label">Profile</span>
              <strong>{data.profile.fullName}</strong>
              <p>
                {data.profile.role} · {data.employee.location}
              </p>
            </div>
            {data.paystubs.slice(0, 2).map((paystub) => (
              <div className="workspace-inline-card" key={paystub.id}>
                <span className="small-label">Paystub</span>
                <strong>{paystub.payrollRun?.periodLabel ?? "Payroll run"}</strong>
                <p>{paystub.netPay}</p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
