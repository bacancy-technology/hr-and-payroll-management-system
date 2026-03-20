import { VoiceAssistantPanel } from "@/components/voice-activated-hr-assistant/voice-assistant-panel";
import { getDemoDashboardData } from "@/lib/demo-data";
import { renderMarkup } from "@/test/helpers/frontend-test-utils";
import { describe, expect, it } from "vitest";

describe("voice activated HR assistant frontend", () => {
  it("renders sample commands and the recent result", () => {
    const data = getDemoDashboardData();
    const markup = renderMarkup(
      <VoiceAssistantPanel assistant={data.voiceActivatedHrAssistant} />,
    );

    expect(markup).toContain("Voice-activated HR assistant");
    expect(markup).toContain(data.voiceActivatedHrAssistant.sampleCommands[0].prompt);
    expect(markup).toContain(data.voiceActivatedHrAssistant.recentResult.actionTaken);
  });
});
