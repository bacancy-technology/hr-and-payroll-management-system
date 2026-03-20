"use client";

import { ApiTablePanel, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  lead_name: string | null;
}

export function DepartmentsTablePanel() {
  return (
    <ApiTablePanel<DepartmentRecord>
      title="Departments"
      subtitle="Department ownership and org-structure metadata."
      endpoint="/api/admin/departments"
      emptyMessage="No departments found."
      countLabel="departments"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Department",
          render: (item) => renderPrimary(item.name, item.code),
        },
        {
          label: "Lead",
          render: (item) => item.lead_name ?? "Not assigned",
        },
      ]}
    />
  );
}
