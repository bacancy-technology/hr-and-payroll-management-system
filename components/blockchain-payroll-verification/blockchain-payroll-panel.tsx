import type { BlockchainPayrollVerification } from "@/lib/types";
import { formatDate } from "@/lib/utils";

import { PayrollVerificationStatusPill } from "@/components/blockchain-payroll-verification/payroll-verification-status-pill";

interface BlockchainPayrollPanelProps {
  verification: BlockchainPayrollVerification;
}

function shortenHash(value: string) {
  return value.length <= 20 ? value : `${value.slice(0, 10)}...${value.slice(-10)}`;
}

export function BlockchainPayrollPanel({ verification }: BlockchainPayrollPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Blockchain payroll verification</h3>
          <p className="panel-subtitle">Immutable payroll chain built from run and pay item snapshots for audit review.</p>
        </div>
        <span className="pill">{verification.summary.chainLength} blocks</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Verified</span>
          <strong>{verification.summary.verifiedRuns}</strong>
          <p>Payroll runs currently hashed into the verification chain.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Anchored</span>
          <strong>{verification.summary.anchoredRuns}</strong>
          <p>Finalized runs considered immutable in the audit ledger.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Records</span>
          <strong>{verification.summary.immutableRecords}</strong>
          <p>Total payroll run and item records covered by the chain.</p>
        </div>
      </div>

      <div className="stack">
        {verification.blocks.map((block) => (
          <div className="ledger-card" key={block.id}>
            <div className="split">
              <div>
                <span className="small-label">{block.status}</span>
                <strong>{block.payrollRunLabel}</strong>
              </div>
              <PayrollVerificationStatusPill status={block.verificationStatus} />
            </div>
            <p className="muted">
              Pay date {formatDate(block.payDate)} · {block.recordCount} immutable record(s)
            </p>
            <div className="ledger-hash-grid">
              <div className="ledger-hash-card">
                <span className="small-label">Prev hash</span>
                <strong>{shortenHash(block.previousHash)}</strong>
              </div>
              <div className="ledger-hash-card">
                <span className="small-label">Payload hash</span>
                <strong>{shortenHash(block.payloadHash)}</strong>
              </div>
              <div className="ledger-hash-card">
                <span className="small-label">Block hash</span>
                <strong>{shortenHash(block.blockHash)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
