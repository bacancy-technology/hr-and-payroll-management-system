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
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
}
