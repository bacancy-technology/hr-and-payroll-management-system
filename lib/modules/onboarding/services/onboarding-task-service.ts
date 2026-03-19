import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

import {
  getOnboardingWorkflowReference,
  normalizeOnboardingTask,
  ONBOARDING_TASK_SELECT,
  type OnboardingTaskInput,
  type OnboardingTaskRow,
  validateTaskDueDate,
} from "@/lib/modules/onboarding/services/onboarding-shared";

interface OnboardingTaskFilters {
  workflowId?: string;
  status?: string;
}

export async function listOnboardingTasks(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: OnboardingTaskFilters = {},
) {
  if (filters.workflowId) {
    await getOnboardingWorkflowReference(supabase, organizationId, filters.workflowId);
  }

  let query = supabase
    .from("onboarding_tasks")
    .select(ONBOARDING_TASK_SELECT)
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true });

  if (filters.workflowId) {
    query = query.eq("workflow_id", filters.workflowId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load onboarding tasks.", error.message);
  }

  return ((data as OnboardingTaskRow[] | null) ?? []).map((row) => normalizeOnboardingTask(row));
}

export async function getOnboardingTaskById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  taskId: string,
) {
  const { data, error } = await supabase
    .from("onboarding_tasks")
    .select(ONBOARDING_TASK_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the onboarding task.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Onboarding task not found.");
  }

  return normalizeOnboardingTask(data as OnboardingTaskRow);
}

export async function createOnboardingTask(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<OnboardingTaskInput, "workflowId" | "title" | "category" | "assignedToName" | "dueDate">> &
    OnboardingTaskInput,
) {
  const workflow = await getOnboardingWorkflowReference(supabase, organizationId, input.workflowId);

  validateTaskDueDate(workflow.start_date, input.dueDate);

  const status = input.status ?? "Pending";
  const completedAt = input.completedAt ?? (status === "Completed" ? new Date().toISOString() : null);

  const { data, error } = await supabase
    .from("onboarding_tasks")
    .insert({
      organization_id: organizationId,
      workflow_id: workflow.id,
      title: input.title,
      category: input.category,
      assigned_to_name: input.assignedToName,
      status,
      due_date: input.dueDate,
      completed_at: completedAt,
      notes: input.notes ?? null,
    })
    .select(ONBOARDING_TASK_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the onboarding task.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Onboarding task creation did not return a record.");
  }

  return normalizeOnboardingTask(data as OnboardingTaskRow);
}

export async function updateOnboardingTask(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  taskId: string,
  input: OnboardingTaskInput,
) {
  const current = await getOnboardingTaskById(supabase, organizationId, taskId);
  const nextWorkflowId = input.workflowId ?? current.workflowId;
  const workflow = await getOnboardingWorkflowReference(supabase, organizationId, nextWorkflowId);
  const nextDueDate = input.dueDate ?? current.dueDate;

  validateTaskDueDate(workflow.start_date, nextDueDate);

  const completedAt =
    input.completedAt === undefined
      ? input.status === "Completed" && current.completedAt === null
        ? new Date().toISOString()
        : undefined
      : input.completedAt;

  const payload = Object.fromEntries(
    Object.entries({
      workflow_id: input.workflowId,
      title: input.title,
      category: input.category,
      assigned_to_name: input.assignedToName,
      status: input.status,
      due_date: input.dueDate,
      completed_at: completedAt,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one onboarding task field must be provided.");
  }

  const { data, error } = await supabase
    .from("onboarding_tasks")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", taskId)
    .select(ONBOARDING_TASK_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the onboarding task.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Onboarding task not found.");
  }

  return normalizeOnboardingTask(data as OnboardingTaskRow);
}

export async function deleteOnboardingTask(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  taskId: string,
) {
  const { error } = await supabase
    .from("onboarding_tasks")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", taskId);

  if (error) {
    throw new ApiError(500, "Failed to delete the onboarding task.", error.message);
  }
}
