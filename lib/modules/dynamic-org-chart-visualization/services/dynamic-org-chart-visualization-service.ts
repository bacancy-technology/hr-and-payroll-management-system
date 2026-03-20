import type { DynamicOrgChartVisualization, OrgChartLink, OrgChartNode } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listDirectoryEmployees } from "@/lib/modules/directory/services/directory-service";

interface DirectoryEmployee {
  id: string;
  fullName: string;
  role: string;
  managerName: string;
  department?: {
    name: string;
  } | null;
}

function getEmployeeLevel(
  employee: DirectoryEmployee,
  employeesByName: Map<string, DirectoryEmployee>,
  levelCache: Map<string, number>,
): number {
  const cachedLevel = levelCache.get(employee.id);

  if (cachedLevel !== undefined) {
    return cachedLevel;
  }

  if (!employee.managerName || employee.managerName === "Executive Team") {
    levelCache.set(employee.id, 0);
    return 0;
  }

  const manager = employeesByName.get(employee.managerName);

  if (!manager) {
    levelCache.set(employee.id, 0);
    return 0;
  }

  const level: number = getEmployeeLevel(manager, employeesByName, levelCache) + 1;
  levelCache.set(employee.id, level);
  return level;
}

export function buildDynamicOrgChartVisualization(input: { employees: DirectoryEmployee[]; generatedAt?: string }) {
  const employeesByName = new Map(input.employees.map((employee) => [employee.fullName, employee]));
  const directReportsByName = input.employees.reduce<Record<string, number>>((counts, employee) => {
    if (employee.managerName && employeesByName.has(employee.managerName)) {
      counts[employee.managerName] = (counts[employee.managerName] ?? 0) + 1;
    }

    return counts;
  }, {});
  const levelCache = new Map<string, number>();

  const nodes = input.employees
    .map((employee) => {
      return {
        id: employee.id,
        fullName: employee.fullName,
        role: employee.role,
        departmentName: employee.department?.name ?? "Unassigned",
        managerName: employee.managerName,
        level: getEmployeeLevel(employee, employeesByName, levelCache),
        directReportCount: directReportsByName[employee.fullName] ?? 0,
      } satisfies OrgChartNode;
    })
    .sort((left, right) => left.level - right.level || left.fullName.localeCompare(right.fullName));

  const links = input.employees.reduce<OrgChartLink[]>((relationships, employee) => {
    const manager = employeesByName.get(employee.managerName);

    if (manager) {
      relationships.push({
        sourceEmployeeId: manager.id,
        targetEmployeeId: employee.id,
      });
    }

    return relationships;
  }, []);

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      people: nodes.length,
      rootLeaders: nodes.filter((node) => node.level === 0).length,
      reportingLinks: links.length,
      departments: new Set(nodes.map((node) => node.departmentName)).size,
    },
    nodes,
    links,
  } satisfies DynamicOrgChartVisualization;
}

export async function getDynamicOrgChartVisualization(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const employees = await listDirectoryEmployees(supabase, organizationId);

  return buildDynamicOrgChartVisualization({
    employees,
  });
}
