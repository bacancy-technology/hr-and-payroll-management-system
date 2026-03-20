import { listComplianceAlerts } from "@/lib/modules/compliance/services/compliance-alert-service";
import { listComplianceRules } from "@/lib/modules/compliance/services/compliance-rule-service";
import { listTaxFilings } from "@/lib/modules/compliance/services/tax-filing-service";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";
import { ApiError } from "@/lib/modules/shared/api/errors";
import { listWorkersCompPolicies } from "@/lib/modules/workers-comp/services/workers-comp-policy-service";

interface MultiStateComplianceFilters {
  scope?: string;
}

function normalizeJurisdictionName(value: string) {
  return value.trim().toLowerCase();
}

function inferJurisdictionScope(jurisdiction: string) {
  const normalized = normalizeJurisdictionName(jurisdiction);

  if (normalized === "federal" || normalized.startsWith("federal ")) {
    return "Federal";
  }

  if (
    normalized.includes("county") ||
    normalized.includes("city") ||
    normalized.includes("municipal") ||
    normalized.includes("local")
  ) {
    return "Local";
  }

  return "State";
}

function buildJurisdictionSummary(jurisdiction: string) {
  return {
    jurisdiction,
    scope: inferJurisdictionScope(jurisdiction),
    complianceRules: [] as Awaited<ReturnType<typeof listComplianceRules>>,
    complianceAlerts: [] as Awaited<ReturnType<typeof listComplianceAlerts>>,
    taxFilings: [] as Awaited<ReturnType<typeof listTaxFilings>>,
    workersCompPolicies: [] as Awaited<ReturnType<typeof listWorkersCompPolicies>>,
  };
}

function sortJurisdictions<T extends { jurisdiction: string }>(items: T[]) {
  return items.sort((left, right) => left.jurisdiction.localeCompare(right.jurisdiction));
}

export async function listJurisdictionCompliance(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: MultiStateComplianceFilters = {},
) {
  const [rules, alerts, filings, policies] = await Promise.all([
    listComplianceRules(supabase, organizationId),
    listComplianceAlerts(supabase, organizationId),
    listTaxFilings(supabase, organizationId),
    listWorkersCompPolicies(supabase, organizationId),
  ]);

  const jurisdictionMap = new Map<string, ReturnType<typeof buildJurisdictionSummary>>();

  function getOrCreateJurisdiction(jurisdiction: string) {
    const key = normalizeJurisdictionName(jurisdiction);
    const current = jurisdictionMap.get(key);

    if (current) {
      return current;
    }

    const created = buildJurisdictionSummary(jurisdiction);
    jurisdictionMap.set(key, created);
    return created;
  }

  for (const rule of rules) {
    getOrCreateJurisdiction(rule.jurisdiction).complianceRules.push(rule);
  }

  for (const alert of alerts) {
    if (alert.rule?.jurisdiction) {
      getOrCreateJurisdiction(alert.rule.jurisdiction).complianceAlerts.push(alert);
    }
  }

  for (const filing of filings) {
    getOrCreateJurisdiction(filing.jurisdiction).taxFilings.push(filing);
  }

  for (const policy of policies) {
    for (const state of policy.statesCovered) {
      getOrCreateJurisdiction(state).workersCompPolicies.push(policy);
    }
  }

  let jurisdictions = Array.from(jurisdictionMap.values()).map((entry) => ({
    jurisdiction: entry.jurisdiction,
    scope: entry.scope,
    summary: {
      openRules: entry.complianceRules.filter((rule) => rule.status !== "Closed").length,
      openAlerts: entry.complianceAlerts.filter((alert) => alert.status !== "Resolved").length,
      pendingTaxFilings: entry.taxFilings.filter((filing) => filing.status !== "Filed").length,
      workersCompPolicies: entry.workersCompPolicies.length,
    },
    complianceRules: entry.complianceRules.sort(
      (left, right) =>
        left.deadlineDate.localeCompare(right.deadlineDate) || left.name.localeCompare(right.name),
    ),
    complianceAlerts: entry.complianceAlerts.sort(
      (left, right) => left.dueDate.localeCompare(right.dueDate) || left.title.localeCompare(right.title),
    ),
    taxFilings: entry.taxFilings.sort(
      (left, right) => left.dueDate.localeCompare(right.dueDate) || left.filingName.localeCompare(right.filingName),
    ),
    workersCompPolicies: entry.workersCompPolicies.sort(
      (left, right) =>
        left.coverageEndDate.localeCompare(right.coverageEndDate) ||
        left.policyName.localeCompare(right.policyName),
    ),
  }));

  if (filters.scope) {
    jurisdictions = jurisdictions.filter(
      (entry) =>
        normalizeJurisdictionName(entry.scope) === normalizeJurisdictionName(filters.scope ?? ""),
    );
  }

  return sortJurisdictions(jurisdictions);
}

export async function getJurisdictionComplianceByName(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  jurisdiction: string,
) {
  const jurisdictions = await listJurisdictionCompliance(supabase, organizationId);
  const normalizedJurisdiction = normalizeJurisdictionName(jurisdiction);
  const match = jurisdictions.find(
    (entry) => normalizeJurisdictionName(entry.jurisdiction) === normalizedJurisdiction,
  );

  if (!match) {
    throw new ApiError(404, "Jurisdiction compliance profile not found.");
  }

  return match;
}

export async function getMultiStateComplianceOverview(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
  filters: MultiStateComplianceFilters = {},
) {
  const jurisdictions = await listJurisdictionCompliance(supabase, organizationId, filters);

  return {
    summary: {
      jurisdictions: jurisdictions.length,
      states: jurisdictions.filter((entry) => entry.scope === "State").length,
      localities: jurisdictions.filter((entry) => entry.scope === "Local").length,
      federalJurisdictions: jurisdictions.filter((entry) => entry.scope === "Federal").length,
      openRules: jurisdictions.reduce((sum, entry) => sum + entry.summary.openRules, 0),
      openAlerts: jurisdictions.reduce((sum, entry) => sum + entry.summary.openAlerts, 0),
      pendingTaxFilings: jurisdictions.reduce((sum, entry) => sum + entry.summary.pendingTaxFilings, 0),
    },
    jurisdictions,
  };
}
