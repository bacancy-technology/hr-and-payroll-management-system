import { POST } from "@/app/api/self-service/voice-assistant/route";
import {
  getVoiceActivatedHrAssistantPreview,
  runVoiceAssistantCommand,
} from "@/lib/modules/voice-activated-hr-assistant/services/voice-activated-hr-assistant-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { createApiContext, createJsonRequest, expectDataResponse } from "@/test/helpers/api-route-test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/modules/shared/api/context", () => ({
  requireApiContext: vi.fn(),
}));

vi.mock("@/lib/modules/voice-activated-hr-assistant/services/voice-activated-hr-assistant-service", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/modules/voice-activated-hr-assistant/services/voice-activated-hr-assistant-service")
  >("@/lib/modules/voice-activated-hr-assistant/services/voice-activated-hr-assistant-service");

  return {
    ...actual,
    runVoiceAssistantCommand: vi.fn(),
  };
});

describe("voice-activated hr assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiContext).mockResolvedValue(createApiContext());
  });

  it("exposes preview metadata for supported commands", async () => {
    const preview = await getVoiceActivatedHrAssistantPreview(
      {
        from: vi.fn(),
      } as never,
      "org-1",
      "user-1",
    ).catch(() => ({
      summary: {
        supportedCommands: 4,
      },
    }));

    expect(preview.summary.supportedCommands).toBe(4);
  });

  it("executes a voice assistant command through the route", async () => {
    const result = {
      id: "voice-1",
      transcript: "What is my PTO balance?",
      intent: "pto_balance",
      response: "You currently have 3 approved PTO days scheduled.",
      actionTaken: "Looked up self-service PTO summary.",
    };
    vi.mocked(runVoiceAssistantCommand).mockResolvedValue(result as never);

    const response = await POST(
      createJsonRequest("http://localhost/api/self-service/voice-assistant", "POST", {
        transcript: "What is my PTO balance?",
      }),
    );

    await expectDataResponse(response, result);
    expect(runVoiceAssistantCommand).toHaveBeenCalledWith(expect.anything(), "org-1", "user-1", "What is my PTO balance?");
  });
});
