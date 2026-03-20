import type {
  Announcement,
  DashboardData,
  Employee,
  LeaveRequest,
  PayrollAnomaly,
  PayrollRun,
  SummaryMetric,
  UserProfile,
} from "@/lib/types";
import seedContent from "@/supabase/seed-data.json";
import { formatCurrency, initialsFromName } from "@/lib/utils";

const demoEmployees: Employee[] = seedContent.employees.map((employee, index) => ({
  id: `emp_${String(index + 1).padStart(3, "0")}`,
  fullName: employee.fullName,
  role: employee.role,
  department: employee.department,
  status: employee.status,
  location: employee.location,
  salary: employee.salary,
  startDate: employee.startDate,
  managerName: employee.managerName,
  nextReviewAt: employee.nextReviewAt,
}));

const demoPayrollRuns: PayrollRun[] = seedContent.payrollRuns.map((run) => ({
  id: run.seedKey,
  periodLabel: run.periodLabel,
  payDate: run.payDate,
  status: run.status,
  employeeCount: run.employeeCount,
  totalAmount: run.totalAmount,
  varianceNote: run.varianceNote,
}));

const demoPayrollAnomalies: PayrollAnomaly[] = [
  {
    id: "anomaly-payroll-run-2026-03-total",
    payrollRunId: "payroll-run-2026-03",
    payrollRunLabel: "March 2026",
    payDate: "2026-03-29",
    category: "Run variance",
    severity: "Medium",
    confidenceScore: 0.82,
    subject: "March 2026",
    summary: "Total payroll is above the recent baseline by 8.5%.",
    detail: "The March cycle includes a larger than normal movement in total payroll compared with the previous two completed runs.",
    recommendedAction: "Review off-cycle bonuses, starter proration, and reimbursement imports before approving the run.",
    metrics: [
      {
        label: "Total payroll",
        observed: 412840,
        expected: 380560,
        deltaPercent: 8.5,
      },
    ],
  },
  {
    id: "anomaly-priya-tax-rate",
    payrollRunId: "payroll-run-2026-03",
    payrollRunLabel: "March 2026",
    payDate: "2026-03-29",
    category: "Tax withholding drift",
    severity: "High",
    confidenceScore: 0.9,
    subject: "Priya Nair",
    summary: "Priya Nair tax withholding rate diverges from the run average by 31.4%.",
    detail: "The calculated withholding rate is materially above the current run average for comparable payroll items.",
    recommendedAction: "Confirm withholding profile changes and any manual override applied during payroll preparation.",
    metrics: [
      {
        label: "Tax rate",
        observed: 20,
        expected: 15.2,
        deltaPercent: 31.4,
      },
    ],
  },
];

const demoLeaveRequests: LeaveRequest[] = seedContent.leaveRequests.map((request) => ({
  id: request.seedKey,
  employeeName: request.employeeName,
  type: request.type,
  startDate: request.startDate,
  endDate: request.endDate,
  days: request.days,
  status: request.status,
  approverName: request.approverName,
}));

const demoAnnouncements: Announcement[] = seedContent.announcements.map((announcement) => ({
  id: announcement.seedKey,
  title: announcement.title,
  body: announcement.body,
  label: announcement.label,
}));

const demoProfile: UserProfile = {
  id: "demo-user",
  fullName: "Maya Chen",
  email: "maya@pulsehr.app",
  role: "HR Director",
  organizationName: "Northstar People Ops",
  avatarLabel: "MC",
};

export function buildSummaryMetrics(
  employees: Employee[],
  payrollRuns: PayrollRun[],
  leaveRequests: LeaveRequest[],
): SummaryMetric[] {
  const activeEmployees = employees.filter((employee) => employee.status === "Active").length;
  const reviewsDue = employees.filter((employee) => {
    const reviewTime = new Date(employee.nextReviewAt).getTime();
    const thirtyDaysFromNow = Date.now() + 1000 * 60 * 60 * 24 * 30;

    return reviewTime <= thirtyDaysFromNow;
  }).length;
  const openLeave = leaveRequests.filter((request) => request.status !== "Approved").length;
  const currentPayroll = payrollRuns[0];

  return [
    {
      label: "Active headcount",
      value: activeEmployees.toString(),
      detail: `${employees.length} people in tracked roster`,
    },
    {
      label: "Payroll in flight",
      value: currentPayroll ? formatCurrency(currentPayroll.totalAmount) : formatCurrency(0),
      detail: currentPayroll
        ? `${currentPayroll.periodLabel} for ${currentPayroll.employeeCount} teammates`
        : "No current payroll run",
    },
    {
      label: "Open leave requests",
      value: openLeave.toString(),
      detail: "Pending or in-review approvals",
    },
    {
      label: "Reviews due soon",
      value: reviewsDue.toString(),
      detail: "Managers with upcoming check-ins",
    },
  ];
}

export function getDemoDashboardData(
  overrides?: Partial<UserProfile>,
  notice = "Starter demo data is active. Connect Supabase to switch the workspace to live records.",
): DashboardData {
  const profile = {
    ...demoProfile,
    ...overrides,
  };

  return {
    mode: "demo",
    notice,
    profile: {
      ...profile,
      avatarLabel: initialsFromName(profile.fullName),
    },
    summary: buildSummaryMetrics(demoEmployees, demoPayrollRuns, demoLeaveRequests),
    employees: demoEmployees.map((employee) => ({ ...employee })),
    payrollRuns: demoPayrollRuns.map((run) => ({ ...run })),
    payrollAnomalies: demoPayrollAnomalies.map((anomaly) => ({
      ...anomaly,
      metrics: anomaly.metrics.map((metric) => ({ ...metric })),
    })),
    leaveRequests: demoLeaveRequests.map((request) => ({ ...request })),
    announcements: demoAnnouncements.map((item) => ({ ...item })),
  };
}
