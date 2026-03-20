import { redirect } from "next/navigation";

import {
  getDemoDashboardData,
  buildSummaryMetrics,
  getDemoPredictiveWorkforceAnalytics,
  getDemoSmartBenefitsRecommendations,
} from "@/lib/demo-data";
import { env } from "@/lib/env";
import { listPayrollAnomalies } from "@/lib/modules/payroll-anomaly-detection/services/payroll-anomaly-detection-service";
import { getPredictiveWorkforceAnalytics } from "@/lib/modules/predictive-workforce-analytics/services/predictive-workforce-analytics-service";
import { getSmartBenefitsRecommendations } from "@/lib/modules/smart-benefits-recommendations/services/smart-benefits-recommendations-service";
import { createServerClient } from "@/lib/supabase/server";
import type { DashboardData, Employee, LeaveRequest, PayrollRun, UserProfile } from "@/lib/types";
import { initialsFromName } from "@/lib/utils";

interface DashboardOptions {
  preview?: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  organization_id: string | null;
}

interface OrganizationRow {
  name: string | null;
}

interface EmployeeRow {
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
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
}

interface PayrollRow {
  id: string;
  period_label: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_amount: number;
  variance_note: string;
}

interface LeaveRequestRow {
  id: string;
  seed_key: string | null;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  approver_name: string;
}

interface AnnouncementRow {
  id: string;
  seed_key: string | null;
  title: string;
  body: string;
  label: string;
  display_order: number;
}

function mapProfile(row: ProfileRow | null, organizationName: string | null, fallback: { id: string; email?: string | null; fullName?: string | null }): UserProfile {
  const fullName = row?.full_name || fallback.fullName || "Workspace Admin";
  const email = row?.email || fallback.email || "team@pulsehr.app";

  return {
    id: row?.id || fallback.id,
    fullName,
    email,
    role: row?.role || "HR Admin",
    organizationName: organizationName || "Northstar People Ops",
    avatarLabel: initialsFromName(fullName),
  };
}

function mapEmployees(rows: EmployeeRow[] | null): Employee[] {
  return (rows ?? []).map((row) => {
    const departmentName = Array.isArray(row.departments)
      ? row.departments[0]?.name ?? "Unassigned"
      : row.departments?.name ?? "Unassigned";

    return {
      id: row.id,
      fullName: row.full_name,
      role: row.role,
      department: departmentName,
      status: row.status,
      location: row.location,
      salary: row.salary,
      startDate: row.start_date,
      managerName: row.manager_name,
      nextReviewAt: row.next_review_at,
    };
  });
}

function mapPayrollRuns(rows: PayrollRow[] | null): PayrollRun[] {
  return (rows ?? []).map((row) => ({
    id: row.id,
    periodLabel: row.period_label,
    payDate: row.pay_date,
    status: row.status,
    employeeCount: row.employee_count,
    totalAmount: row.total_amount,
    varianceNote: row.variance_note,
  }));
}

function mapLeaveRequests(rows: LeaveRequestRow[] | null): LeaveRequest[] {
  return (rows ?? []).map((row) => ({
    id: row.id,
    employeeName: row.employee_name,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    status: row.status,
    approverName: row.approver_name,
  }));
}

function mapAnnouncements(rows: AnnouncementRow[] | null) {
  return (rows ?? []).map((row) => ({
    id: row.seed_key || row.id,
    title: row.title,
    body: row.body,
    label: row.label,
  }));
}

export async function getDashboardData(options: DashboardOptions = {}): Promise<DashboardData> {
  if (!env.hasSupabase) {
    return getDemoDashboardData();
  }

  const supabase = await createServerClient();

  if (!supabase) {
    return getDemoDashboardData();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (options.preview) {
      return getDemoDashboardData(
        undefined,
        "Previewing starter data. Sign in after connecting Supabase to access the live workspace.",
      );
    }

    redirect("/login");
  }

  const [profileResult, employeesResult, payrollResult, leaveResult, announcementsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, organization_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("employees")
      .select(
        "id, full_name, email, role, status, location, salary, start_date, manager_name, next_review_at, departments(name)",
      )
      .order("start_date", { ascending: false })
      .limit(6),
    supabase
      .from("payroll_runs")
      .select("id, period_label, pay_date, status, employee_count, total_amount, variance_note")
      .order("pay_date", { ascending: false })
      .limit(3),
    supabase
      .from("leave_requests")
      .select("id, seed_key, employee_name, type, start_date, end_date, days, status, approver_name")
      .order("start_date", { ascending: true })
      .limit(4),
    supabase
      .from("announcements")
      .select("id, seed_key, title, body, label, display_order")
      .order("display_order", { ascending: true })
      .limit(3),
  ]);

  const organizationId = profileResult.data?.organization_id;
  const organizationResult = organizationId
    ? await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle()
    : { data: null, error: null };

  const payrollAnomalies = organizationId ? await listPayrollAnomalies(supabase, organizationId, 3).catch(() => []) : [];
  const predictiveWorkforceAnalytics = organizationId
    ? await getPredictiveWorkforceAnalytics(supabase, organizationId).catch(() => getDemoPredictiveWorkforceAnalytics())
    : getDemoPredictiveWorkforceAnalytics();
  const smartBenefitsRecommendations = organizationId
    ? await getSmartBenefitsRecommendations(supabase, organizationId).catch(() => getDemoSmartBenefitsRecommendations())
    : getDemoSmartBenefitsRecommendations();

  const queryFailed =
    Boolean(profileResult.error) ||
    Boolean(employeesResult.error) ||
    Boolean(payrollResult.error) ||
    Boolean(leaveResult.error) ||
    Boolean(announcementsResult.error) ||
    Boolean(organizationResult.error);

  const employees = mapEmployees((employeesResult.data ?? null) as EmployeeRow[] | null);
  const payrollRuns = mapPayrollRuns((payrollResult.data ?? null) as PayrollRow[] | null);
  const leaveRequests = mapLeaveRequests((leaveResult.data ?? null) as LeaveRequestRow[] | null);
  const announcements = mapAnnouncements((announcementsResult.data ?? null) as AnnouncementRow[] | null);

  if (
    queryFailed ||
    (employees.length === 0 && payrollRuns.length === 0 && leaveRequests.length === 0 && announcements.length === 0)
  ) {
    return {
      ...getDemoDashboardData(
        {
          id: user.id,
          fullName:
            ((profileResult.data as ProfileRow | null)?.full_name ||
              user.user_metadata.full_name ||
              user.email?.split("@")[0] ||
              "Workspace Admin") as string,
          email: user.email ?? "team@pulsehr.app",
          role: (profileResult.data as ProfileRow | null)?.role || "HR Admin",
          organizationName: ((organizationResult.data as OrganizationRow | null)?.name || "Northstar People Ops") as string,
        },
        queryFailed
          ? "Supabase is connected, but the dashboard could not fetch live records. Starter demo data is shown as a safe fallback."
          : "Supabase is connected. Run the seed SQL to replace the starter preview with live records.",
      ),
      mode: "hybrid",
    };
  }

  const profile = mapProfile(profileResult.data as ProfileRow | null, (organizationResult.data as OrganizationRow | null)?.name ?? null, {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata.full_name,
  });

  return {
    mode: "live",
    notice: "Connected to Supabase. The workspace is rendering live records from your project.",
    profile,
    summary: buildSummaryMetrics(employees, payrollRuns, leaveRequests),
    employees,
    payrollRuns,
    payrollAnomalies,
    predictiveWorkforceAnalytics,
    smartBenefitsRecommendations,
    leaveRequests,
    announcements,
  };
}
