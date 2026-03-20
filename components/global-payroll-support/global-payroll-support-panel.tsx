import type { GlobalPayrollSupport } from "@/lib/types";

interface GlobalPayrollSupportPanelProps {
  support: GlobalPayrollSupport;
}

export function GlobalPayrollSupportPanel({ support }: GlobalPayrollSupportPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Global payroll support</h3>
          <p className="panel-subtitle">Multi-country payroll readiness with entity, currency, and compliance coverage views.</p>
        </div>
        <span className="pill">{support.summary.countries} countries supported</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Currencies</span>
          <strong>{support.summary.currencies}</strong>
          <p>Payroll currencies currently represented by active entities.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Employees</span>
          <strong>{support.summary.supportedEmployees}</strong>
          <p>Total workforce covered by global payroll support.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Watch regions</span>
          <strong>{support.summary.atRiskRegions}</strong>
          <p>Regions needing closer compliance or operational attention.</p>
        </div>
      </div>

      <div className="global-payroll-grid">
        {support.regions.map((region) => (
          <div className="global-payroll-card" key={region.id}>
            <div className="split">
              <span className="small-label">{region.country}</span>
              <span className="small-label">{region.complianceStatus}</span>
            </div>
            <strong>{region.entityName}</strong>
            <p>
              {region.employeeCount} employees · {region.currency} · {region.payrollFrequency}
            </p>
          </div>
        ))}
      </div>

      <div className="global-currency-grid">
        {support.currencies.map((currency) => (
          <div className="global-currency-card" key={currency.currency}>
            <span className="small-label">{currency.currency}</span>
            <strong>{currency.employees} employees</strong>
            <p>{currency.countries} region(s) using this currency.</p>
          </div>
        ))}
      </div>
    </article>
  );
}
