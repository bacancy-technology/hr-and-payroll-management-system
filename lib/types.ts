export type AppMode = "demo" | "live" | "hybrid";

export interface SummaryMetric {
  label: string;
  value: string;
  detail: string;
}

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: string;
  status: string;
  location: string;
  salary: number;
  startDate: string;
  managerName: string;
  nextReviewAt: string;
}

export interface PayrollRun {
  id: string;
  periodLabel: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalAmount: number;
  varianceNote: string;
}

export interface PayrollAnomalyMetric {
  label: string;
  observed: number;
  expected: number;
  deltaPercent: number;
}

export interface PayrollAnomaly {
  id: string;
  payrollRunId: string;
  payrollRunLabel: string;
  payDate: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  confidenceScore: number;
  subject: string;
  summary: string;
  detail: string;
  recommendedAction: string;
  metrics: PayrollAnomalyMetric[];
}

export interface PredictiveTurnoverRisk {
  employeeId: string;
  employeeName: string;
  department: string;
  riskLevel: "Watch" | "Elevated" | "Critical";
  riskScore: number;
  drivers: string[];
}

export interface HiringWindowRecommendation {
  id: string;
  department: string;
  recommendedWindow: string;
  confidenceScore: number;
  rationale: string;
}

export interface CompensationBenchmarkInsight {
  id: string;
  department: string;
  averageSalary: number;
  benchmarkSalary: number;
  gapPercent: number;
  position: "Below" | "Aligned" | "Above";
}

export interface PredictiveWorkforceAnalytics {
  generatedAt: string;
  summary: {
    monitoredEmployees: number;
    highRiskEmployees: number;
    recommendedHiringWindows: number;
    departmentsBelowBenchmark: number;
  };
  turnoverRisk: PredictiveTurnoverRisk[];
  hiringWindows: HiringWindowRecommendation[];
  compensationBenchmarks: CompensationBenchmarkInsight[];
}

export interface BenefitsRecommendation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  recommendedPlanId: string;
  recommendedPlanName: string;
  category: string;
  priority: "Consider" | "Recommended" | "Priority";
  confidenceScore: number;
  rationale: string;
  lifeEvents: string[];
}

export interface SmartBenefitsRecommendations {
  generatedAt: string;
  summary: {
    employeesEvaluated: number;
    recommendationsGenerated: number;
    mostRecommendedCategory: string;
  };
  recommendations: BenefitsRecommendation[];
}

export interface ComplianceMonitoringSignal {
  id: string;
  ruleId: string;
  ruleName: string;
  jurisdiction: string;
  category: string;
  monitoringStatus: "Stable" | "Watch" | "Action Required";
  impactLevel: "Low" | "Medium" | "High";
  recommendedPolicyUpdate: string;
  impactAssessment: string;
  dueDate: string;
}

export interface AutomatedComplianceMonitoring {
  generatedAt: string;
  summary: {
    monitoredRules: number;
    actionRequiredSignals: number;
    upcomingDeadlines: number;
    jurisdictionsImpacted: number;
  };
  signals: ComplianceMonitoringSignal[];
}

export interface VoiceAssistantSampleCommand {
  prompt: string;
  intent: string;
}

export interface VoiceAssistantCommandResult {
  id: string;
  transcript: string;
  intent: "pto_balance" | "submit_pto_request" | "payroll_summary" | "help";
  response: string;
  actionTaken: string;
}

export interface VoiceActivatedHrAssistant {
  generatedAt: string;
  summary: {
    supportedCommands: number;
    automationReadyActions: number;
  };
  sampleCommands: VoiceAssistantSampleCommand[];
  recentResult: VoiceAssistantCommandResult;
}

export interface PayrollVerificationBlock {
  id: string;
  payrollRunId: string;
  payrollRunLabel: string;
  payDate: string;
  status: string;
  verificationStatus: "Pending" | "Verified" | "Anchored";
  previousHash: string;
  payloadHash: string;
  blockHash: string;
  recordCount: number;
}

export interface BlockchainPayrollVerification {
  generatedAt: string;
  summary: {
    verifiedRuns: number;
    anchoredRuns: number;
    immutableRecords: number;
    chainLength: number;
  };
  blocks: PayrollVerificationBlock[];
}

export interface OrgChartNode {
  id: string;
  fullName: string;
  role: string;
  departmentName: string;
  managerName: string;
  level: number;
  directReportCount: number;
}

export interface OrgChartLink {
  sourceEmployeeId: string;
  targetEmployeeId: string;
}

export interface DynamicOrgChartVisualization {
  generatedAt: string;
  summary: {
    people: number;
    rootLeaders: number;
    reportingLinks: number;
    departments: number;
  };
  nodes: OrgChartNode[];
  links: OrgChartLink[];
}

export interface JobBoardConnection {
  id: string;
  provider: string;
  displayName: string;
  status: string;
  lastSyncedAt: string | null;
  postedJobs: number;
  applicationsTracked: number;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  employmentType: string;
  status: "Draft" | "Posted" | "Syncing";
  targetBoards: string[];
  applications: number;
  source: string;
}

export interface AutomatedJobPostingIntegration {
  generatedAt: string;
  summary: {
    connectedBoards: number;
    activePostings: number;
    trackedApplications: number;
    syncedBoards: number;
  };
  boards: JobBoardConnection[];
  postings: JobPosting[];
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  approverName: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  label: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizationName: string;
  avatarLabel: string;
}

export interface DashboardData {
  mode: AppMode;
  notice: string;
  profile: UserProfile;
  summary: SummaryMetric[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payrollAnomalies: PayrollAnomaly[];
  predictiveWorkforceAnalytics: PredictiveWorkforceAnalytics;
  smartBenefitsRecommendations: SmartBenefitsRecommendations;
  automatedComplianceMonitoring: AutomatedComplianceMonitoring;
  voiceActivatedHrAssistant: VoiceActivatedHrAssistant;
  blockchainPayrollVerification: BlockchainPayrollVerification;
  dynamicOrgChartVisualization: DynamicOrgChartVisualization;
  automatedJobPostingIntegration: AutomatedJobPostingIntegration;
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
}
