"use client";

import { ApiTablePanel, renderPrimary, renderStatus } from "@/components/workspace-data/api-table-panel";

interface AccessRoleRecord {
  id: string;
  name: string;
  description: string;
  status: string;
  permissions: string[];
}

export function AccessRolesTablePanel() {
  return (
    <ApiTablePanel<AccessRoleRecord>
      title="Access Roles"
      subtitle="Role definitions and permission bundle visibility."
      endpoint="/api/admin/roles"
      emptyMessage="No access roles found."
      countLabel="roles"
      getKey={(item) => item.id}
      columns={[
        {
          label: "Role",
          render: (item) => renderPrimary(item.name, item.description),
        },
        {
          label: "Permissions",
          render: (item) => item.permissions.length,
        },
        {
          label: "Status",
          render: (item) => renderStatus(item.status),
        },
      ]}
    />
  );
}
