import type {
  AdvancedSchedulingEngine,
  Announcement,
  AutomatedJobPostingIntegration,
  AutomatedComplianceMonitoring,
  BenefitsRecommendation,
  BlockchainPayrollVerification,
  ComplianceMonitoringSignal,
  CompensationBenchmarkInsight,
  DashboardData,
  DynamicOrgChartVisualization,
  EmployeeWellnessDashboard,
  Employee,
  GlobalPayrollSupport,
  HiringWindowRecommendation,
  IntelligentDocumentProcessing,
  LeaveRequest,
  PayrollAnomaly,
  RealTimePayrollCostTracking,
  PayrollRun,
  PredictiveTurnoverRisk,
  PredictiveWorkforceAnalytics,
  SentimentAnalysisDashboard,
  SmartBenefitsRecommendations,
  SummaryMetric,
  UserProfile,
  VoiceActivatedHrAssistant,
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

export function getDemoVoiceActivatedHrAssistant(): VoiceActivatedHrAssistant {
  return {
    generatedAt: "2026-03-20T09:15:00.000Z",
    summary: {
      supportedCommands: 4,
      automationReadyActions: 3,
    },
    sampleCommands: [
      {
        prompt: "What is my PTO balance this quarter?",
        intent: "pto_balance",
      },
      {
        prompt: "Submit 2 days of PTO for April 10 to April 11 for vacation.",
        intent: "submit_pto_request",
      },
      {
        prompt: "Summarize my latest payroll information.",
        intent: "payroll_summary",
      },
    ],
    recentResult: {
      id: "voice-preview-default",
      transcript: "What is my PTO balance this quarter?",
      intent: "pto_balance",
      response: "You currently have 6 approved PTO days scheduled and 1 pending PTO request.",
      actionTaken: "Prepared demo self-service preview.",
    },
  };
}

export function getDemoBlockchainPayrollVerification(): BlockchainPayrollVerification {
  return {
    generatedAt: "2026-03-20T09:25:00.000Z",
    summary: {
      verifiedRuns: 3,
      anchoredRuns: 2,
      immutableRecords: 12,
      chainLength: 3,
    },
    blocks: [
      {
        id: "payroll-block-payroll-run-2026-03",
        payrollRunId: "payroll-run-2026-03",
        payrollRunLabel: "March 2026",
        payDate: "2026-03-29",
        status: "Processing",
        verificationStatus: "Verified",
        previousHash: "14983f2c0d...d6a51be220",
        payloadHash: "5720bc3f5f...ed881f28aa",
        blockHash: "7ac39502de...4c4cf8f4fe",
        recordCount: 4,
      },
      {
        id: "payroll-block-payroll-run-2026-02",
        payrollRunId: "payroll-run-2026-02",
        payrollRunLabel: "February 2026",
        payDate: "2026-02-27",
        status: "Paid",
        verificationStatus: "Anchored",
        previousHash: "7b405ec7ab...1035f4b0b1",
        payloadHash: "14983f2c0d...d6a51be220",
        blockHash: "5b905fc42f...af83f8de12",
        recordCount: 4,
      },
      {
        id: "payroll-block-payroll-run-2026-01",
        payrollRunId: "payroll-run-2026-01",
        payrollRunLabel: "January 2026",
        payDate: "2026-01-30",
        status: "Paid",
        verificationStatus: "Anchored",
        previousHash: "GENESIS",
        payloadHash: "7b405ec7ab...1035f4b0b1",
        blockHash: "f8ac13d5ac...6504c9e5d2",
        recordCount: 4,
      },
    ],
  };
}

export function getDemoDynamicOrgChartVisualization(): DynamicOrgChartVisualization {
  return {
    generatedAt: "2026-03-20T09:35:00.000Z",
    summary: {
      people: 6,
      rootLeaders: 1,
      reportingLinks: 5,
      departments: 4,
    },
    nodes: [
      {
        id: "emp_001",
        fullName: "Anika Raman",
        role: "VP, People Operations",
        departmentName: "People",
        managerName: "Executive Team",
        level: 0,
        directReportCount: 2,
      },
      {
        id: "emp_005",
        fullName: "Elena Torres",
        role: "Talent Partner",
        departmentName: "People",
        managerName: "Anika Raman",
        level: 1,
        directReportCount: 0,
      },
      {
        id: "emp_003",
        fullName: "Priya Nair",
        role: "Payroll Specialist",
        departmentName: "Finance",
        managerName: "Anika Raman",
        level: 1,
        directReportCount: 1,
      },
      {
        id: "emp_006",
        fullName: "Noah Kim",
        role: "Finance Analyst",
        departmentName: "Finance",
        managerName: "Priya Nair",
        level: 2,
        directReportCount: 0,
      },
      {
        id: "emp_002",
        fullName: "Jordan Blake",
        role: "Senior Backend Engineer",
        departmentName: "Engineering",
        managerName: "Mina Carter",
        level: 0,
        directReportCount: 0,
      },
      {
        id: "emp_004",
        fullName: "Marcus Lee",
        role: "Product Designer",
        departmentName: "Design",
        managerName: "Daniel Moss",
        level: 0,
        directReportCount: 0,
      },
    ],
    links: [
      {
        sourceEmployeeId: "emp_001",
        targetEmployeeId: "emp_005",
      },
      {
        sourceEmployeeId: "emp_001",
        targetEmployeeId: "emp_003",
      },
      {
        sourceEmployeeId: "emp_003",
        targetEmployeeId: "emp_006",
      },
    ],
  };
}

export function getDemoAutomatedJobPostingIntegration(): AutomatedJobPostingIntegration {
  return {
    generatedAt: "2026-03-20T09:45:00.000Z",
    summary: {
      connectedBoards: 2,
      activePostings: 3,
      trackedApplications: 41,
      syncedBoards: 2,
    },
    boards: [
      {
        id: "job-board-linkedin",
        provider: "linkedin-jobs",
        displayName: "LinkedIn Jobs",
        status: "Connected",
        lastSyncedAt: "2026-03-20T05:30:00Z",
        postedJobs: 3,
        applicationsTracked: 18,
      },
      {
        id: "job-board-indeed",
        provider: "indeed",
        displayName: "Indeed",
        status: "Connected",
        lastSyncedAt: "2026-03-20T05:25:00Z",
        postedJobs: 3,
        applicationsTracked: 15,
      },
      {
        id: "job-board-wellfound",
        provider: "wellfound",
        displayName: "Wellfound",
        status: "Disconnected",
        lastSyncedAt: null,
        postedJobs: 0,
        applicationsTracked: 0,
      },
    ],
    postings: [
      {
        id: "posting-people",
        title: "Talent Acquisition Partner",
        department: "People",
        employmentType: "Full-time",
        status: "Posted",
        targetBoards: ["LinkedIn Jobs", "Indeed"],
        applications: 14,
        source: "Anika Raman hiring plan",
      },
      {
        id: "posting-finance",
        title: "Payroll Operations Analyst",
        department: "Finance",
        employmentType: "Full-time",
        status: "Posted",
        targetBoards: ["LinkedIn Jobs", "Indeed"],
        applications: 16,
        source: "Priya Nair hiring plan",
      },
      {
        id: "posting-engineering",
        title: "Senior Backend Engineer",
        department: "Engineering",
        employmentType: "Full-time",
        status: "Syncing",
        targetBoards: ["LinkedIn Jobs", "Indeed"],
        applications: 11,
        source: "Workforce planning",
      },
    ],
  };
}

export function getDemoEmployeeWellnessDashboard(): EmployeeWellnessDashboard {
  return {
    generatedAt: "2026-03-20T10:00:00.000Z",
    summary: {
      participatingEmployees: 5,
      wellnessResources: 3,
      activeSignals: 4,
      connectedApps: 1,
    },
    metrics: [
      {
        label: "Participation rate",
        value: "83%",
        detail: "Employees contributing wellness-relevant activity signals this cycle.",
      },
      {
        label: "Average workday",
        value: "8.1 hrs",
        detail: "Based on approved and submitted tracked hours.",
      },
      {
        label: "Approved recovery time",
        value: "15 days",
        detail: "Upcoming and completed approved PTO supporting time away.",
      },
      {
        label: "Health coverage",
        value: "1",
        detail: "Employees currently enrolled in health-related benefits.",
      },
    ],
    resources: [
      {
        id: "resource-mental-health-eap",
        title: "Employee Assistance Program",
        category: "Mental Health",
        availability: "24/7",
        description: "Confidential counseling sessions and manager escalation guidance.",
      },
      {
        id: "resource-fitness-sync",
        title: "Fitness App Sync",
        category: "Fitness",
        availability: "Connected",
        description: "Weekly activity goals synced from supported wellness apps.",
      },
      {
        id: "resource-burnout-coaching",
        title: "Burnout Prevention Coaching",
        category: "Manager Support",
        availability: "Bookable",
        description: "Structured coaching for workload planning and recovery routines.",
      },
    ],
    signals: [
      {
        id: "wellness-signal-jordan-burnout",
        employeeName: "Jordan Blake",
        focusArea: "Workload balance",
        signal: "Jordan Blake logged 3.4 overtime hours recently.",
        recommendation: "Encourage recovery time and rebalance sprint or payroll-close responsibilities.",
      },
      {
        id: "wellness-signal-priya-recovery",
        employeeName: "Priya Nair",
        focusArea: "Recovery time",
        signal: "Priya Nair has no approved leave currently scheduled.",
        recommendation: "Prompt a manager check-in about rest, flexibility, and upcoming time-off plans.",
      },
      {
        id: "wellness-signal-elena-steady",
        employeeName: "Elena Torres",
        focusArea: "Steady state",
        signal: "Elena Torres is trending within expected workload and time-away ranges.",
        recommendation: "Maintain existing cadence and keep wellness resources visible.",
      },
      {
        id: "wellness-signal-noah-recovery",
        employeeName: "Noah Kim",
        focusArea: "Recovery time",
        signal: "Noah Kim has no approved leave currently scheduled.",
        recommendation: "Prompt a manager check-in about rest, flexibility, and upcoming time-off plans.",
      },
    ],
  };
}

export function getDemoRealTimePayrollCostTracking(): RealTimePayrollCostTracking {
  return {
    generatedAt: "2026-03-20T10:15:00.000Z",
    summary: {
      currentAccruedCost: 213480,
      projectedCloseCost: 425960,
      budgetVariancePercent: 3.2,
      activeDepartments: 4,
    },
    metrics: [
      {
        label: "Current accrued payroll",
        amount: 213480,
        detail: "16 of 31 days accrued in Late March 2026.",
      },
      {
        label: "Projected close cost",
        amount: 425960,
        detail: "Projected end-of-period payroll using salary pace and current overtime.",
      },
      {
        label: "Budget baseline",
        amount: 412840,
        detail: "Compared with March 2026.",
      },
      {
        label: "Daily burn rate",
        amount: 13342,
        detail: "Average payroll cost accruing per elapsed workday.",
      },
    ],
    breakdown: [
      {
        department: "Engineering",
        accruedCost: 74210,
        projectedCost: 148420,
        headcount: 1,
      },
      {
        department: "People",
        accruedCost: 61940,
        projectedCost: 123880,
        headcount: 2,
      },
      {
        department: "Finance",
        accruedCost: 48630,
        projectedCost: 97260,
        headcount: 2,
      },
      {
        department: "Design",
        accruedCost: 28700,
        projectedCost: 56400,
        headcount: 1,
      },
    ],
  };
}

export function getDemoIntelligentDocumentProcessing(): IntelligentDocumentProcessing {
  return {
    generatedAt: "2026-03-20T10:30:00.000Z",
    summary: {
      processedDocuments: 3,
      fieldsExtracted: 10,
      reviewQueue: 1,
      ocrReadyFormats: 3,
    },
    documents: [
      {
        id: "processed-offer-letter",
        documentId: "document-offer-letter",
        fileName: "offer-letter.pdf",
        category: "Offer Letter",
        processingStatus: "Processed",
        extractedSummary: "offer-letter.pdf classified for Offer Letter extraction and validation.",
        extractedFields: [
          {
            label: "Document type",
            value: "Offer Letter",
            confidenceScore: 0.94,
          },
          {
            label: "Template",
            value: "Offer Letter",
            confidenceScore: 0.91,
          },
          {
            label: "Review focus",
            value: "Compensation and start date terms",
            confidenceScore: 0.84,
          },
        ],
      },
      {
        id: "processed-tax-form",
        documentId: "document-tax-form",
        fileName: "w4-tax-form.pdf",
        category: "Tax Form",
        processingStatus: "Processed",
        extractedSummary: "w4-tax-form.pdf classified for Tax Form extraction and validation.",
        extractedFields: [
          {
            label: "Document type",
            value: "Tax Form",
            confidenceScore: 0.94,
          },
          {
            label: "Template",
            value: "Tax Form",
            confidenceScore: 0.93,
          },
          {
            label: "Review focus",
            value: "TIN and withholding completeness",
            confidenceScore: 0.82,
          },
        ],
      },
      {
        id: "processed-policy-image",
        documentId: "document-policy-image",
        fileName: "policy-acknowledgement.png",
        category: "Policy",
        processingStatus: "Needs Review",
        extractedSummary: "policy-acknowledgement.png classified for Policy extraction and validation.",
        extractedFields: [
          {
            label: "Document type",
            value: "Policy",
            confidenceScore: 0.9,
          },
          {
            label: "Template",
            value: "Policy Document",
            confidenceScore: 0.9,
          },
          {
            label: "Review focus",
            value: "Acknowledgement and version tracking",
            confidenceScore: 0.79,
          },
          {
            label: "File format",
            value: "image/png",
            confidenceScore: 0.98,
          },
        ],
      },
    ],
  };
}

export function getDemoGlobalPayrollSupport(): GlobalPayrollSupport {
  return {
    generatedAt: "2026-03-20T10:45:00.000Z",
    summary: {
      countries: 2,
      currencies: 2,
      supportedEmployees: 62,
      atRiskRegions: 1,
    },
    regions: [
      {
        id: "entity-india-operations",
        entityName: "Northstar India",
        country: "India",
        currency: "INR",
        payrollFrequency: "Monthly",
        employeeCount: 38,
        complianceStatus: "On Track",
      },
      {
        id: "entity-us-operations",
        entityName: "Northstar US",
        country: "United States",
        currency: "USD",
        payrollFrequency: "Biweekly",
        employeeCount: 24,
        complianceStatus: "Watch",
      },
    ],
    currencies: [
      {
        currency: "INR",
        countries: 1,
        employees: 38,
      },
      {
        currency: "USD",
        countries: 1,
        employees: 24,
      },
    ],
  };
}

export function getDemoAdvancedSchedulingEngine(): AdvancedSchedulingEngine {
  return {
    generatedAt: "2026-03-20T11:00:00.000Z",
    summary: {
      scheduledShifts: 4,
      employeesScheduled: 4,
      strongPreferenceMatches: 3,
      complianceAlerts: 2,
    },
    shifts: [
      {
        id: "schedule-anika-2026-03-20",
        employeeId: "emp_001",
        employeeName: "Anika Raman",
        department: "People",
        shiftDate: "2026-03-20",
        shiftWindow: "09:00-17:30",
        focusArea: "People Ops desk coverage",
        preferenceMatch: "Strong",
        complianceStatus: "Compliant",
        skills: ["Workforce planning", "Approvals coverage"],
        optimizationNote: "Anchored to core hours based on prior on-site work pattern and team handoff needs.",
      },
      {
        id: "schedule-jordan-2026-03-21",
        employeeId: "emp_002",
        employeeName: "Jordan Blake",
        department: "Engineering",
        shiftDate: "2026-03-21",
        shiftWindow: "10:00-18:00",
        focusArea: "Platform support and integrations",
        preferenceMatch: "Strong",
        complianceStatus: "Watch",
        skills: ["Backend systems", "Integrations"],
        optimizationNote: "Remote-first block preserves overlap while keeping overtime drift under review.",
      },
      {
        id: "schedule-priya-2026-03-24",
        employeeId: "emp_003",
        employeeName: "Priya Nair",
        department: "Finance",
        shiftDate: "2026-03-24",
        shiftWindow: "08:30-16:30",
        focusArea: "Payroll close preparation",
        preferenceMatch: "Strong",
        complianceStatus: "Compliant",
        skills: ["Payroll controls", "Reconciliation"],
        optimizationNote: "Earlier finance coverage aligns with historical start times and payroll-close demand.",
      },
      {
        id: "schedule-elena-2026-03-25",
        employeeId: "emp_005",
        employeeName: "Elena Torres",
        department: "People",
        shiftDate: "2026-03-25",
        shiftWindow: "09:30-17:00",
        focusArea: "Hiring coordination and candidate outreach",
        preferenceMatch: "Partial",
        complianceStatus: "Needs Review",
        skills: ["Hiring coordination", "Employee experience"],
        optimizationNote: "Coverage is reserved ahead of upcoming travel, but pending time-away should be confirmed before finalizing.",
      },
    ],
    alerts: [
      {
        id: "schedule-alert-holi",
        title: "Holi blocked for India-based scheduling",
        severity: "Medium",
        detail: "India coverage on 2026-03-14 was excluded from optimization because Holi is marked as an observed holiday.",
        recommendedAction: "Shift India-based coverage to adjacent days or route urgent work to global backup coverage.",
      },
      {
        id: "schedule-alert-jordan-overtime",
        title: "Jordan Blake nearing overtime threshold",
        severity: "Low",
        detail: "Recent approved time entries show overtime during the current pay period.",
        recommendedAction: "Keep Jordan on standard-length coverage blocks until the next pay period resets.",
      },
    ],
  };
}

export function getDemoSentimentAnalysisDashboard(): SentimentAnalysisDashboard {
  return {
    generatedAt: "2026-03-20T11:15:00.000Z",
    summary: {
      signalsAnalyzed: 6,
      positiveSignals: 4,
      watchSignals: 2,
      atRiskSignals: 0,
    },
    themes: [
      {
        id: "sentiment-theme-performance",
        topic: "Performance",
        sentiment: "Positive",
        signalCount: 2,
        summary: "Recent review narratives are constructive, with strong delivery language outweighing calibration friction.",
      },
      {
        id: "sentiment-theme-payroll",
        topic: "Payroll",
        sentiment: "Positive",
        signalCount: 1,
        summary: "Operational messaging points to fewer manual exceptions and smoother payroll execution.",
      },
      {
        id: "sentiment-theme-approvals",
        topic: "Approvals",
        sentiment: "Mixed",
        signalCount: 2,
        summary: "Most approval flows are moving, but a small set remains in review and needs follow-through.",
      },
    ],
    signals: [
      {
        id: "sentiment-review-jordan",
        source: "Performance Review",
        topic: "Performance",
        subject: "Jordan Blake",
        sentiment: "Positive",
        excerpt: "Strong delivery against platform reliability goals with clear ownership on backend modernization.",
        recommendedAction: "Reinforce momentum with concrete growth feedback during the final calibration round.",
      },
      {
        id: "sentiment-review-elena",
        source: "Performance Review",
        topic: "Performance",
        subject: "Elena Torres",
        sentiment: "Mixed",
        excerpt: "New hiring funnel experiments are showing better recruiter response rates, but manager drafting is still in progress.",
        recommendedAction: "Close the draft review quickly so positive hiring signals are translated into clear next steps.",
      },
      {
        id: "sentiment-announcement-payroll",
        source: "Announcement",
        topic: "Payroll",
        subject: "Payroll exception rate dropped below 1%",
        sentiment: "Positive",
        excerpt: "Automated checks on reimbursements and bonuses are clearing with fewer manual interventions.",
        recommendedAction: "Share the improvement with managers and keep the current controls in place.",
      },
      {
        id: "sentiment-announcement-onboarding",
        source: "Announcement",
        topic: "People Ops",
        subject: "Hybrid onboarding playbook was refreshed",
        sentiment: "Positive",
        excerpt: "The new checklist shortens time-to-setup for global hires and syncs with IT handoffs.",
        recommendedAction: "Promote the updated playbook broadly so teams keep using the improved process.",
      },
      {
        id: "sentiment-approval-leave",
        source: "Approval",
        topic: "Approvals",
        subject: "Leave approval queue",
        sentiment: "Mixed",
        excerpt: "A small number of leave and expense approvals are still in review rather than fully cleared.",
        recommendedAction: "Triage aging approvals before they start affecting employee confidence in response times.",
      },
      {
        id: "sentiment-announcement-reviews",
        source: "Announcement",
        topic: "Performance",
        subject: "Q2 compensation review window opens next Monday",
        sentiment: "Positive",
        excerpt: "Managers can finalize performance inputs directly in the workspace before April 8.",
        recommendedAction: "Keep managers on schedule so the review window feels organized rather than last-minute.",
      },
    ],
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
    voiceActivatedHrAssistant: getDemoVoiceActivatedHrAssistant(),
    blockchainPayrollVerification: getDemoBlockchainPayrollVerification(),
    dynamicOrgChartVisualization: getDemoDynamicOrgChartVisualization(),
    automatedJobPostingIntegration: getDemoAutomatedJobPostingIntegration(),
    employeeWellnessDashboard: getDemoEmployeeWellnessDashboard(),
    realTimePayrollCostTracking: getDemoRealTimePayrollCostTracking(),
    intelligentDocumentProcessing: getDemoIntelligentDocumentProcessing(),
    globalPayrollSupport: getDemoGlobalPayrollSupport(),
    advancedSchedulingEngine: getDemoAdvancedSchedulingEngine(),
    sentimentAnalysisDashboard: getDemoSentimentAnalysisDashboard(),
    leaveRequests: demoLeaveRequests.map((request) => ({ ...request })),
    announcements: demoAnnouncements.map((item) => ({ ...item })),
  };
}
