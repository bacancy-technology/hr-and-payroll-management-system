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
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
}
