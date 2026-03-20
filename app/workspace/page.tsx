import Link from "next/link";

import { AnalyticsOverviewPanel } from "@/components/reporting/analytics-overview-panel";
import { BackupRecoveryOverviewPanel } from "@/components/backup-recovery/backup-recovery-overview-panel";
import { DirectoryOverviewPanel } from "@/components/directory/directory-overview-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { getDashboardData } from "@/lib/data";

const WORKSPACE_SECTIONS = [
  {
    href: "/workspace/workforce",
    title: "Workforce",
    description: "Employees, contractors, PTO, onboarding, and performance workflows.",
  },
  {
    href: "/workspace/payroll",
    title: "Payroll",
    description: "Runs, time tracking, payroll intelligence, and scheduling readiness.",
  },
  {
    href: "/workspace/operations",
    title: "Operations",
    description: "Benefits, expenses, documents, approvals, integrations, and automations.",
  },
  {
    href: "/workspace/compliance",
    title: "Compliance",
    description: "Rules, alerts, filings, workers' compensation, and multi-state coverage.",
  },
  {
    href: "/workspace/analytics",
    title: "Analytics",
    description: "Predictive workforce planning, sentiment, and reporting views.",
  },
  {
    href: "/workspace/admin",
    title: "Admin",
    description: "Company settings, departments, roles, and entity structure.",
  },
  {
    href: "/workspace/self-service",
    title: "Self-Service",
    description: "Employee-facing profile, pay, PTO, and voice assistant surfaces.",
  },
];

export default async function WorkspaceOverviewPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Workspace Overview"
        title="Frontend coverage for the full operations stack."
        description="Use the section pages to manage the backend modules through frontend screens grouped by how HR, payroll, and finance teams actually work."
      />

      <section className="metrics-grid">
        {data.summary.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span className="small-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="workspace-link-grid">
        {WORKSPACE_SECTIONS.map((section) => (
          <Link className="feature-card workspace-link-card" href={section.href} key={section.href}>
            <strong>{section.title}</strong>
            <p>{section.description}</p>
          </Link>
        ))}
      </section>

      <section className="workspace-section-grid">
        <DirectoryOverviewPanel />
        <AnalyticsOverviewPanel />
        <BackupRecoveryOverviewPanel />
      </section>
    </>
  );
}
