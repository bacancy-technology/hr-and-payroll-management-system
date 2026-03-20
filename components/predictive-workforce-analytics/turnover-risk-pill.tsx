import type { PredictiveTurnoverRisk } from "@/lib/types";

const riskLevelClassName: Record<PredictiveTurnoverRisk["riskLevel"], string> = {
  Critical: "forecast-pill forecast-pill-critical",
  Elevated: "forecast-pill forecast-pill-elevated",
  Watch: "forecast-pill forecast-pill-watch",
};

interface TurnoverRiskPillProps {
  riskLevel: PredictiveTurnoverRisk["riskLevel"];
}

export function TurnoverRiskPill({ riskLevel }: TurnoverRiskPillProps) {
  return <span className={riskLevelClassName[riskLevel]}>{riskLevel}</span>;
}
