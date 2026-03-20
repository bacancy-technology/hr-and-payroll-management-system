import { AdvancedSchedulingEnginePanel } from "@/components/advanced-scheduling-engine/advanced-scheduling-engine-panel";
import { BlockchainPayrollPanel } from "@/components/blockchain-payroll-verification/blockchain-payroll-panel";
import { DirectDepositSetupPanel } from "@/components/direct-deposit/direct-deposit-setup-panel";
import { BankAccountsTablePanel } from "@/components/direct-deposit/bank-accounts-table-panel";
import { GlobalPayrollSupportPanel } from "@/components/global-payroll-support/global-payroll-support-panel";
import { PayrollAnomalyPanel } from "@/components/payroll-anomaly-detection/payroll-anomaly-panel";
import { PayrollRunActionsPanel } from "@/components/payroll/payroll-run-actions-panel";
import { PayrollRunsTablePanel } from "@/components/payroll/payroll-runs-table-panel";
import { PayrollCostTrackingPanel } from "@/components/real-time-payroll-cost-tracking/payroll-cost-tracking-panel";
import { HolidaysTablePanel } from "@/components/time-tracking/holidays-table-panel";
import { TimeClockPanel } from "@/components/time-tracking/time-clock-panel";
import { PayPeriodsTablePanel } from "@/components/time-tracking/pay-periods-table-panel";
import { TimeEntriesTablePanel } from "@/components/time-tracking/time-entries-table-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";
import { getDashboardData } from "@/lib/data";

const PAYROLL_SECTIONS = [
  {
    id: "payroll-cycle",
    title: "Payroll Cycle",
    description: "Runs, periods, and banking setup for current payroll execution.",
  },
  {
    id: "payroll-actions",
    title: "Payroll Actions",
    description: "Calculate, approve, and finalize runs from the frontend workspace.",
  },
  {
    id: "time-inputs",
    title: "Time Inputs",
    description: "Operational time data and holiday controls that feed payroll.",
  },
  {
    id: "clock-actions",
    title: "Clock Actions",
    description: "Clock-in and clock-out flows for operational time tracking.",
  },
  {
    id: "payroll-controls",
    title: "Payroll Controls",
    description: "Live anomaly, cost, and verification intelligence for each cycle.",
  },
  {
    id: "global-readiness",
    title: "Global Readiness",
    description: "Cross-border payroll support and scheduling optimization signals.",
  },
];

export default async function PayrollPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Payroll"
        title="Operate payroll from cycle planning to payment controls."
        description="The payroll frontend brings together runs, tracking inputs, disbursement setup, global readiness, anomaly detection, verification, and schedule intelligence."
      />

      <WorkspaceSectionMap items={PAYROLL_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Run payroll cycles with the current run list, pay period calendar, and direct deposit configuration in one place."
          id="payroll-cycle"
          title="Payroll Cycle"
        >
          <PayrollRunsTablePanel />
          <PayPeriodsTablePanel />
          <BankAccountsTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Run the approval lifecycle on payroll cycles without dropping into raw API calls."
          id="payroll-actions"
          title="Payroll Actions"
        >
          <PayrollRunActionsPanel />
          <DirectDepositSetupPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Keep the working inputs that drive pay calculations visible before finalization."
          id="time-inputs"
          title="Time Inputs"
        >
          <TimeEntriesTablePanel />
          <HolidaysTablePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Support shift start and end workflows directly from the payroll and time operations surface."
          id="clock-actions"
          title="Clock Actions"
        >
          <TimeClockPanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Use the intelligence layers to identify risk, track current cost exposure, and verify payout integrity."
          id="payroll-controls"
          title="Payroll Controls"
        >
          <PayrollAnomalyPanel anomalies={data.payrollAnomalies} />
          <PayrollCostTrackingPanel tracking={data.realTimePayrollCostTracking} />
          <BlockchainPayrollPanel verification={data.blockchainPayrollVerification} />
        </WorkspaceSection>

        <WorkspaceSection
          description="Pair international payroll coverage with staffing optimization before the cycle is locked."
          id="global-readiness"
          title="Global Readiness"
        >
          <GlobalPayrollSupportPanel support={data.globalPayrollSupport} />
          <AdvancedSchedulingEnginePanel engine={data.advancedSchedulingEngine} />
        </WorkspaceSection>
      </div>
    </>
  );
}
