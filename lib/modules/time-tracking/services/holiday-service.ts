import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface HolidayInput {
  name?: string;
  holidayDate?: string;
  type?: string;
  appliesTo?: string;
  status?: string;
}

interface HolidayRow {
  id: string;
  name: string;
  holiday_date: string;
  type: string;
  applies_to: string;
  status: string;
  created_at: string;
}

const HOLIDAY_SELECT = `
  id,
  name,
  holiday_date,
  type,
  applies_to,
  status,
  created_at
`;

function normalizeHoliday(row: HolidayRow) {
  return {
    id: row.id,
    name: row.name,
    holidayDate: row.holiday_date,
    type: row.type,
    appliesTo: row.applies_to,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listHolidays(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("holidays")
    .select(HOLIDAY_SELECT)
    .eq("organization_id", organizationId)
    .order("holiday_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load holidays.", error.message);
  }

  return ((data as HolidayRow[] | null) ?? []).map((row) => normalizeHoliday(row));
}

export async function getHolidayById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  holidayId: string,
) {
  const { data, error } = await supabase
    .from("holidays")
    .select(HOLIDAY_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", holidayId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the holiday.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Holiday not found.");
  }

  return normalizeHoliday(data as HolidayRow);
}

export async function createHoliday(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<HolidayInput, "name" | "holidayDate" | "type" | "appliesTo">> & HolidayInput,
) {
  const { data, error } = await supabase
    .from("holidays")
    .insert({
      organization_id: organizationId,
      name: input.name,
      holiday_date: input.holidayDate,
      type: input.type,
      applies_to: input.appliesTo,
      status: input.status ?? "Scheduled",
    })
    .select(HOLIDAY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the holiday.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Holiday creation did not return a record.");
  }

  return normalizeHoliday(data as HolidayRow);
}

export async function updateHoliday(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  holidayId: string,
  input: HolidayInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      name: input.name,
      holiday_date: input.holidayDate,
      type: input.type,
      applies_to: input.appliesTo,
      status: input.status,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one holiday field must be provided.");
  }

  const { data, error } = await supabase
    .from("holidays")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", holidayId)
    .select(HOLIDAY_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the holiday.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Holiday not found.");
  }

  return normalizeHoliday(data as HolidayRow);
}

export async function deleteHoliday(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  holidayId: string,
) {
  const { error } = await supabase
    .from("holidays")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", holidayId);

  if (error) {
    throw new ApiError(500, "Failed to delete the holiday.", error.message);
  }
}
