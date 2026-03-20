import type { VoiceActivatedHrAssistant } from "@/lib/types";

import { VoiceIntentPill } from "@/components/voice-activated-hr-assistant/voice-intent-pill";

interface VoiceAssistantPanelProps {
  assistant: VoiceActivatedHrAssistant;
}

export function VoiceAssistantPanel({ assistant }: VoiceAssistantPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Voice-activated HR assistant</h3>
          <p className="panel-subtitle">Natural-language assistant for PTO status, request submission, and payroll questions.</p>
        </div>
        <span className="pill">{assistant.summary.supportedCommands} supported intents</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Commands</span>
          <strong>{assistant.summary.supportedCommands}</strong>
          <p>Recognized request types available through the assistant.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Automations</span>
          <strong>{assistant.summary.automationReadyActions}</strong>
          <p>Commands that can act directly on self-service workflows.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Last intent</span>
          <strong>{assistant.recentResult.intent.replaceAll("_", " ")}</strong>
          <p>Most recent interpreted command in the assistant preview.</p>
        </div>
      </div>

      <div className="voice-command-list">
        {assistant.sampleCommands.map((command) => (
          <div className="voice-command-card" key={command.prompt}>
            <span className="small-label">{command.intent.replaceAll("_", " ")}</span>
            <strong>{command.prompt}</strong>
          </div>
        ))}
      </div>

      <div className="voice-result-card">
        <div className="split">
          <strong>Recent assistant response</strong>
          <VoiceIntentPill intent={assistant.recentResult.intent} />
        </div>
        <p className="muted">“{assistant.recentResult.transcript}”</p>
        <p>{assistant.recentResult.response}</p>
        <p className="muted">{assistant.recentResult.actionTaken}</p>
      </div>
    </article>
  );
}
