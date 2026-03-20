import type { VoiceAssistantCommandResult } from "@/lib/types";

const intentClassName: Record<VoiceAssistantCommandResult["intent"], string> = {
  pto_balance: "voice-pill voice-pill-balance",
  submit_pto_request: "voice-pill voice-pill-submit",
  payroll_summary: "voice-pill voice-pill-payroll",
  help: "voice-pill voice-pill-help",
};

interface VoiceIntentPillProps {
  intent: VoiceAssistantCommandResult["intent"];
}

export function VoiceIntentPill({ intent }: VoiceIntentPillProps) {
  return <span className={intentClassName[intent]}>{intent.replaceAll("_", " ")}</span>;
}
