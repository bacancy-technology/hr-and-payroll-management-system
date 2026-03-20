"use client";

import { ApiTablePanel, renderCurrency, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface BenefitsEnrollmentRecord {
  id: string;
  employeeName: string;
  status: string;
  effectiveDate: string;
  payrollDeduction: number;
  plan: { name: string } | null;
}

export function BenefitsEnrollmentsTablePanel() {
  return (
    <ApiTablePanel<BenefitsEnrollmentRecord>
      title="Benefits Enrollments"
      subtitle="Current enrollments, effective dates, and payroll deductions."
      endpoint="/api/benefits/enrollments"
      emptyMessage="No benefits enrollments found."
      countLabel="enrollments"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Enrollment",
          render: (item) => renderPrimary(item.employeeName, item.plan?.name ?? "Plan unavailable"),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Effective",
          render: (item) => renderDate(item.effectiveDate),
        },
        {
          label: "Deduction",
          render: (item) => renderCurrency(item.payrollDeduction),
        },
      ]}
    />
  );
}
