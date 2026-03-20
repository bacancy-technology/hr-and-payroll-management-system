import { AccessRolesTablePanel } from "@/components/admin/access-roles-table-panel";
import { CompanyOverviewPanel } from "@/components/admin/company-overview-panel";
import { DepartmentsTablePanel } from "@/components/admin/departments-table-panel";
import { RoleAssignmentsTablePanel } from "@/components/admin/role-assignments-table-panel";
import { MultiCompanyOverviewPanel } from "@/components/multi-company-support/multi-company-overview-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";

const ADMIN_SECTIONS = [
  {
    id: "company-structure",
    title: "Company Structure",
    description: "Organization identity and multi-entity structure.",
  },
  {
    id: "department-ownership",
    title: "Department Ownership",
    description: "Department leads and operating structure.",
  },
  {
    id: "access-roles",
    title: "Access Roles",
    description: "Role definitions and platform permission design.",
  },
  {
    id: "role-assignments",
    title: "Role Assignments",
    description: "Who has which role and when assignments changed.",
  },
];

export default function AdminPage() {
  return (
    <>
      <WorkspacePageHeader
        eyebrow="Admin"
        title="Configure organization structure and platform access."
        description="Admin-facing frontend coverage includes company identity, department ownership, role design, role assignments, and multi-entity workspace structure."
      />

      <WorkspaceSectionMap items={ADMIN_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Set the primary organization profile and understand how multiple entities are arranged in the workspace."
          id="company-structure"
          title="Company Structure"
        >
          <CompanyOverviewPanel />
          <MultiCompanyOverviewPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use the department surface to validate ownership lines and head-of-function coverage."
          id="department-ownership"
          title="Department Ownership"
        >
          <DepartmentsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Review role definitions independently from assignments so access design changes are easier to reason about."
          id="access-roles"
          title="Access Roles"
        >
          <AccessRolesTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Track live role assignment coverage across the organization."
          id="role-assignments"
          title="Role Assignments"
        >
          <RoleAssignmentsTablePanel />
        </WorkspaceSection>
      </div>
    </>
  );
}
