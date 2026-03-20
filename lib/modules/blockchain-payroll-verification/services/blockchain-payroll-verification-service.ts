import { createHash } from "node:crypto";

import type { BlockchainPayrollVerification, PayrollVerificationBlock } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface PayrollRunRow {
  id: string;
  period_label: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_amount: number;
  variance_note: string;
  calculated_at: string | null;
  finalized_at: string | null;
  created_at: string;
}

interface PayrollItemRow {
  id: string;
  payroll_run_id: string;
  gross_pay: number;
  tax_amount: number;
  deductions_amount: number;
  net_pay: number;
  status: string;
}

interface VerificationRun {
  id: string;
  periodLabel: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalAmount: number;
  varianceNote: string;
  calculatedAt: string | null;
  finalizedAt: string | null;
  createdAt: string;
}

interface VerificationItem {
  id: string;
  payrollRunId: string;
  grossPay: number;
  taxAmount: number;
  deductionsAmount: number;
  netPay: number;
  status: string;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildVerificationStatus(run: VerificationRun): PayrollVerificationBlock["verificationStatus"] {
  if (run.finalizedAt || run.status === "Paid") {
    return "Anchored";
  }

  if (run.calculatedAt || ["Calculated", "Processing", "Approved"].includes(run.status)) {
    return "Verified";
  }

  return "Pending";
}

function buildPayloadHash(run: VerificationRun, items: VerificationItem[]) {
  const payload = JSON.stringify({
    run: {
      id: run.id,
      periodLabel: run.periodLabel,
      payDate: run.payDate,
      status: run.status,
      employeeCount: run.employeeCount,
      totalAmount: run.totalAmount,
      varianceNote: run.varianceNote,
      calculatedAt: run.calculatedAt,
      finalizedAt: run.finalizedAt,
      createdAt: run.createdAt,
    },
    items: [...items]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((item) => ({
        id: item.id,
        grossPay: item.grossPay,
        taxAmount: item.taxAmount,
        deductionsAmount: item.deductionsAmount,
        netPay: item.netPay,
        status: item.status,
      })),
  });

  return hashValue(payload);
}

export function buildBlockchainPayrollVerification(input: {
  payrollRuns: VerificationRun[];
  payrollItems: VerificationItem[];
  generatedAt?: string;
}) {
  const runsAscending = [...input.payrollRuns].sort((left, right) => {
    return left.payDate.localeCompare(right.payDate) || left.createdAt.localeCompare(right.createdAt);
  });

  const blocks = runsAscending.reduce<PayrollVerificationBlock[]>((chain, run, index) => {
    const items = input.payrollItems.filter((item) => item.payrollRunId === run.id);
    const previousHash = index === 0 ? "GENESIS" : chain[index - 1]!.blockHash;
    const payloadHash = buildPayloadHash(run, items);
    const blockHash = hashValue(
      JSON.stringify({
        payrollRunId: run.id,
        previousHash,
        payloadHash,
      }),
    );

    chain.push({
      id: `payroll-block-${run.id}`,
      payrollRunId: run.id,
      payrollRunLabel: run.periodLabel,
      payDate: run.payDate,
      status: run.status,
      verificationStatus: buildVerificationStatus(run),
      previousHash,
      payloadHash,
      blockHash,
      recordCount: items.length + 1,
    });

    return chain;
  }, []);

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      verifiedRuns: blocks.filter((block) => block.verificationStatus !== "Pending").length,
      anchoredRuns: blocks.filter((block) => block.verificationStatus === "Anchored").length,
      immutableRecords: blocks.reduce((sum, block) => sum + block.recordCount, 0),
      chainLength: blocks.length,
    },
    blocks: blocks.toReversed(),
  } satisfies BlockchainPayrollVerification;
}

function mapRun(row: PayrollRunRow): VerificationRun {
  return {
    id: row.id,
    periodLabel: row.period_label,
    payDate: row.pay_date,
    status: row.status,
    employeeCount: row.employee_count,
    totalAmount: row.total_amount,
    varianceNote: row.variance_note,
    calculatedAt: row.calculated_at,
    finalizedAt: row.finalized_at,
    createdAt: row.created_at,
  };
}

function mapItem(row: PayrollItemRow): VerificationItem {
  return {
    id: row.id,
    payrollRunId: row.payroll_run_id,
    grossPay: row.gross_pay,
    taxAmount: row.tax_amount,
    deductionsAmount: row.deductions_amount,
    netPay: row.net_pay,
    status: row.status,
  };
}

export async function getBlockchainPayrollVerification(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const { data: payrollRuns, error: payrollRunsError } = await supabase
    .from("payroll_runs")
    .select(
      `
        id,
        period_label,
        pay_date,
        status,
        employee_count,
        total_amount,
        variance_note,
        calculated_at,
        finalized_at,
        created_at
      `,
    )
    .eq("organization_id", organizationId)
    .order("pay_date", { ascending: false })
    .limit(6);

  if (payrollRunsError) {
    throw new ApiError(500, "Failed to load payroll runs for blockchain verification.", payrollRunsError.message);
  }

  const normalizedRuns = ((payrollRuns as PayrollRunRow[] | null) ?? []).map(mapRun);

  if (normalizedRuns.length === 0) {
    return buildBlockchainPayrollVerification({
      payrollRuns: [],
      payrollItems: [],
    });
  }

  const runIds = normalizedRuns.map((run) => run.id);
  const { data: payrollItems, error: payrollItemsError } = await supabase
    .from("payroll_items")
    .select(
      `
        id,
        payroll_run_id,
        gross_pay,
        tax_amount,
        deductions_amount,
        net_pay,
        status
      `,
    )
    .eq("organization_id", organizationId)
    .in("payroll_run_id", runIds);

  if (payrollItemsError) {
    throw new ApiError(500, "Failed to load payroll items for blockchain verification.", payrollItemsError.message);
  }

  return buildBlockchainPayrollVerification({
    payrollRuns: normalizedRuns,
    payrollItems: ((payrollItems as PayrollItemRow[] | null) ?? []).map(mapItem),
  });
}
