import type {
  AdvancedSchedulingEngine,
  SchedulingConstraintAlert,
  SchedulingShiftRecommendation,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listEmployees } from "@/lib/modules/employees/services/employee-service";
import { listPtoRequests } from "@/lib/modules/pto/services/pto-service";
import { listHolidays } from "@/lib/modules/time-tracking/services/holiday-service";
import { listPayPeriods } from "@/lib/modules/time-tracking/services/pay-period-service";
import { listTimeEntries } from "@/lib/modules/time-tracking/services/time-entry-service";

function toIsoDate(value: string) {
  return value.slice(0, 10);
}

function inferCountry(location: string) {
  const normalized = location.toLowerCase();

  if (normalized.includes("bengaluru") || normalized.includes("mumbai") || normalized.includes("india")) {
    return "india";
  }

  if (normalized.includes("singapore")) {
    return "singapore";
  }

  if (normalized.includes("barcelona") || normalized.includes("spain")) {
    return "spain";
  }

  if (normalized.includes("seoul") || normalized.includes("korea")) {
    return "south korea";
  }

  if (normalized.includes("remote")) {
    return "global";
  }

  return normalized;
}

function holidayAppliesToEmployee(
  holiday: Awaited<ReturnType<typeof listHolidays>>[number],
  employee: Awaited<ReturnType<typeof listEmployees>>[number],
) {
  const appliesTo = holiday.appliesTo.toLowerCase();
  const country = inferCountry(employee.location);

  return appliesTo.includes("global") || appliesTo.includes(country);
}

function overlapsDate(startDate: string, endDate: string, targetDate: string) {
  return startDate <= targetDate && endDate >= targetDate;
}

