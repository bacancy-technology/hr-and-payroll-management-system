"use client";

import { ApiTablePanel, renderCurrency, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface ExpenseRecord {
  id: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  incurredOn: string;
  status: string;
}

export function ExpensesTablePanel() {
  return (
    <ApiTablePanel<ExpenseRecord>
      title="Expenses"
      subtitle="Expense reimbursement queue with employee and status visibility."
      endpoint="/api/expenses"
      emptyMessage="No expenses found."
      countLabel="expenses"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Expense",
          render: (item) => renderPrimary(item.employeeName, item.description),
        },
        {
          label: "Category",
          render: (item) => item.category,
        },
        {
          label: "Amount",
          render: (item) => renderCurrency(item.amount),
        },
        {
          label: "Incurred",
          render: (item) => renderDate(item.incurredOn),
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
