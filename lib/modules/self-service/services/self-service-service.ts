import { deletePtoRequest, updatePtoRequest, createPtoRequest } from "@/lib/modules/pto/services/pto-service";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface SelfServiceProfileUpdateInput {
  fullName?: string;
  email?: string;
  location?: string;
}

interface SelfServicePtoInput {
  type?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  notes?: string | null;
}

interface SelfServiceProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface SelfServiceEmployeeRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  location: string;
  salary: number;
  start_date: string;
  manager_name: string;
  next_review_at: string;
  departments:
    | {
        id: string;
        name: string;
        code: string | null;
      }
    | {
        id: string;
        name: string;
        code: string | null;
      }[]
    | null;
}

interface SelfServicePaystubRow {
  id: string;
  payroll_run_id: string;
  gross_pay: number;
  tax_amount: number;
  deductions_amount: number;
  net_pay: number;
  status: string;
  created_at: string;
  payroll_runs:
    | {
        id: string;
        period_label: string;
        pay_date: string;
        status: string;
        finalized_at: string | null;
      }
    | {
        id: string;
        period_label: string;
        pay_date: string;
        status: string;
        finalized_at: string | null;
      }[]
    | null;
}

interface SelfServicePtoRow {
  id: string;
  employee_id: string | null;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  approver_name: string;
  notes: string | null;
  created_at: string;
}

interface SelfServiceBankAccountRow {
  id: string;
  employee_id: string;
  bank_name: string;
  account_type: string;
  account_last4: string;
  routing_last4: string;
  status: string;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
}

const SELF_SERVICE_EMPLOYEE_SELECT = `
  id,
  full_name,
  email,
  role,
  status,
  location,
  salary,
  start_date,
  manager_name,
  next_review_at,
  departments (
    id,
    name,
    code
  )
`;

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeSelfServiceEmployee(row: SelfServiceEmployeeRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    location: row.location,
    salary: row.salary,
    startDate: row.start_date,
    managerName: row.manager_name,
    nextReviewAt: row.next_review_at,
    department: normalizeRelation(row.departments),
  };
}

function normalizeSelfServicePaystub(row: SelfServicePaystubRow) {
  return {
    id: row.id,
    payrollRunId: row.payroll_run_id,
    grossPay: row.gross_pay,
    taxAmount: row.tax_amount,
    deductionsAmount: row.deductions_amount,
    netPay: row.net_pay,
    status: row.status,
    createdAt: row.created_at,
    payrollRun: normalizeRelation(row.payroll_runs),
  };
}

function normalizeSelfServicePto(row: SelfServicePtoRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    status: row.status,
    approverName: row.approver_name,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function normalizeSelfServiceBankAccount(row: SelfServiceBankAccountRow) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    bankName: row.bank_name,
    accountType: row.account_type,
    accountLast4: row.account_last4,
    routingLast4: row.routing_last4,
    status: row.status,
    isPrimary: row.is_primary,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  };
}

async function getSelfServiceProfileRecord(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the self-service profile.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Self-service profile not found.");
  }

  return data as SelfServiceProfileRow;
}

async function getSelfServiceEmployeeRecord(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  email: string,
) {
  const { data, error } = await supabase
    .from("employees")
    .select(SELF_SERVICE_EMPLOYEE_SELECT)
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the self-service employee record.", error.message);
  }

  if (!data) {
    throw new ApiError(
      404,
      "No employee record is linked to the current account for self-service access.",
    );
  }

  return data as SelfServiceEmployeeRow;
}

async function getSelfServiceContext(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const profile = await getSelfServiceProfileRecord(supabase, organizationId, userId);
  const employee = await getSelfServiceEmployeeRecord(supabase, organizationId, profile.email);

  return {
    profile,
    employee,
  };
}

export async function getSelfServiceProfile(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { profile, employee } = await getSelfServiceContext(supabase, organizationId, userId);
  const bankAccounts = await listSelfServiceBankAccountsByEmployeeId(supabase, organizationId, employee.id);

  return {
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role,
    },
    employee: normalizeSelfServiceEmployee(employee),
    bankAccounts,
  };
}

export async function updateSelfServiceProfile(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  input: SelfServiceProfileUpdateInput,
) {
  const { profile, employee } = await getSelfServiceContext(supabase, organizationId, userId);

  const profilePayload = Object.fromEntries(
    Object.entries({
      full_name: input.fullName,
      email: input.email,
    }).filter(([, value]) => value !== undefined),
  );

  const employeePayload = Object.fromEntries(
    Object.entries({
      full_name: input.fullName,
      email: input.email,
      location: input.location,
    }).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(profilePayload).length === 0 && Object.keys(employeePayload).length === 0) {
    throw new ApiError(400, "At least one self-service profile field must be provided.");
  }

  if (Object.keys(profilePayload).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", profile.id)
      .eq("organization_id", organizationId);

    if (error) {
      throw new ApiError(500, "Failed to update the self-service profile.", error.message);
    }
  }

  if (Object.keys(employeePayload).length > 0) {
    const { error } = await supabase
      .from("employees")
      .update(employeePayload)
      .eq("id", employee.id)
      .eq("organization_id", organizationId);

    if (error) {
      throw new ApiError(500, "Failed to update the employee self-service information.", error.message);
    }
  }

  return getSelfServiceProfile(supabase, organizationId, userId);
}

