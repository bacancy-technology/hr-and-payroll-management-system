"use client";

import { ApiTablePanel, renderDate, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface EmployeeRecord {
  id: string;
  fullName: string;
  role: string;
  department: { name: string } | null;
  status: string;
  location: string;
  nextReviewAt: string;
}

export function EmployeesTablePanel() {
  return (
    <ApiTablePanel<EmployeeRecord>
      title="Employees"
      subtitle="Roster, role, location, and upcoming review visibility."
      endpoint="/api/employees"
      emptyMessage="No employees found."
      countLabel="employees"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Employee",
          render: (item) => renderPrimary(item.fullName, item.role),
        },
        {
          label: "Department",
          render: (item) => item.department?.name ?? "Unassigned",
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
        {
          label: "Location",
          render: (item) => item.location,
        },
        {
          label: "Next review",
          render: (item) => renderDate(item.nextReviewAt),
        },
      ]}
    />
  );
}
