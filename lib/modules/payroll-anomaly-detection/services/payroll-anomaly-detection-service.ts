import type { PayrollAnomaly } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";

interface PayrollRunSignal {
  id: string;
  periodLabel: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalAmount: number;
}

interface PayrollItemSignal {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  annualSalary: number;
  grossPay: number;
  taxAmount: number;
  deductionsAmount: number;
  netPay: number;
  status: string;
}

interface PayrollRunRow {
  id: string;
  period_label: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_amount: number;
}

interface PayrollItemRow {
  id: string;
  payroll_run_id: string;
  gross_pay: number;
  tax_amount: number;
  deductions_amount: number;
  net_pay: number;
  status: string;
  employees:
    | {
        id: string;
        full_name: string;
        salary: number;
      }
    | {
        id: string;
        full_name: string;
        salary: number;
      }[]
    | null;
}

function normalizeRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function buildConfidenceScore(score: number) {
  return Math.min(0.99, round(0.45 + score / 200));
}

function toSeverity(score: number): PayrollAnomaly["severity"] {
  if (score >= 78) {
    return "High";
  }

  if (score >= 58) {
    return "Medium";
  }

  return "Low";
}

function buildRunAmountAnomaly(currentRun: PayrollRunSignal, historicalRuns: PayrollRunSignal[]) {
  if (historicalRuns.length < 2) {
    return null;
  }

  const baseline = historicalRuns.reduce((sum, run) => sum + run.totalAmount, 0) / historicalRuns.length;
  const deltaPercent = ((currentRun.totalAmount - baseline) / baseline) * 100;
  const amountDeviation = Math.abs(deltaPercent);

  if (amountDeviation < 6) {
    return null;
  }

  const headcountBaseline = historicalRuns.reduce((sum, run) => sum + run.employeeCount, 0) / historicalRuns.length;
  const headcountDelta = currentRun.employeeCount - headcountBaseline;
  const score = Math.min(96, 48 + amountDeviation * 3 + Math.abs(headcountDelta) * 4);

  return {
    id: `run-amount-${currentRun.id}`,
    payrollRunId: currentRun.id,
    payrollRunLabel: currentRun.periodLabel,
    payDate: currentRun.payDate,
    category: "Run variance",
    severity: toSeverity(score),
    confidenceScore: buildConfidenceScore(score),
    subject: currentRun.periodLabel,
    summary: `Total payroll is ${deltaPercent > 0 ? "above" : "below"} the recent baseline by ${round(amountDeviation)}%.`,
    detail: `The run totals ${round(currentRun.totalAmount)} against a recent average of ${round(baseline)} across ${historicalRuns.length} prior cycles.`,
    recommendedAction:
      "Review off-cycle adjustments, new starters, and one-time compensation before final approval.",
    metrics: [
      {
        label: "Total payroll",
        observed: currentRun.totalAmount,
        expected: round(baseline),
        deltaPercent: round(deltaPercent),
      },
      {
        label: "Headcount",
        observed: currentRun.employeeCount,
        expected: round(headcountBaseline),
        deltaPercent: round((headcountDelta / Math.max(headcountBaseline, 1)) * 100),
      },
    ],
  } satisfies PayrollAnomaly;
}

function buildNetPayAnomaly(
  currentRun: PayrollRunSignal,
  item: PayrollItemSignal,
  peerAverageNetPay: number,
) {
  const expectedNetPay = item.annualSalary / 24;
  const salaryVariancePercent = ((item.netPay - expectedNetPay) / expectedNetPay) * 100;
  const peerVariancePercent = ((item.netPay - peerAverageNetPay) / peerAverageNetPay) * 100;
  const varianceMagnitude = Math.max(Math.abs(salaryVariancePercent), Math.abs(peerVariancePercent));

  if (varianceMagnitude < 18) {
    return null;
  }

  const score = Math.min(98, 52 + varianceMagnitude * 1.9);

  return {
    id: `net-pay-${item.id}`,
    payrollRunId: currentRun.id,
    payrollRunLabel: currentRun.periodLabel,
    payDate: currentRun.payDate,
    category: "Net pay deviation",
    severity: toSeverity(score),
    confidenceScore: buildConfidenceScore(score),
    subject: item.employeeName,
    summary: `${item.employeeName} net pay differs from the expected semi-monthly baseline by ${round(Math.abs(salaryVariancePercent))}%.`,
    detail: `Observed net pay is ${round(item.netPay)} versus an expected baseline of ${round(expectedNetPay)} and peer average of ${round(peerAverageNetPay)}.`,
    recommendedAction:
      "Inspect bonuses, retroactive adjustments, reimbursement imports, and benefit deductions for this employee.",
    metrics: [
      {
        label: "Net pay",
        observed: item.netPay,
        expected: round(expectedNetPay),
        deltaPercent: round(salaryVariancePercent),
      },
      {
        label: "Peer benchmark",
        observed: item.netPay,
        expected: round(peerAverageNetPay),
        deltaPercent: round(peerVariancePercent),
      },
    ],
  } satisfies PayrollAnomaly;
}

