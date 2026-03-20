import { runVoiceAssistantCommand } from "@/lib/modules/voice-activated-hr-assistant/services/voice-activated-hr-assistant-service";
import { requireApiContext } from "@/lib/modules/shared/api/context";
import { handleRouteError, ok } from "@/lib/modules/shared/api/http";
import { readJsonBody, readRequiredString } from "@/lib/modules/shared/api/validation";

export async function POST(request: Request) {
  try {
    const { supabase, organizationId, user } = await requireApiContext();
    const body = await readJsonBody(request);

    return ok(
      await runVoiceAssistantCommand(
        supabase,
        organizationId,
        user.id,
        readRequiredString(body, "transcript", "Voice transcript"),
      ),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
