import type { AutomatedJobPostingIntegration, JobBoardConnection, JobPosting } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listDepartments } from "@/lib/modules/admin/services/department-service";
import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listIntegrations } from "@/lib/modules/integrations/services/integration-service";
import { listIntegrationSyncRuns } from "@/lib/modules/integrations/services/integration-sync-service";

interface RecruitingDepartment {
  id: string;
  name: string;
  lead_name: string | null;
}

const DEFAULT_JOB_BOARDS = [
  { provider: "linkedin-jobs", displayName: "LinkedIn Jobs" },
  { provider: "indeed", displayName: "Indeed" },
  { provider: "wellfound", displayName: "Wellfound" },
] as const;

function normalizeProviderLabel(provider: string) {
  return provider
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildBoardConnections(input: {
  integrations: Awaited<ReturnType<typeof listIntegrations>>;
  syncRuns: Awaited<ReturnType<typeof listIntegrationSyncRuns>>;
}) {
  const recruitingIntegrations = input.integrations.filter(
    (integration) =>
      integration.category.toLowerCase() === "recruiting" ||
      ["linkedin-jobs", "indeed", "wellfound", "greenhouse", "lever"].includes(integration.provider),
  );

  const mappedBoards = recruitingIntegrations.map((integration) => {
    const boardSyncRuns = input.syncRuns.filter((run) => run.integrationId === integration.id);

    return {
      id: integration.id,
      provider: integration.provider,
      displayName: integration.displayName,
      status: integration.status,
      lastSyncedAt: integration.lastSyncedAt,
      postedJobs: boardSyncRuns.length,
      applicationsTracked: boardSyncRuns.reduce((sum, run) => sum + run.recordsProcessed, 0),
    } satisfies JobBoardConnection;
  });

  if (mappedBoards.length > 0) {
    return mappedBoards;
  }

  return DEFAULT_JOB_BOARDS.map((board, index) => ({
    id: `job-board-${index + 1}`,
    provider: board.provider,
    displayName: board.displayName,
    status: "Disconnected",
    lastSyncedAt: null,
    postedJobs: 0,
    applicationsTracked: 0,
  })) satisfies JobBoardConnection[];
}

function getSuggestedRoleTitle(department: string) {
  const normalized = department.toLowerCase();

  if (normalized.includes("engineering")) {
    return "Senior Backend Engineer";
  }

  if (normalized.includes("finance")) {
    return "Payroll Operations Analyst";
  }

  if (normalized.includes("people")) {
    return "Talent Acquisition Partner";
  }

  if (normalized.includes("design")) {
    return "Product Designer";
  }

  return `${department} Specialist`;
}

function buildJobPostings(input: {
  departments: RecruitingDepartment[];
  employees: Awaited<ReturnType<typeof listEmployees>>;
  boards: JobBoardConnection[];
}) {
  const employeeCounts = input.employees.reduce<Record<string, number>>((counts, employee) => {
    const departmentName = employee.department?.name ?? "Unassigned";
    counts[departmentName] = (counts[departmentName] ?? 0) + 1;
    return counts;
  }, {});

  const trackedApplications = input.boards.reduce((sum, board) => sum + board.applicationsTracked, 0);
  const connectedBoardNames = input.boards.filter((board) => board.status === "Connected").map((board) => board.displayName);
  const targetBoards = connectedBoardNames.length > 0 ? connectedBoardNames : input.boards.map((board) => board.displayName).slice(0, 2);

  return input.departments
    .map((department, index) => {
      const departmentName = department.name;
      const headcount = employeeCounts[departmentName] ?? 0;
      const applications = Math.max(3, Math.round(trackedApplications / Math.max(input.departments.length, 1)) + index * 2);
      const status: JobPosting["status"] =
        connectedBoardNames.length === 0 ? "Draft" : headcount <= 2 ? "Posted" : "Syncing";

      return {
        id: `job-posting-${department.id}`,
        title: getSuggestedRoleTitle(departmentName),
        department: departmentName,
        employmentType: "Full-time",
        status,
        targetBoards,
        applications,
        source: department.lead_name ? `${department.lead_name} hiring plan` : "Workforce planning",
      } satisfies JobPosting;
    })
    .sort((left, right) => left.department.localeCompare(right.department))
    .slice(0, 4);
}

export function buildAutomatedJobPostingIntegration(input: {
  integrations: Awaited<ReturnType<typeof listIntegrations>>;
  syncRuns: Awaited<ReturnType<typeof listIntegrationSyncRuns>>;
  departments: RecruitingDepartment[];
  employees: Awaited<ReturnType<typeof listEmployees>>;
  generatedAt?: string;
}) {
  const boards = buildBoardConnections({
    integrations: input.integrations,
    syncRuns: input.syncRuns,
  });
  const postings = buildJobPostings({
    departments: input.departments,
    employees: input.employees,
    boards,
  });

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      connectedBoards: boards.filter((board) => board.status === "Connected").length,
      activePostings: postings.filter((posting) => posting.status !== "Draft").length,
      trackedApplications: postings.reduce((sum, posting) => sum + posting.applications, 0),
      syncedBoards: boards.filter((board) => Boolean(board.lastSyncedAt)).length,
    },
    boards,
    postings,
  } satisfies AutomatedJobPostingIntegration;
}

export async function getAutomatedJobPostingIntegration(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [integrations, syncRuns, departments, employees] = await Promise.all([
    listIntegrations(supabase, organizationId),
    listIntegrationSyncRuns(supabase, organizationId),
    listDepartments(supabase, organizationId),
    listEmployees(supabase, organizationId),
  ]);

  return buildAutomatedJobPostingIntegration({
    integrations,
    syncRuns,
    departments,
    employees,
  });
}
