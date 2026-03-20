import type { GlobalPayrollCurrency, GlobalPayrollRegion, GlobalPayrollSupport } from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listComplianceRules } from "@/lib/modules/compliance/services/compliance-rule-service";
import { listCompanyEntities } from "@/lib/modules/multi-company-support/services/company-entity-service";

function inferCountry(entity: Awaited<ReturnType<typeof listCompanyEntities>>[number]) {
  const composite = `${entity.name} ${entity.legalName} ${entity.headquarters} ${entity.registrationState}`.toLowerCase();

  if (composite.includes("india") || composite.includes("bengaluru") || composite.includes("mumbai")) {
    return "India";
  }

  if (composite.includes("us") || composite.includes("united states") || composite.includes("california") || composite.includes("san francisco")) {
    return "United States";
  }

  if (composite.includes("singapore")) {
    return "Singapore";
  }

  return "Global";
}

function inferCurrency(country: string) {
  if (country === "India") {
    return "INR";
  }

  if (country === "Singapore") {
    return "SGD";
  }

  return "USD";
}

function buildComplianceStatus(
  entity: Awaited<ReturnType<typeof listCompanyEntities>>[number],
  complianceRules: Awaited<ReturnType<typeof listComplianceRules>>,
): GlobalPayrollRegion["complianceStatus"] {
  const country = inferCountry(entity);
  const relevantRules = complianceRules.filter((rule) => {
    const jurisdiction = rule.jurisdiction.toLowerCase();

    if (country === "India") {
      return jurisdiction.includes("india");
    }

    if (country === "United States") {
      return jurisdiction.includes("united states") || jurisdiction.includes("federal") || jurisdiction.includes("california");
    }

    return false;
  });

  if (relevantRules.some((rule) => rule.status !== "Closed")) {
    return relevantRules.some((rule) => rule.deadlineDate <= "2026-04-30") ? "Watch" : "On Track";
  }

  return entity.status === "Active" ? "On Track" : "At Risk";
}

export function buildGlobalPayrollSupport(input: {
  entities: Awaited<ReturnType<typeof listCompanyEntities>>;
  complianceRules: Awaited<ReturnType<typeof listComplianceRules>>;
  generatedAt?: string;
}) {
  const regions = input.entities.map((entity) => {
    const country = inferCountry(entity);

    return {
      id: entity.id,
      entityName: entity.name,
      country,
      currency: inferCurrency(country),
      payrollFrequency: entity.payrollFrequency,
      employeeCount: entity.employeeCount,
      complianceStatus: buildComplianceStatus(entity, input.complianceRules),
    } satisfies GlobalPayrollRegion;
  });

  const currencies = Object.values(
    regions.reduce<Record<string, GlobalPayrollCurrency>>((accumulator, region) => {
      const current = accumulator[region.currency] ?? {
        currency: region.currency,
        countries: 0,
        employees: 0,
      };

      accumulator[region.currency] = {
        currency: region.currency,
        countries: current.countries + 1,
        employees: current.employees + region.employeeCount,
      };

      return accumulator;
    }, {}),
  ).sort((left, right) => left.currency.localeCompare(right.currency));

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      countries: new Set(regions.map((region) => region.country)).size,
      currencies: currencies.length,
      supportedEmployees: regions.reduce((sum, region) => sum + region.employeeCount, 0),
      atRiskRegions: regions.filter((region) => region.complianceStatus !== "On Track").length,
    },
    regions,
    currencies,
  } satisfies GlobalPayrollSupport;
}

export async function getGlobalPayrollSupport(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [entities, complianceRules] = await Promise.all([
    listCompanyEntities(supabase, organizationId),
    listComplianceRules(supabase, organizationId),
  ]);

  return buildGlobalPayrollSupport({
    entities,
    complianceRules,
  });
}
