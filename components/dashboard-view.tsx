import type { DashboardData } from "@/lib/types";
import { formatCurrency, formatDate, toStatusClass } from "@/lib/utils";
import { PayrollAnomalyPanel } from "@/components/payroll-anomaly-detection/payroll-anomaly-panel";
import { PredictiveWorkforcePanel } from "@/components/predictive-workforce-analytics/predictive-workforce-panel";
import { BenefitsRecommendationsPanel } from "@/components/smart-benefits-recommendations/benefits-recommendations-panel";
import { ComplianceMonitoringPanel } from "@/components/automated-compliance-monitoring/compliance-monitoring-panel";
import { VoiceAssistantPanel } from "@/components/voice-activated-hr-assistant/voice-assistant-panel";
import { BlockchainPayrollPanel } from "@/components/blockchain-payroll-verification/blockchain-payroll-panel";
import { OrgChartPanel } from "@/components/dynamic-org-chart-visualization/org-chart-panel";
import { JobPostingPanel } from "@/components/automated-job-posting-integration/job-posting-panel";
import { WellnessDashboardPanel } from "@/components/employee-wellness-dashboard/wellness-dashboard-panel";
import { PayrollCostTrackingPanel } from "@/components/real-time-payroll-cost-tracking/payroll-cost-tracking-panel";
import { IntelligentDocumentProcessingPanel } from "@/components/intelligent-document-processing/intelligent-document-processing-panel";
import { GlobalPayrollSupportPanel } from "@/components/global-payroll-support/global-payroll-support-panel";

interface DashboardViewProps {
  data: DashboardData;
  preview?: boolean;
}

export function DashboardView({ data, preview = false }: DashboardViewProps) {
  return (
    <div className="page-shell" id="workspace">
      <section className="notice" aria-live="polite">
        <div>
          <strong>{data.mode === "live" ? "Live workspace" : data.mode === "hybrid" ? "Live-ready preview" : "Demo workspace"}</strong>
          <p className="muted">{data.notice}</p>
        </div>
        <span className="pill">{data.profile.organizationName}</span>
      </section>

      <section className="section-heading">
        <div className="page-title">
          <span className="eyebrow">{preview ? "Workspace preview" : "Operations dashboard"}</span>
          <h1>{preview ? "See the product before setup is finished." : `Welcome back, ${data.profile.fullName.split(" ")[0]}.`}</h1>
          <p className="lead">
            {preview
              ? "The dashboard ships with believable HR and payroll starter content, then upgrades itself to live Supabase data after configuration."
              : "Track payroll readiness, workforce changes, and approvals from a single responsive workspace."}
          </p>
        </div>
      </section>

      <section className="metrics-grid">
        {data.summary.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span className="small-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-top">
            <div>
              <h3>Team roster</h3>
              <p className="panel-subtitle">Employees, managers, locations, and next review dates.</p>
            </div>
            <span className="pill">{data.employees.length} tracked people</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Next review</th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <span className="table-primary">{employee.fullName}</span>
                      <span className="muted">
                        {employee.role} · {employee.managerName}
                      </span>
                    </td>
                    <td>{employee.department}</td>
                    <td>
                      <span className={toStatusClass(employee.status)}>{employee.status}</span>
                    </td>
                    <td>{employee.location}</td>
                    <td>{formatCurrency(employee.salary)}</td>
                    <td>{formatDate(employee.nextReviewAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="stack">
          <article className="panel">
            <div className="panel-top">
              <div>
                <h3>Payroll runs</h3>
                <p className="panel-subtitle">Recent cycles and readiness signals.</p>
              </div>
            </div>
            <div className="stack">
              {data.payrollRuns.map((run) => (
                <div className="announcement-item" key={run.id}>
                  <div className="split">
                    <strong>{run.periodLabel}</strong>
                    <span className={toStatusClass(run.status)}>{run.status}</span>
                  </div>
                  <p>
                    {formatCurrency(run.totalAmount)} for {run.employeeCount} teammates, paid on {formatDate(run.payDate)}.
                  </p>
                  <span className="muted">{run.varianceNote}</span>
                </div>
              ))}
            </div>
          </article>

          <PayrollAnomalyPanel anomalies={data.payrollAnomalies} />

          <article className="panel">
            <div className="panel-top">
              <div>
                <h3>Announcements</h3>
                <p className="panel-subtitle">Operational notes surfaced for People and Finance.</p>
              </div>
            </div>
            <div className="stack">
              {data.announcements.map((item) => (
                <div className="announcement-item" key={item.id}>
                  <span className="small-label">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-top">
          <div>
            <h3>Leave approvals</h3>
            <p className="panel-subtitle">Track upcoming absences and approval owners.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Approver</th>
              </tr>
            </thead>
            <tbody>
              {data.leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employeeName}</td>
                  <td>{request.type}</td>
                  <td>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </td>
                  <td>{request.days}</td>
                  <td>
                    <span className={toStatusClass(request.status)}>{request.status}</span>
                  </td>
                  <td>{request.approverName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PredictiveWorkforcePanel analytics={data.predictiveWorkforceAnalytics} />

      <BenefitsRecommendationsPanel recommendations={data.smartBenefitsRecommendations} />

      <ComplianceMonitoringPanel monitoring={data.automatedComplianceMonitoring} />

      <VoiceAssistantPanel assistant={data.voiceActivatedHrAssistant} />

      <BlockchainPayrollPanel verification={data.blockchainPayrollVerification} />

      <OrgChartPanel orgChart={data.dynamicOrgChartVisualization} />

      <JobPostingPanel integration={data.automatedJobPostingIntegration} />

      <WellnessDashboardPanel dashboard={data.employeeWellnessDashboard} />

      <PayrollCostTrackingPanel tracking={data.realTimePayrollCostTracking} />

      <IntelligentDocumentProcessingPanel processing={data.intelligentDocumentProcessing} />

      <GlobalPayrollSupportPanel support={data.globalPayrollSupport} />
    </div>
  );
}
