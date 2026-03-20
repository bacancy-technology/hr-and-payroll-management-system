"use client";

import { ApiOverviewPanel } from "@/components/workspace-data/api-overview-panel";

interface DirectoryOverviewPayload {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    managers: number;
  };
  employees: Array<{
    id: string;
    fullName: string;
    role: string;
    department: { name: string } | null;
  }>;
}

export function DirectoryOverviewPanel() {
  return (
    <ApiOverviewPanel
      title="Employee Directory"
      subtitle="Searchable directory summary with org and manager coverage."
      endpoint="/api/directory"
      selectMetrics={(payload) => {
        const data = payload as DirectoryOverviewPayload;

        return [
          {
            label: "Employees",
            value: String(data.summary.totalEmployees),
            detail: `${data.summary.activeEmployees} active employees in the directory.`,
          },
          {
            label: "Departments",
            value: String(data.summary.departments),
            detail: "Distinct departments represented in the directory.",
          },
          {
            label: "Managers",
            value: String(data.summary.managers),
            detail: "Managers currently represented in the reporting tree.",
          },
        ];
      }}
      renderBody={(payload) => {
        const data = payload as DirectoryOverviewPayload;

        return (
          <div className="workspace-card-grid">
            {data.employees.slice(0, 4).map((employee) => (
              <div className="workspace-inline-card" key={employee.id}>
                <span className="small-label">{employee.department?.name ?? "Unassigned"}</span>
                <strong>{employee.fullName}</strong>
                <p>{employee.role}</p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
