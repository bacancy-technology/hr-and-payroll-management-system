import type { ComplianceMonitoringSignal } from "@/lib/types";

const statusClassName: Record<ComplianceMonitoringSignal["monitoringStatus"], string> = {
  "Action Required": "compliance-pill compliance-pill-action",
  Watch: "compliance-pill compliance-pill-watch",
  Stable: "compliance-pill compliance-pill-stable",
};

interface ComplianceStatusPillProps {
  status: ComplianceMonitoringSignal["monitoringStatus"];
}

export function ComplianceStatusPill({ status }: ComplianceStatusPillProps) {
  return <span className={statusClassName[status]}>{status}</span>;
}
