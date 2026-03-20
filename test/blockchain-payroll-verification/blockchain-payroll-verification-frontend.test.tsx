import { BlockchainPayrollPanel } from "@/components/blockchain-payroll-verification/blockchain-payroll-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("blockchain payroll verification frontend", () => {
  it("renders verification blocks and immutable run details", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <BlockchainPayrollPanel verification={data.blockchainPayrollVerification} />,
    );

    expect(markup).toContain("Blockchain payroll verification");
    expect(markup).toContain(data.blockchainPayrollVerification.blocks[0].payrollRunLabel);
    expect(markup).toContain(String(data.blockchainPayrollVerification.summary.immutableRecords));
  });
});
