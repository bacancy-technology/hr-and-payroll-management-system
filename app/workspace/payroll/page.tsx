import { AdvancedSchedulingEnginePanel } from "@/components/advanced-scheduling-engine/advanced-scheduling-engine-panel";
import { BankAccountsTablePanel } from "@/components/direct-deposit/bank-accounts-table-panel";
import { GlobalPayrollSupportPanel } from "@/components/global-payroll-support/global-payroll-support-panel";
import { BlockchainPayrollPanel } from "@/components/blockchain-payroll-verification/blockchain-payroll-panel";
import { PayrollAnomalyPanel } from "@/components/payroll-anomaly-detection/payroll-anomaly-panel";
import { PayrollRunsTablePanel } from "@/components/payroll/payroll-runs-table-panel";
import { PayrollCostTrackingPanel } from "@/components/real-time-payroll-cost-tracking/payroll-cost-tracking-panel";
import { HolidaysTablePanel } from "@/components/time-tracking/holidays-table-panel";
import { PayPeriodsTablePanel } from "@/components/time-tracking/pay-periods-table-panel";
import { TimeEntriesTablePanel } from "@/components/time-tracking/time-entries-table-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { getDashboardData } from "@/lib/data";

export default async function PayrollPage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Payroll"
        title="Operate payroll from cycle planning to payment controls."
        description="The payroll frontend brings together runs, tracking inputs, disbursement setup, global readiness, anomaly detection, verification, and schedule intelligence."
      />

      <section className="workspace-section-grid">
        <PayrollRunsTablePanel />
        <TimeEntriesTablePanel />
        <PayPeriodsTablePanel />
        <HolidaysTablePanel />
        <BankAccountsTablePanel />
        <PayrollAnomalyPanel anomalies={data.payrollAnomalies} />
        <PayrollCostTrackingPanel tracking={data.realTimePayrollCostTracking} />
        <BlockchainPayrollPanel verification={data.blockchainPayrollVerification} />
        <GlobalPayrollSupportPanel support={data.globalPayrollSupport} />
        <AdvancedSchedulingEnginePanel engine={data.advancedSchedulingEngine} />
      </section>
    </>
  );
}
