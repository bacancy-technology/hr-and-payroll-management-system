import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

import {
  getOnboardingWorkflowReference,
  normalizeOnboardingTask,
  normalizeOnboardingWorkflow,
  ONBOARDING_TASK_SELECT,
  ONBOARDING_WORKFLOW_SELECT,
  type OnboardingWorkflowInput,
  type OnboardingTaskRow,
  type OnboardingWorkflowRow,
  validateOnboardingDateRange,
} from "@/lib/modules/onboarding/services/onboarding-shared";

export async function listOnboardingWorkflows(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("onboarding_workflows")
    .select(ONBOARDING_WORKFLOW_SELECT)
    .eq("organization_id", organizationId)
    .order("target_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load onboarding workflows.", error.message);
  }

  return ((data as OnboardingWorkflowRow[] | null) ?? []).map((row) => normalizeOnboardingWorkflow(row));
}

export async function getOnboardingWorkflowById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  workflowId: string,
) {
  const { data, error } = await supabase
    .from("onboarding_workflows")
    .select(ONBOARDING_WORKFLOW_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", workflowId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the onboarding workflow.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Onboarding workflow not found.");
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("onboarding_tasks")
    .select(ONBOARDING_TASK_SELECT)
    .eq("organization_id", organizationId)
    .eq("workflow_id", workflowId)
    .order("due_date", { ascending: true });

  if (tasksError) {
    throw new ApiError(500, "Failed to load onboarding tasks.", tasksError.message);
  }

  return {
    ...normalizeOnboardingWorkflow(data as OnboardingWorkflowRow),
    tasks: ((tasks as OnboardingTaskRow[] | null) ?? []).map((task) => normalizeOnboardingTask(task)),
  };
}

export async function createOnboardingWorkflow(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<OnboardingWorkflowInput, "employeeId" | "ownerName" | "startDate" | "targetDate">> &
    OnboardingWorkflowInput,
) {
  validateOnboardingDateRange(input.startDate, input.targetDate);

  const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId);

  const { data, error } = await supabase
    .from("onboarding_workflows")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      employee_name: employee.full_name,
      owner_name: input.ownerName,
      status: input.status ?? "Pending",
      start_date: input.startDate,
      target_date: input.targetDate,
      notes: input.notes ?? null,
    })
    .select(ONBOARDING_WORKFLOW_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the onboarding workflow.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Onboarding workflow creation did not return a record.");
  }

  return normalizeOnboardingWorkflow(data as OnboardingWorkflowRow);
}

export async function updateOnboardingWorkflow(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  workflowId: string,
  input: OnboardingWorkflowInput,
) {
  const current = await getOnboardingWorkflowReference(supabase, organizationId, workflowId);
  const nextStartDate = input.startDate ?? current.start_date;
  const nextTargetDate = input.targetDate ?? current.target_date;

  validateOnboardingDateRange(nextStartDate, nextTargetDate);

  let employeeId = input.employeeId ?? current.employee_id;
  let employeeName = current.employee_name;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
    employeeName = employee.full_name;
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: employeeId,
      employee_name: employeeName,
      owner_name: input.ownerName,
      status: input.status,
      start_date: input.startDate,
      target_date: input.targetDate,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one onboarding workflow field must be provided.");
  }

  const { data, error } = await supabase
    .from("onboarding_workflows")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", workflowId)
    .select(ONBOARDING_WORKFLOW_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the onboarding workflow.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Onboarding workflow not found.");
  }

  return normalizeOnboardingWorkflow(data as OnboardingWorkflowRow);
}

export async function deleteOnboardingWorkflow(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  workflowId: string,
) {
  const { error } = await supabase
    .from("onboarding_workflows")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", workflowId);

  if (error) {
    throw new ApiError(500, "Failed to delete the onboarding workflow.", error.message);
  }
}
