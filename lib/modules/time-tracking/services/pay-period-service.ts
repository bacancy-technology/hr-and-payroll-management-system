import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface PayPeriodInput {
  label?: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  status?: string;
}

function ensureDateRange(startDate: string, endDate: string) {
  if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new ApiError(400, "Pay period endDate must be on or after startDate.");
  }
}

export async function listPayPeriods(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("pay_periods")
    .select("id, label, start_date, end_date, pay_date, status, created_at")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load pay periods.", error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    startDate: row.start_date,
    endDate: row.end_date,
    payDate: row.pay_date,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function getPayPeriodById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  payPeriodId: string,
) {
  const { data, error } = await supabase
    .from("pay_periods")
    .select("id, label, start_date, end_date, pay_date, status, created_at")
    .eq("organization_id", organizationId)
    .eq("id", payPeriodId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the pay period.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Pay period not found.");
  }

  return {
    id: data.id,
    label: data.label,
    startDate: data.start_date,
    endDate: data.end_date,
    payDate: data.pay_date,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function createPayPeriod(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<PayPeriodInput, "label" | "startDate" | "endDate" | "payDate" | "status">>,
) {
  ensureDateRange(input.startDate, input.endDate);

  const { data, error } = await supabase
    .from("pay_periods")
    .insert({
      organization_id: organizationId,
      label: input.label,
      start_date: input.startDate,
      end_date: input.endDate,
      pay_date: input.payDate,
      status: input.status,
    })
    .select("id, label, start_date, end_date, pay_date, status, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the pay period.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Pay period creation did not return a record.");
  }

  return {
    id: data.id,
    label: data.label,
    startDate: data.start_date,
    endDate: data.end_date,
    payDate: data.pay_date,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function updatePayPeriod(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  payPeriodId: string,
  input: PayPeriodInput,
) {
  const current = await getPayPeriodById(supabase, organizationId, payPeriodId);
  const nextStartDate = input.startDate ?? current.startDate;
  const nextEndDate = input.endDate ?? current.endDate;

  ensureDateRange(nextStartDate, nextEndDate);

  const payload = Object.fromEntries(
    Object.entries({
      label: input.label,
      start_date: input.startDate,
      end_date: input.endDate,
      pay_date: input.payDate,
      status: input.status,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one pay period field must be provided.");
  }

  const { data, error } = await supabase
    .from("pay_periods")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", payPeriodId)
    .select("id, label, start_date, end_date, pay_date, status, created_at")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the pay period.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Pay period not found.");
  }

  return {
    id: data.id,
    label: data.label,
    startDate: data.start_date,
    endDate: data.end_date,
    payDate: data.pay_date,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function deletePayPeriod(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  payPeriodId: string,
) {
  const { error } = await supabase
    .from("pay_periods")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", payPeriodId);

  if (error) {
    throw new ApiError(500, "Failed to delete the pay period.", error.message);
  }
}
