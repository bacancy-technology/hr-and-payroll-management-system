import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface TaxFilingInput {
  filingName?: string;
  jurisdiction?: string;
  periodLabel?: string;
  dueDate?: string;
  filedAt?: string | null;
  status?: string;
  amount?: number;
  notes?: string | null;
}

interface TaxFilingRow {
  id: string;
  filing_name: string;
  jurisdiction: string;
  period_label: string;
  due_date: string;
  filed_at: string | null;
  status: string;
  amount: number;
  notes: string | null;
  created_at: string;
}

const TAX_FILING_SELECT = `
  id,
  filing_name,
  jurisdiction,
  period_label,
  due_date,
  filed_at,
  status,
  amount,
  notes,
  created_at
`;

function normalizeTaxFiling(row: TaxFilingRow) {
  return {
    id: row.id,
    filingName: row.filing_name,
    jurisdiction: row.jurisdiction,
    periodLabel: row.period_label,
    dueDate: row.due_date,
    filedAt: row.filed_at,
    status: row.status,
    amount: row.amount,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listTaxFilings(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("tax_filings")
    .select(TAX_FILING_SELECT)
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true });

  if (error) {
    throw new ApiError(500, "Failed to load tax filings.", error.message);
  }

  return ((data as TaxFilingRow[] | null) ?? []).map((row) => normalizeTaxFiling(row));
}

export async function getTaxFilingById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filingId: string,
) {
  const { data, error } = await supabase
    .from("tax_filings")
    .select(TAX_FILING_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", filingId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the tax filing.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Tax filing not found.");
  }

  return normalizeTaxFiling(data as TaxFilingRow);
}

export async function createTaxFiling(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<Pick<TaxFilingInput, "filingName" | "jurisdiction" | "periodLabel" | "dueDate" | "amount">> &
    TaxFilingInput,
) {
  const { data, error } = await supabase
    .from("tax_filings")
    .insert({
      organization_id: organizationId,
      filing_name: input.filingName,
      jurisdiction: input.jurisdiction,
      period_label: input.periodLabel,
      due_date: input.dueDate,
      filed_at: input.filedAt ?? null,
      status: input.status ?? "Prepared",
      amount: input.amount,
      notes: input.notes ?? null,
    })
    .select(TAX_FILING_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the tax filing.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Tax filing creation did not return a record.");
  }

  return normalizeTaxFiling(data as TaxFilingRow);
}

export async function updateTaxFiling(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filingId: string,
  input: TaxFilingInput,
) {
  const payload = Object.fromEntries(
    Object.entries({
      filing_name: input.filingName,
      jurisdiction: input.jurisdiction,
      period_label: input.periodLabel,
      due_date: input.dueDate,
      filed_at: input.filedAt,
      status: input.status,
      amount: input.amount,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one tax filing field must be provided.");
  }

  const { data, error } = await supabase
    .from("tax_filings")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", filingId)
    .select(TAX_FILING_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the tax filing.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Tax filing not found.");
  }

  return normalizeTaxFiling(data as TaxFilingRow);
}

export async function deleteTaxFiling(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filingId: string,
) {
  const { error } = await supabase
    .from("tax_filings")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", filingId);

  if (error) {
    throw new ApiError(500, "Failed to delete the tax filing.", error.message);
  }
}
