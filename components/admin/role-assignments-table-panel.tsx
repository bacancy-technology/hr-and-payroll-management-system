"use client";

import { ApiTablePanel, renderDate, renderPrimary } from "@/components/workspace-data/api-table-panel";

interface RoleAssignmentRecord {
  id: string;
  assignedByName: string;
  createdAt: string;
  role: { name: string } | null;
  profile: { full_name: string; email: string } | null;
}

export function RoleAssignmentsTablePanel() {
  return (
    <ApiTablePanel<RoleAssignmentRecord>
      title="Role Assignments"
      subtitle="Current user-role mapping across the workspace."
      endpoint="/api/admin/role-assignments"
      emptyMessage="No role assignments found."
      countLabel="assignments"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Assignment",
          render: (item) => renderPrimary(item.profile?.full_name ?? "Unknown profile", item.role?.name ?? "Unknown role"),
        },
        {
          label: "Assigned by",
          render: (item) => item.assignedByName,
        },
        {
          label: "Created",
          render: (item) => renderDate(item.createdAt),
        },
      ]}
    />
  );
}