function buildTaxRateAnomaly(currentRun: PayrollRunSignal, item: PayrollItemSignal, averageTaxRate: number) {
  if (item.grossPay <= 0) {
    return null;
  }

  const observedTaxRate = item.taxAmount / item.grossPay;
  const deltaPercent = ((observedTaxRate - averageTaxRate) / averageTaxRate) * 100;

  if (Math.abs(deltaPercent) < 28) {
    return null;
  }

  const score = Math.min(94, 48 + Math.abs(deltaPercent) * 1.25);

  return {
    id: `tax-rate-${item.id}`,
    payrollRunId: currentRun.id,
    payrollRunLabel: currentRun.periodLabel,
    payDate: currentRun.payDate,
    category: "Tax withholding drift",
    severity: toSeverity(score),
    confidenceScore: buildConfidenceScore(score),
    subject: item.employeeName,
    summary: `${item.employeeName} tax withholding rate diverges from the run average by ${round(Math.abs(deltaPercent))}%.`,
    detail: `Observed withholding is ${round(observedTaxRate * 100)}% compared with a run average of ${round(averageTaxRate * 100)}%.`,
    recommendedAction:
      "Confirm tax profile changes, localized withholding rules, and manual overrides before payroll is finalized.",
    metrics: [
      {
        label: "Tax rate",
        observed: round(observedTaxRate * 100),
        expected: round(averageTaxRate * 100),
        deltaPercent: round(deltaPercent),
      },
    ],
  } satisfies PayrollAnomaly;
}

export function detectPayrollAnomalies(input: {
  payrollRuns: PayrollRunSignal[];
  payrollItems: PayrollItemSignal[];
  maxResults?: number;
}) {
  const sortedRuns = [...input.payrollRuns].sort((left, right) => right.payDate.localeCompare(left.payDate));

  if (sortedRuns.length === 0) {
    return [];
  }

  const anomalies: PayrollAnomaly[] = [];
  const currentRun = sortedRuns[0];
  const historicalRuns = sortedRuns.slice(1, 4);
  const runAmountAnomaly = buildRunAmountAnomaly(currentRun, historicalRuns);

  if (runAmountAnomaly) {
    anomalies.push(runAmountAnomaly);
  }

  const currentRunItems = input.payrollItems.filter((item) => item.payrollRunId === currentRun.id);

  if (currentRunItems.length > 0) {
    const peerAverageNetPay =
      currentRunItems.reduce((sum, item) => sum + item.netPay, 0) / currentRunItems.length;
    const averageTaxRate =
      currentRunItems.reduce((sum, item) => sum + (item.grossPay > 0 ? item.taxAmount / item.grossPay : 0), 0) /
      currentRunItems.length;

    for (const item of currentRunItems) {
      const netPayAnomaly = buildNetPayAnomaly(currentRun, item, peerAverageNetPay);

      if (netPayAnomaly) {
        anomalies.push(netPayAnomaly);
      }

      const taxRateAnomaly = buildTaxRateAnomaly(currentRun, item, averageTaxRate);

      if (taxRateAnomaly) {
        anomalies.push(taxRateAnomaly);
      }
    }
  }

  return anomalies
    .sort((left, right) => right.confidenceScore - left.confidenceScore)
    .slice(0, input.maxResults ?? 6);
}

function mapPayrollRun(row: PayrollRunRow): PayrollRunSignal {
  return {
    id: row.id,
    periodLabel: row.period_label,
    payDate: row.pay_date,
    status: row.status,
    employeeCount: row.employee_count,
    totalAmount: row.total_amount,
  };
}

function mapPayrollItem(row: PayrollItemRow): PayrollItemSignal | null {
  const employee = normalizeRelation(row.employees);

  if (!employee) {
    return null;
  }

  return {
    id: row.id,
    payrollRunId: row.payroll_run_id,
    employeeId: employee.id,
    employeeName: employee.full_name,
    annualSalary: employee.salary,
    grossPay: row.gross_pay,
    taxAmount: row.tax_amount,
    deductionsAmount: row.deductions_amount,
    netPay: row.net_pay,
    status: row.status,
  };
}

export async function listPayrollAnomalies(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  maxResults = 6,
) {
  const { data: payrollRuns, error: payrollRunsError } = await supabase
    .from("payroll_runs")
    .select("id, period_label, pay_date, status, employee_count, total_amount")
    .eq("organization_id", organizationId)
    .order("pay_date", { ascending: false })
    .limit(6);

  if (payrollRunsError) {
    throw new ApiError(500, "Failed to load payroll runs for anomaly detection.", payrollRunsError.message);
  }

  const normalizedRuns = ((payrollRuns as PayrollRunRow[] | null) ?? []).map(mapPayrollRun);

  if (normalizedRuns.length === 0) {
    return [];
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
        status,
        employees (
          id,
          full_name,
          salary
        )
      `,
    )
    .eq("organization_id", organizationId)
    .in("payroll_run_id", runIds);

  if (payrollItemsError) {
    throw new ApiError(500, "Failed to load payroll items for anomaly detection.", payrollItemsError.message);
  }

  return detectPayrollAnomalies({
    payrollRuns: normalizedRuns,
    payrollItems: ((payrollItems as PayrollItemRow[] | null) ?? [])
      .map((item) => mapPayrollItem(item))
      .filter((item): item is PayrollItemSignal => Boolean(item)),
    maxResults,
  });
}
