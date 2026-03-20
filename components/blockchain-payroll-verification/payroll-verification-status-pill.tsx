import type { PayrollVerificationBlock } from "@/lib/types";

const statusClassName: Record<PayrollVerificationBlock["verificationStatus"], string> = {
  Anchored: "ledger-pill ledger-pill-anchored",
  Verified: "ledger-pill ledger-pill-verified",
  Pending: "ledger-pill ledger-pill-pending",
};

interface PayrollVerificationStatusPillProps {
  status: PayrollVerificationBlock["verificationStatus"];
}

export function PayrollVerificationStatusPill({ status }: PayrollVerificationStatusPillProps) {
  return <span className={statusClassName[status]}>{status}</span>;
}
