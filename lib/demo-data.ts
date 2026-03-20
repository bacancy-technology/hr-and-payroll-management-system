import type {
  Announcement,
  AutomatedComplianceMonitoring,
  BenefitsRecommendation,
  ComplianceMonitoringSignal,
  CompensationBenchmarkInsight,
  DashboardData,
  Employee,
  HiringWindowRecommendation,
  LeaveRequest,
  PayrollAnomaly,
  PayrollRun,
  PredictiveTurnoverRisk,
  PredictiveWorkforceAnalytics,
  SmartBenefitsRecommendations,
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

const demoTurnoverRisk: PredictiveTurnoverRisk[] = [
  {
    employeeId: "emp_006",
    employeeName: "Noah Kim",
    department: "Finance",
    riskLevel: "Critical",
    riskScore: 84,
    drivers: [
      "Employee is already flagged as in review.",
      "Employee is within the first year of tenure.",
      "Performance review or compensation conversation is imminent.",
    ],
  },
  {
    employeeId: "emp_005",
    employeeName: "Elena Torres",
    department: "People",
    riskLevel: "Elevated",
    riskScore: 69,
    drivers: [
      "Employee is still in the early-tenure retention window.",
      "Upcoming review cycle could influence retention.",
      "Compensation sits below the department midpoint.",
    ],
  },
];

const demoHiringWindows: HiringWindowRecommendation[] = [
  {
    id: "hiring-window-people",
    department: "People",
    recommendedWindow: "Next 45 days",
    confidenceScore: 0.79,
    rationale: "2 employees, 7 leave days in the next 45 days, and 2 review cycles due soon.",
  },
  {
    id: "hiring-window-finance",
    department: "Finance",
    recommendedWindow: "Next 30 days",
    confidenceScore: 0.86,
    rationale: "2 employees, 2 leave days in the next 45 days, and 1 review cycle due soon.",
  },
  {
    id: "hiring-window-design",
    department: "Design",
    recommendedWindow: "Next quarter",
    confidenceScore: 0.62,
    rationale: "1 employee, 6 leave days in the next 45 days, and 0 review cycles due soon.",
  },
];

const demoCompensationBenchmarks: CompensationBenchmarkInsight[] = [
  {
    id: "benchmark-engineering",
    department: "Engineering",
    averageSalary: 132000,
    benchmarkSalary: 142560,
    gapPercent: -7.41,
    position: "Below",
  },
  {
    id: "benchmark-finance",
    department: "Finance",
    averageSalary: 92000,
    benchmarkSalary: 94760,
    gapPercent: -2.91,
    position: "Aligned",
  },
  {
    id: "benchmark-people",
    department: "People",
    averageSalary: 120000,
    benchmarkSalary: 122400,
    gapPercent: -1.96,
    position: "Aligned",
  },
];

export function getDemoPredictiveWorkforceAnalytics(): PredictiveWorkforceAnalytics {
  return {
    generatedAt: "2026-03-20T08:30:00.000Z",
    summary: {
      monitoredEmployees: demoEmployees.length,
      highRiskEmployees: demoTurnoverRisk.filter((employee) => employee.riskLevel === "Critical").length,
      recommendedHiringWindows: demoHiringWindows.filter((window) => window.recommendedWindow !== "Next quarter").length,
      departmentsBelowBenchmark: demoCompensationBenchmarks.filter((item) => item.position === "Below").length,
    },
    turnoverRisk: demoTurnoverRisk.map((employee) => ({ ...employee, drivers: [...employee.drivers] })),
    hiringWindows: demoHiringWindows.map((window) => ({ ...window })),
    compensationBenchmarks: demoCompensationBenchmarks.map((benchmark) => ({ ...benchmark })),
  };
}

const demoBenefitsRecommendations: BenefitsRecommendation[] = [
  {
    id: "benefits-rec-elena-health",
    employeeId: "emp_005",
    employeeName: "Elena Torres",
    department: "People",
    recommendedPlanId: "benefits-plan-health-plus",
    recommendedPlanName: "Health Plus PPO",
    category: "Health Insurance",
    priority: "Priority",
    confidenceScore: 0.91,
    rationale:
      "Peer adoption is strong for this plan. Newer employees typically finalize health selections during first-year setup. Upcoming compensation review is a natural benefits refresh moment.",
    lifeEvents: ["New hire window", "Comp review approaching"],
  },
  {
    id: "benefits-rec-noah-retirement",
    employeeId: "emp_006",
    employeeName: "Noah Kim",
    department: "Finance",
    recommendedPlanId: "benefits-plan-retirement-match",
    recommendedPlanName: "Retirement Match 401(k)",
    category: "Retirement",
    priority: "Recommended",
    confidenceScore: 0.82,
    rationale:
      "Peer adoption is strong for this plan. Employee has enough tenure to benefit from retirement matching. Upcoming compensation review is a natural benefits refresh moment.",
    lifeEvents: ["New hire window", "Comp review approaching", "Coverage-sensitive leave"],
  },
  {
    id: "benefits-rec-jordan-health",
    employeeId: "emp_002",
    employeeName: "Jordan Blake",
    department: "Engineering",
    recommendedPlanId: "benefits-plan-health-plus",
    recommendedPlanName: "Health Plus PPO",
    category: "Health Insurance",
    priority: "Consider",
    confidenceScore: 0.73,
    rationale:
      "Peer adoption is strong for this plan. Remote employees often respond well to stronger core coverage options.",
    lifeEvents: ["Remote work setup"],
  },
];

export function getDemoSmartBenefitsRecommendations(): SmartBenefitsRecommendations {
  return {
    generatedAt: "2026-03-20T08:45:00.000Z",
    summary: {
      employeesEvaluated: demoEmployees.length,
      recommendationsGenerated: demoBenefitsRecommendations.length,
      mostRecommendedCategory: "Health Insurance",
    },
    recommendations: demoBenefitsRecommendations.map((recommendation) => ({
      ...recommendation,
      lifeEvents: [...recommendation.lifeEvents],
    })),
  };
}

const demoComplianceMonitoringSignals: ComplianceMonitoringSignal[] = [
  {
    id: "compliance-signal-federal-941",
    ruleId: "compliance-rule-federal-941-q1",
    ruleName: "Federal Form 941 Q1 Filing",
    jurisdiction: "United States - Federal",
    category: "Payroll Tax",
    monitoringStatus: "Action Required",
    impactLevel: "High",
    recommendedPolicyUpdate:
      "Refresh filing checklist, reconciliation controls, and reviewer sign-off steps.",
    impactAssessment:
      "Missed action could delay payroll filings or create immediate audit exposure for the affected jurisdiction.",
    dueDate: "2026-04-30",
  },
  {
    id: "compliance-signal-ca-ui",
    ruleId: "compliance-rule-state-ca-ui-q1",
    ruleName: "California UI Wage Report",
    jurisdiction: "California",
    category: "State Payroll Tax",
    monitoringStatus: "Watch",
    impactLevel: "Medium",
    recommendedPolicyUpdate:
      "Update state-specific wage validation workflow and employee record audit checkpoints.",
    impactAssessment:
      "Operational delay is likely unless filings, wage validation, and reviewer handoffs are completed on time.",
    dueDate: "2026-04-30",
  },
];

export function getDemoAutomatedComplianceMonitoring(): AutomatedComplianceMonitoring {
  return {
    generatedAt: "2026-03-20T09:00:00.000Z",
    summary: {
      monitoredRules: demoComplianceMonitoringSignals.length,
      actionRequiredSignals: demoComplianceMonitoringSignals.filter(
        (signal) => signal.monitoringStatus === "Action Required",
      ).length,
      upcomingDeadlines: 2,
      jurisdictionsImpacted: 2,
    },
    signals: demoComplianceMonitoringSignals.map((signal) => ({ ...signal })),
  };
}

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
    predictiveWorkforceAnalytics: getDemoPredictiveWorkforceAnalytics(),
    smartBenefitsRecommendations: getDemoSmartBenefitsRecommendations(),
    automatedComplianceMonitoring: getDemoAutomatedComplianceMonitoring(),
    leaveRequests: demoLeaveRequests.map((request) => ({ ...request })),
    announcements: demoAnnouncements.map((item) => ({ ...item })),
  };
}
