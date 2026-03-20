import type { PayrollAnomaly } from "@/lib/types";

const severityClassName: Record<PayrollAnomaly["severity"], string> = {
  High: "anomaly-severity anomaly-severity-high",
  Medium: "anomaly-severity anomaly-severity-medium",
  Low: "anomaly-severity anomaly-severity-low",
};

interface AnomalySeverityPillProps {
  severity: PayrollAnomaly["severity"];
}

export function AnomalySeverityPill({ severity }: AnomalySeverityPillProps) {
  return <span className={severityClassName[severity]}>{severity} risk</span>;
}