export async function listSelfServicePaystubs(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { employee } = await getSelfServiceContext(supabase, organizationId, userId);

  return listSelfServicePaystubsByEmployeeId(supabase, organizationId, employee.id);
}

async function listSelfServicePaystubsByEmployeeId(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("payroll_items")
    .select(
      `
        id,
        payroll_run_id,
        gross_pay,
        tax_amount,
        deductions_amount,
        net_pay,
        status,
        created_at,
        payroll_runs (
          id,
          period_label,
          pay_date,
          status,
          finalized_at
        )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load self-service paystubs.", error.message);
  }

  return ((data as SelfServicePaystubRow[] | null) ?? []).map((row) =>
    normalizeSelfServicePaystub(row),
  );
}

export async function listSelfServicePtoRequests(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { employee } = await getSelfServiceContext(supabase, organizationId, userId);

  return listSelfServicePtoRequestsByEmployeeId(supabase, organizationId, employee.id);
}

async function listSelfServicePtoRequestsByEmployeeId(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      `
        id,
        employee_id,
        employee_name,
        type,
        start_date,
        end_date,
        days,
        status,
        approver_name,
        notes,
        created_at
      `,
    )
    .eq("organization_id", organizationId)
    .eq("employee_id", employeeId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load self-service PTO requests.", error.message);
  }

  return ((data as SelfServicePtoRow[] | null) ?? []).map((row) => normalizeSelfServicePto(row));
}

export async function getSelfServicePtoRequestById(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  requestId: string,
) {
  const { employee } = await getSelfServiceContext(supabase, organizationId, userId);

  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      `
        id,
        employee_id,
        employee_name,
        type,
        start_date,
        end_date,
        days,
        status,
        approver_name,
        notes,
        created_at
      `,
    )
    .eq("organization_id", organizationId)
    .eq("employee_id", employee.id)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load the self-service PTO request.", error.message);
  }

  if (!data) {
    throw new ApiError(404, "Self-service PTO request not found.");
  }

  return normalizeSelfServicePto(data as SelfServicePtoRow);
}

export async function createSelfServicePtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  input: Required<Pick<SelfServicePtoInput, "type" | "startDate" | "endDate" | "days">> &
    SelfServicePtoInput,
) {
  const { employee } = await getSelfServiceContext(supabase, organizationId, userId);

  return createPtoRequest(supabase, organizationId, {
    employeeId: employee.id,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    days: input.days,
    approverName: employee.manager_name,
    notes: input.notes ?? null,
  });
}

export async function updateSelfServicePtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  requestId: string,
  input: SelfServicePtoInput,
) {
  await getSelfServicePtoRequestById(supabase, organizationId, userId, requestId);

  return updatePtoRequest(supabase, organizationId, requestId, {
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    days: input.days,
    notes: input.notes,
  });
}

export async function deleteSelfServicePtoRequest(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
  requestId: string,
) {
  await getSelfServicePtoRequestById(supabase, organizationId, userId, requestId);

  await deletePtoRequest(supabase, organizationId, requestId);
}

export async function listSelfServiceBankAccounts(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { employee } = await getSelfServiceContext(supabase, organizationId, userId);

  return listSelfServiceBankAccountsByEmployeeId(supabase, organizationId, employee.id);
}

async function listSelfServiceBankAccountsByEmployeeId(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  employeeId: string,
) {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      `
        id,
        employee_id,
        bank_name,
        account_type,
        account_last4,
        routing_last4,
        status,
        is_primary,
        verified_at,
        created_at
      `,
    )
    .eq("organization_id", organizationId)
    .eq("employee_id", employeeId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load self-service bank accounts.", error.message);
  }

  return ((data as SelfServiceBankAccountRow[] | null) ?? []).map((row) =>
    normalizeSelfServiceBankAccount(row),
  );
}

export async function getSelfServiceWorkspace(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { profile, employee } = await getSelfServiceContext(supabase, organizationId, userId);
  const normalizedEmployee = normalizeSelfServiceEmployee(employee);

  const [paystubs, ptoRequests, bankAccounts] = await Promise.all([
    listSelfServicePaystubsByEmployeeId(supabase, organizationId, employee.id),
    listSelfServicePtoRequestsByEmployeeId(supabase, organizationId, employee.id),
    listSelfServiceBankAccountsByEmployeeId(supabase, organizationId, employee.id),
  ]);

  const now = Date.now();
  const upcomingApprovedDays = ptoRequests
    .filter((request) => request.status === "Approved" && new Date(request.startDate).getTime() >= now)
    .reduce((sum, request) => sum + request.days, 0);
  const pendingRequests = ptoRequests.filter((request) => request.status === "Pending").length;
  const primaryAccount = bankAccounts.find((account) => account.isPrimary);

  return {
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role,
    },
    employee: normalizedEmployee,
    bankAccounts,
    summary: {
      paystubCount: paystubs.length,
      pendingPtoRequests: pendingRequests,
      upcomingApprovedPtoDays: upcomingApprovedDays,
      directDepositStatus: primaryAccount?.status ?? "Not setup",
    },
    paystubs,
    ptoRequests,
  };
}
