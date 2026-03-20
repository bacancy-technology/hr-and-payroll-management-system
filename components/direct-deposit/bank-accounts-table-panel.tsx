"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface BankAccountRecord {
  id: string;
  bankName: string;
  accountType: string;
  accountLast4: string;
  status: string;
  verifiedAt: string | null;
  employee: { full_name: string } | null;
}

export function BankAccountsTablePanel() {
  return (
    <ApiTablePanel<BankAccountRecord>
      title="Bank Accounts"
      subtitle="Payroll disbursement setup and verification status."
      endpoint="/api/bank-accounts"
      emptyMessage="No bank accounts found."
      countLabel="accounts"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Account",
          render: (item) => renderPrimary(item.employee?.full_name ?? "Unknown employee", `${item.bankName} ••••${item.accountLast4}`),
        },
        {
          label: "Type",
          render: (item) => item.accountType,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Verified",
          render: (item) => renderDate(item.verifiedAt),
        },
      ]}
    />
  );
}
