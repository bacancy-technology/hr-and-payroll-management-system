import { AccessRolesTablePanel } from "@/components/admin/access-roles-table-panel";
import { CompanyOverviewPanel } from "@/components/admin/company-overview-panel";
import { DepartmentsTablePanel } from "@/components/admin/departments-table-panel";
import { RoleAssignmentsTablePanel } from "@/components/admin/role-assignments-table-panel";
import { MultiCompanyOverviewPanel } from "@/components/multi-company-support/multi-company-overview-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";

export default function AdminPage() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Admin"
        title="Configure organization structure and platform access."
        description="Admin-facing frontend coverage includes company identity, department ownership, role design, role assignments, and multi-entity workspace structure."
      />

      <section className="workspace-section-grid">
        <CompanyOverviewPanel />
        <DepartmentsTablePanel />
        <AccessRolesTablePanel />
        <RoleAssignmentsTablePanel />
        <MultiCompanyOverviewPanel />
      </section>
    </>
  );
}
