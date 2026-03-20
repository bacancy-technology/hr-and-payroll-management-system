import type { AutomatedComplianceMonitoring, ComplianceMonitoringSignal } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listComplianceAlerts } from "@/lib/modules/compliance/services/compliance-alert-service";
import { listComplianceRules } from "@/lib/modules/compliance/services/compliance-rule-service";

interface MonitoringRule {
  id: string;
  name: string;
  jurisdiction: string;
  category: string;
  deadlineDate: string;
  status: string;
  notes?: string | null;
}

interface MonitoringAlert {
  id: string;
  ruleId: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  dueDate: string;
}

function daysUntil(date: string, referenceDate: Date) {
  return Math.round((new Date(date).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
}

function buildPolicyUpdate(rule: MonitoringRule) {
  if (rule.category.toLowerCase().includes("payroll tax")) {
    return "Refresh filing checklist, reconciliation controls, and reviewer sign-off steps.";
  }

  if (rule.jurisdiction.toLowerCase().includes("california")) {
    return "Update state-specific wage validation workflow and employee record audit checkpoints.";
  }

  return "Review policy documentation, owner assignments, and deadline reminders for this rule.";
}

function buildImpactAssessment(rule: MonitoringRule, alertsForRule: MonitoringAlert[], daysToDeadline: number) {
  const severitySet = new Set(alertsForRule.map((alert) => alert.severity.toLowerCase()));

  if (severitySet.has("high") || daysToDeadline <= 10) {
    return "Missed action could delay payroll filings or create immediate audit exposure for the affected jurisdiction.";
  }

  if (severitySet.has("medium") || daysToDeadline <= 21) {
    return "Operational delay is likely unless filings, wage validation, and reviewer handoffs are completed on time.";
  }

  return "Current policy coverage looks adequate, but the rule should remain in active monitoring until the deadline passes.";
}

function toMonitoringStatus(
  alertsForRule: MonitoringAlert[],
  daysToDeadline: number,
): ComplianceMonitoringSignal["monitoringStatus"] {
  if (alertsForRule.some((alert) => alert.severity === "High" || alert.status === "Open") || daysToDeadline <= 10) {
    return "Action Required";
  }

  if (alertsForRule.length > 0 || daysToDeadline <= 21) {
    return "Watch";
  }

  return "Stable";
}

function toImpactLevel(
  alertsForRule: MonitoringAlert[],
  daysToDeadline: number,
): ComplianceMonitoringSignal["impactLevel"] {
  if (alertsForRule.some((alert) => alert.severity === "High") || daysToDeadline <= 10) {
    return "High";
  }

  if (alertsForRule.some((alert) => alert.severity === "Medium") || daysToDeadline <= 21) {
    return "Medium";
  }

  return "Low";
}

export function buildAutomatedComplianceMonitoring(input: {
  rules: MonitoringRule[];
  alerts: MonitoringAlert[];
  referenceDate?: Date;
}) {
  const referenceDate = input.referenceDate ?? new Date();
  const signals = input.rules
    .map((rule) => {
      const alertsForRule = input.alerts.filter((alert) => alert.ruleId === rule.id);
      const daysToDeadline = daysUntil(rule.deadlineDate, referenceDate);
      const monitoringStatus = toMonitoringStatus(alertsForRule, daysToDeadline);
      const impactLevel = toImpactLevel(alertsForRule, daysToDeadline);

      return {
        id: `compliance-signal-${rule.id}`,
        ruleId: rule.id,
        ruleName: rule.name,
        jurisdiction: rule.jurisdiction,
        category: rule.category,
        monitoringStatus,
        impactLevel,
        recommendedPolicyUpdate: buildPolicyUpdate(rule),
        impactAssessment: buildImpactAssessment(rule, alertsForRule, daysToDeadline),
        dueDate: rule.deadlineDate,
      } satisfies ComplianceMonitoringSignal;
    })
    .sort((left, right) => {
      const statusRank = { "Action Required": 0, Watch: 1, Stable: 2 } as const;
      const impactRank = { High: 0, Medium: 1, Low: 2 } as const;

      return (
        statusRank[left.monitoringStatus] - statusRank[right.monitoringStatus] ||
        impactRank[left.impactLevel] - impactRank[right.impactLevel] ||
        left.dueDate.localeCompare(right.dueDate)
      );
    });

  return {
    generatedAt: referenceDate.toISOString(),
    summary: {
      monitoredRules: input.rules.length,
      actionRequiredSignals: signals.filter((signal) => signal.monitoringStatus === "Action Required").length,
      upcomingDeadlines: input.rules.filter((rule) => {
        const days = daysUntil(rule.deadlineDate, referenceDate);
        return days >= 0 && days <= 30;
      }).length,
      jurisdictionsImpacted: new Set(signals.map((signal) => signal.jurisdiction)).size,
    },
    signals,
  } satisfies AutomatedComplianceMonitoring;
}

export async function getAutomatedComplianceMonitoring(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [rules, alerts] = await Promise.all([
    listComplianceRules(supabase, organizationId),
    listComplianceAlerts(supabase, organizationId),
  ]);

  return buildAutomatedComplianceMonitoring({
    rules,
    alerts,
  });
}
