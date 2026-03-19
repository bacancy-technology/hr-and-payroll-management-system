import { randomUUID } from "node:crypto";

import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { getEmployeeSummaryInOrganization } from "@/lib/modules/shared/services/org-reference-service";

interface BankAccountFilters {
  employeeId?: string;
  status?: string;
}

interface BankAccountInput {
  employeeId?: string;
  accountHolderName?: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  routingNumber?: string;
  status?: string;
  isPrimary?: boolean;
  notes?: string | null;
}

interface BankAccountUpdateInput {
  employeeId?: string;
  accountHolderName?: string;
  bankName?: string;
  accountType?: string;
  status?: string;
  isPrimary?: boolean;
  notes?: string | null;
}

interface BankAccountRow {
  id: string;
  employee_id: string;
  account_holder_name: string;
  bank_name: string;
  account_type: string;
  account_last4: string;
  routing_last4: string;
  status: string;
  is_primary: boolean;
  provider_reference: string;
  verified_at: string | null;
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

const BANK_ACCOUNT_SELECT = `
  id,
  employee_id,
  account_holder_name,
  bank_name,
  account_type,
  account_last4,
  routing_last4,
  status,
  is_primary,
  provider_reference,
  verified_at,
  notes,
  created_at,
  employees (
    id,
    full_name,
    email
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeBankAccount(row: BankAccountRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    accountHolderName: row.account_holder_name,
    bankName: row.bank_name,
    accountType: row.account_type,
    accountLast4: row.account_last4,
    routingLast4: row.routing_last4,
    status: row.status,
    isPrimary: row.is_primary,
    providerReference: row.provider_reference,
    verifiedAt: row.verified_at,
    notes: row.notes,
    createdAt: row.created_at,
    employee: normalizeRelation(row.employees),
  };
}

function readLast4(value: string, label: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    throw new ApiError(400, `${label} must contain at least 4 digits.`);
  }

  return digits.slice(-4);
}

function validateRoutingNumber(routingNumber: string) {
  const digits = routingNumber.replace(/\D/g, "");

  if (digits.length !== 9) {
    throw new ApiError(400, "Routing number must contain exactly 9 digits.");
  }

  return digits;
}

async function setPrimaryAccount(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
  excludeBankAccountId?: string,
) {
  let query = supabase
    .from("bank_accounts")
    .update({ is_primary: false })
    .eq("organization_id", organizationId)
    .eq("employee_id", employeeId)
    .eq("is_primary", true);

  if (excludeBankAccountId) {
    query = query.neq("id", excludeBankAccountId);
  }

  const { error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to update the employee's primary bank account.", error.message);
  }
}

export async function listBankAccounts(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: BankAccountFilters = {},
) {
  if (filters.employeeId) {
    await getEmployeeSummaryInOrganization(supabase, organizationId, filters.employeeId);
  }

  let query = supabase
    .from("bank_accounts")
    .select(BANK_ACCOUNT_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load bank accounts.", error.message);
  }

  return ((data as BankAccountRow[] | null) ?? []).map((row) => normalizeBankAccount(row));
}

export async function getBankAccountById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  bankAccountId: string,
) {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(BANK_ACCOUNT_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", bankAccountId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the bank account.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Bank account not found.");
  }

  return normalizeBankAccount(data as BankAccountRow);
}

export async function createBankAccount(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  input: Required<
    Pick<
      BankAccountInput,
      "employeeId" | "accountHolderName" | "bankName" | "accountType" | "accountNumber" | "routingNumber"
    >
  > &
    BankAccountInput,
) {
  const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, input.employeeId);
  const accountLast4 = readLast4(input.accountNumber, "Account number");
  const routingLast4 = readLast4(validateRoutingNumber(input.routingNumber), "Routing number");
  const isPrimary = input.isPrimary ?? true;

  if (isPrimary) {
    await setPrimaryAccount(supabase, organizationId, employee.id);
  }

  const status = input.status ?? "Pending Verification";
  const verifiedAt = status === "Verified" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({
      organization_id: organizationId,
      employee_id: employee.id,
      account_holder_name: input.accountHolderName,
      bank_name: input.bankName,
      account_type: input.accountType,
      account_last4: accountLast4,
      routing_last4: routingLast4,
      status,
      is_primary: isPrimary,
      provider_reference: `dd-${randomUUID()}`,
      verified_at: verifiedAt,
      notes: input.notes ?? null,
    })
    .select(BANK_ACCOUNT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to create the bank account.", error.message);
  }

  if (!data) {
    throw new ApiError(500, "Bank account creation did not return a record.");
  }

  return normalizeBankAccount(data as BankAccountRow);
}

export async function updateBankAccount(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  bankAccountId: string,
  input: BankAccountUpdateInput,
) {
  const current = await getBankAccountById(supabase, organizationId, bankAccountId);
  let employeeId = input.employeeId ?? current.employeeId;

  if (employeeId) {
    const employee = await getEmployeeSummaryInOrganization(supabase, organizationId, employeeId);
    employeeId = employee.id;
  }

  if (input.isPrimary === true) {
    await setPrimaryAccount(supabase, organizationId, employeeId, bankAccountId);
  }

  const payload = Object.fromEntries(
    Object.entries({
      employee_id: input.employeeId === undefined ? undefined : employeeId,
      account_holder_name: input.accountHolderName,
      bank_name: input.bankName,
      account_type: input.accountType,
      status: input.status,
      is_primary: input.isPrimary,
      verified_at:
        input.status === "Verified"
          ? current.verifiedAt ?? new Date().toISOString()
          : input.status
            ? null
            : undefined,
      notes: input.notes,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one bank account field must be provided.");
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", bankAccountId)
    .select(BANK_ACCOUNT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to update the bank account.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Bank account not found.");
  }

  return normalizeBankAccount(data as BankAccountRow);
}

export async function verifyBankAccount(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  bankAccountId: string,
) {
  const { data, error } = await supabase
    .from("bank_accounts")
    .update({
      status: "Verified",
      verified_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", bankAccountId)
    .select(BANK_ACCOUNT_SELECT)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to verify the bank account.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Bank account not found.");
  }

  return normalizeBankAccount(data as BankAccountRow);
}

export async function deleteBankAccount(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  bankAccountId: string,
) {
  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", bankAccountId);

  if (error) {
    throw new ApiError(500, "Failed to delete the bank account.", error.message);
  }
}
