import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

export interface OnboardingWorkflowInput {
  employeeId?: string;
  ownerName?: string;
  status?: string;
  startDate?: string;
  targetDate?: string;
  notes?: string | null;
}

export interface OnboardingTaskInput {
  workflowId?: string;
  title?: string;
  category?: string;
  assignedToName?: string;
  status?: string;
  dueDate?: string;
  completedAt?: string | null;
  notes?: string | null;
}

export interface OnboardingWorkflowRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  owner_name: string;
  status: string;
  start_date: string;
  target_date: string;
  notes: string | null;
  created_at: string;
  employees:
    | {
        id: string;
        full_name: string;
        email: string;
      }
    | {
        id: string;
        full_name: string;
        email: string;
      }[]
    | null;
}

export interface OnboardingTaskRow {
  id: string;
  workflow_id: string;
  title: string;
  category: string;
  assigned_to_name: string;
  status: string;
  due_date: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  onboarding_workflows:
    | {
        id: string;
        employee_id: string | null;
        employee_name: string;
        owner_name: string;
        status: string;
        start_date: string;
        target_date: string;
      }
    | {
        id: string;
        employee_id: string | null;
        employee_name: string;
        owner_name: string;
        status: string;
        start_date: string;
        target_date: string;
      }[]
    | null;
}

export const ONBOARDING_WORKFLOW_SELECT = `
  id,
  employee_id,
  employee_name,
  owner_name,
  status,
  start_date,
  target_date,
  notes,
  created_at,
  employees (
    id,
    full_name,
    email
  )
`;

export const ONBOARDING_TASK_SELECT = `
  id,
  workflow_id,
  title,
  category,
  assigned_to_name,
  status,
  due_date,
  completed_at,
  notes,
  created_at,
  onboarding_workflows (
    id,
    employee_id,
    employee_name,
    owner_name,
    status,
    start_date,
    target_date
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function normalizeOnboardingWorkflow(row: OnboardingWorkflowRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    ownerName: row.owner_name,
    status: row.status,
    startDate: row.start_date,
    targetDate: row.target_date,
    notes: row.notes,
    createdAt: row.created_at,
    employee: normalizeRelation(row.employees),
  };
}

export function normalizeOnboardingTask(row: OnboardingTaskRow) {
  return {
    id: row.id,
    workflowId: row.workflow_id,
    title: row.title,
    category: row.category,
    assignedToName: row.assigned_to_name,
    status: row.status,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    notes: row.notes,
    createdAt: row.created_at,
    workflow: normalizeRelation(row.onboarding_workflows),
  };
}

export function validateOnboardingDateRange(startDate: string, targetDate: string) {
  if (new Date(targetDate).getTime() < new Date(startDate).getTime()) {
    throw new ApiError(400, "Onboarding targetDate must be on or after startDate.");
  }
}

export function validateTaskDueDate(workflowStartDate: string, dueDate: string) {
  if (new Date(dueDate).getTime() < new Date(workflowStartDate).getTime()) {
    throw new ApiError(400, "Onboarding task dueDate must be on or after the workflow startDate.");
  }
}

interface OnboardingWorkflowReference {
  id: string;
  employee_id: string | null;
  employee_name: string;
  owner_name: string;
  status: string;
  start_date: string;
  target_date: string;
  notes: string | null;
}

export async function getOnboardingWorkflowReference(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  workflowId: string,
) {
  const { data, error } = await supabase
    .from("onboarding_workflows")
    .select("id, employee_id, employee_name, owner_name, status, start_date, target_date, notes")
    .eq("organization_id", organizationId)
    .eq("id", workflowId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the onboarding workflow reference.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Onboarding workflow not found.");
  }

  return data as OnboardingWorkflowReference;
}
