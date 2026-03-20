import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "@/app/workspace/admin/page";
import AnalyticsPage from "@/app/workspace/analytics/page";
import CompliancePage from "@/app/workspace/compliance/page";
import OperationsPage from "@/app/workspace/operations/page";
import WorkspaceOverviewPage from "@/app/workspace/page";
import PayrollPage from "@/app/workspace/payroll/page";
import SelfServicePage from "@/app/workspace/self-service/page";
import WorkforcePage from "@/app/workspace/workforce/page";

vi.mock("@/lib/data", () => ({
  getDashboardData: vi.fn(),
}));

import { getDashboardData } from "@/lib/data";

describe("workspace frontend pages", () => {
  beforeEach(() => {
    vi.mocked(getDashboardData).mockResolvedValue(getDemoDashboardData());
  });

  it("renders the workspace overview navigation and summary cards", async () => {
    const markup = renderMarkup(await WorkspaceOverviewPage());

    expect(markup).toContain("Workspace Overview");
    expect(markup).toContain("Workforce");
    expect(markup).toContain("Self-Service");
  });

  it("renders the workforce page sections", () => {
    const markup = renderMarkup(<WorkforcePage />);

    expect(markup).toContain("People Directory");
    expect(markup).toContain("Contractor Operations");
    expect(markup).toContain("Performance Cycles");
  });

  it("renders the payroll page sections and action surfaces", async () => {
    const markup = renderMarkup(await PayrollPage());

    expect(markup).toContain("Payroll Actions");
    expect(markup).toContain("Clock Actions");
    expect(markup).toContain("Global Readiness");
  });

  it("renders the operations page sections and approval/integration actions", async () => {
    const markup = renderMarkup(await OperationsPage());

    expect(markup).toContain("Spend Controls");
    expect(markup).toContain("Approval Decisions");
    expect(markup).toContain("Integration Sync");
  });

  it("renders the compliance page sections", async () => {
    const markup = renderMarkup(await CompliancePage());

    expect(markup).toContain("Policy Controls");
    expect(markup).toContain("Filing Calendar");
    expect(markup).toContain("Workers&#x27; Compensation");
  });

  it("renders the analytics page sections and report panels", async () => {
    const markup = renderMarkup(await AnalyticsPage());

    expect(markup).toContain("Operational Reports");
    expect(markup).toContain("Payroll Report");
    expect(markup).toContain("Org Visibility");
  });

  it("renders the admin page sections", () => {
    const markup = renderMarkup(<AdminPage />);

    expect(markup).toContain("Company Structure");
    expect(markup).toContain("Department Ownership");
    expect(markup).toContain("Role Assignments");
  });

  it("renders the self-service page sections and employee actions", async () => {
    const markup = renderMarkup(await SelfServicePage());

    expect(markup).toContain("Profile Settings");
    expect(markup).toContain("Paystubs");
    expect(markup).toContain("PTO Management");
    expect(markup).toContain("Voice Assistant");
  });
});