function buildWorkdays(startDate: string, endDate: string, limit: number) {
  const days: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (cursor.getTime() <= end.getTime() && days.length < limit) {
    const weekday = cursor.getUTCDay();

    if (weekday !== 0 && weekday !== 6) {
      days.push(cursor.toISOString().slice(0, 10));
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function selectCurrentPayPeriod(payPeriods: Awaited<ReturnType<typeof listPayPeriods>>, generatedAt: string) {
  const today = toIsoDate(generatedAt);

  return (
    payPeriods.find((period) => period.startDate <= today && period.endDate >= today) ??
    payPeriods.find((period) => period.status === "Open" || period.status === "Scheduled") ??
    payPeriods[0] ??
    null
  );
}

function inferSkills(employee: Awaited<ReturnType<typeof listEmployees>>[number]) {
  const signature = `${employee.role} ${employee.department?.name ?? ""}`.toLowerCase();
  const skills = new Set<string>();

  if (signature.includes("people") || signature.includes("talent")) {
    skills.add("Hiring coordination");
    skills.add("Employee experience");
  }

  if (signature.includes("payroll") || signature.includes("finance")) {
    skills.add("Payroll controls");
    skills.add("Reconciliation");
  }

  if (signature.includes("engineer") || signature.includes("backend")) {
    skills.add("Backend systems");
    skills.add("Integrations");
  }

  if (signature.includes("design")) {
    skills.add("Design reviews");
    skills.add("Cross-functional planning");
  }

  if (signature.includes("vp") || signature.includes("operations")) {
    skills.add("Workforce planning");
    skills.add("Approvals coverage");
  }

  return Array.from(skills).slice(0, 2);
}

function inferShiftWindow(employee: Awaited<ReturnType<typeof listEmployees>>[number], entries: Awaited<ReturnType<typeof listTimeEntries>>) {
  if (employee.location.toLowerCase() === "remote") {
    return {
      shiftWindow: "10:00-18:00",
      preferenceMatch: "Strong" as const,
      focusArea: "Platform support and integrations",
      optimizationNote: "Remote-first block preserves shared overlap while respecting asynchronous work patterns.",
    };
  }

  const employeeEntries = entries.filter((entry) => entry.employee?.id === employee.id && entry.clockInAt);
  const averageStartHour =
    employeeEntries.length === 0
      ? 9
      : employeeEntries.reduce((sum, entry) => {
          const clockInAt = entry.clockInAt as string;
          const date = new Date(clockInAt);

          return sum + date.getUTCHours() + date.getUTCMinutes() / 60;
        }, 0) / employeeEntries.length;

  if (averageStartHour < 9) {
    return {
      shiftWindow: "08:30-16:30",
      preferenceMatch: "Strong" as const,
      focusArea: "Payroll close preparation",
      optimizationNote: "Earlier coverage aligns with recent start times and concentrates specialist work before payroll deadlines.",
    };
  }

  if (averageStartHour > 9.4) {
    return {
      shiftWindow: "09:30-17:00",
      preferenceMatch: "Partial" as const,
      focusArea: "Hiring coordination and candidate outreach",
      optimizationNote: "Shift starts later to reflect recent cadence while preserving midday handoff coverage.",
    };
  }

  return {
    shiftWindow: "09:00-17:30",
    preferenceMatch: "Strong" as const,
    focusArea: "People Ops desk coverage",
    optimizationNote: "Anchored to core hours based on recent working patterns and cross-functional coverage needs.",
  };
}

function buildAlerts(input: {
  employees: Awaited<ReturnType<typeof listEmployees>>;
  ptoRequests: Awaited<ReturnType<typeof listPtoRequests>>;
  holidays: Awaited<ReturnType<typeof listHolidays>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  generatedAt: string;
}) {
  const alerts: SchedulingConstraintAlert[] = [];
  const horizonStart = toIsoDate(input.generatedAt);

  input.holidays.forEach((holiday) => {
    if (holiday.holidayDate >= horizonStart) {
      alerts.push({
        id: `schedule-alert-holiday-${holiday.id}`,
        title: `${holiday.name} blocks localized scheduling`,
        severity: holiday.status === "Observed" ? "Medium" : "Low",
        detail: `${holiday.holidayDate} is marked as ${holiday.status.toLowerCase()} for ${holiday.appliesTo}.`,
        recommendedAction: "Shift affected coverage to adjacent workdays or route work through backup coverage.",
      });
    }
  });

  input.employees.forEach((employee) => {
    if (employee.status === "On Leave") {
      alerts.push({
        id: `schedule-alert-leave-${employee.id}`,
        title: `${employee.fullName} is unavailable for shift planning`,
        severity: "High",
        detail: `${employee.fullName} is currently marked as on leave and should not receive optimized shift coverage.`,
        recommendedAction: "Backfill coverage with adjacent team capacity until the employee returns.",
      });
    }

    const overtimeHours = input.timeEntries
      .filter((entry) => entry.employee?.id === employee.id)
      .reduce((sum, entry) => sum + entry.overtimeHours, 0);

    if (overtimeHours >= 0.75) {
      alerts.push({
        id: `schedule-alert-overtime-${employee.id}`,
        title: `${employee.fullName} nearing overtime threshold`,
        severity: "Low",
        detail: `Recent approved and submitted time entries total ${overtimeHours.toFixed(2)} overtime hours.`,
        recommendedAction: "Favor standard-length blocks until the next scheduling cycle resets.",
      });
    }

    const pendingLeave = input.ptoRequests.find(
      (request) => request.employeeId === employee.id && request.status !== "Approved" && request.endDate >= horizonStart,
    );

    if (pendingLeave) {
      alerts.push({
        id: `schedule-alert-pending-leave-${pendingLeave.id}`,
        title: `${employee.fullName} has leave pending review`,
        severity: "Medium",
        detail: `${pendingLeave.type} is still ${pendingLeave.status.toLowerCase()} for ${pendingLeave.startDate} to ${pendingLeave.endDate}.`,
        recommendedAction: "Confirm approval status before locking any shifts that overlap this window.",
      });
    }
  });

  return alerts.slice(0, 4);
}

export function buildAdvancedSchedulingEngine(input: {
  employees: Awaited<ReturnType<typeof listEmployees>>;
  ptoRequests: Awaited<ReturnType<typeof listPtoRequests>>;
  holidays: Awaited<ReturnType<typeof listHolidays>>;
  payPeriods: Awaited<ReturnType<typeof listPayPeriods>>;
  timeEntries: Awaited<ReturnType<typeof listTimeEntries>>;
  generatedAt?: string;
}) {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const currentPeriod = selectCurrentPayPeriod(input.payPeriods, generatedAt);

  if (!currentPeriod) {
    return {
      generatedAt,
      summary: {
        scheduledShifts: 0,
        employeesScheduled: 0,
        strongPreferenceMatches: 0,
        complianceAlerts: 0,
      },
      shifts: [],
      alerts: [],
    } satisfies AdvancedSchedulingEngine;
  }

  const horizonStart = toIsoDate(generatedAt) < currentPeriod.startDate ? currentPeriod.startDate : toIsoDate(generatedAt);
  const workdays = buildWorkdays(horizonStart, currentPeriod.endDate, 5);
  const alerts = buildAlerts({
    employees: input.employees,
    ptoRequests: input.ptoRequests,
    holidays: input.holidays,
    timeEntries: input.timeEntries,
    generatedAt,
  });

  const shifts: SchedulingShiftRecommendation[] = input.employees
    .filter((employee) => employee.status !== "On Leave")
    .flatMap((employee) => {
      const availableDate = workdays.find((date) => {
        const hasApprovedLeave = input.ptoRequests.some(
          (request) =>
            request.employeeId === employee.id &&
            request.status === "Approved" &&
            overlapsDate(request.startDate, request.endDate, date),
        );
        const blockedByHoliday = input.holidays.some(
          (holiday) => holiday.holidayDate === date && holidayAppliesToEmployee(holiday, employee),
        );

        return !hasApprovedLeave && !blockedByHoliday;
      });

      if (!availableDate) {
        return [];
      }

      const shiftProfile = inferShiftWindow(employee, input.timeEntries);
      const pendingLeaveConflict = input.ptoRequests.some(
        (request) =>
          request.employeeId === employee.id &&
          request.status !== "Approved" &&
          overlapsDate(request.startDate, request.endDate, availableDate),
      );
      const overtimeHours = input.timeEntries
        .filter((entry) => entry.employee?.id === employee.id)
        .reduce((sum, entry) => sum + entry.overtimeHours, 0);
      const complianceStatus = pendingLeaveConflict
        ? "Needs Review"
        : overtimeHours >= 0.75 || employee.status === "In Review"
          ? "Watch"
          : "Compliant";

      return [
        {
          id: `schedule-${employee.id}-${availableDate}`,
          employeeId: employee.id,
          employeeName: employee.fullName,
          department: employee.department?.name ?? "Unassigned",
          shiftDate: availableDate,
          shiftWindow: shiftProfile.shiftWindow,
          focusArea: shiftProfile.focusArea,
          preferenceMatch: pendingLeaveConflict ? "Partial" : shiftProfile.preferenceMatch,
          complianceStatus,
          skills: inferSkills(employee),
          optimizationNote: shiftProfile.optimizationNote,
        } satisfies SchedulingShiftRecommendation,
      ];
    })
    .sort((left, right) => left.shiftDate.localeCompare(right.shiftDate) || left.department.localeCompare(right.department))
    .slice(0, 4);

  return {
    generatedAt,
    summary: {
      scheduledShifts: shifts.length,
      employeesScheduled: new Set(shifts.map((shift) => shift.employeeId)).size,
      strongPreferenceMatches: shifts.filter((shift) => shift.preferenceMatch === "Strong").length,
      complianceAlerts: alerts.length,
    },
    shifts,
    alerts,
  } satisfies AdvancedSchedulingEngine;
}

export async function getAdvancedSchedulingEngine(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [employees, ptoRequests, holidays, payPeriods, timeEntries] = await Promise.all([
    listEmployees(supabase, organizationId),
    listPtoRequests(supabase, organizationId),
    listHolidays(supabase, organizationId),
    listPayPeriods(supabase, organizationId),
    listTimeEntries(supabase, organizationId),
  ]);

  return buildAdvancedSchedulingEngine({
    employees,
    ptoRequests,
    holidays,
    payPeriods,
    timeEntries,
  });
}
