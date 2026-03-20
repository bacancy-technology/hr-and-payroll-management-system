import { VoiceAssistantPanel } from "@/components/voice-activated-hr-assistant/voice-assistant-panel";
import { SelfServiceWorkspacePanel } from "@/components/self-service/self-service-workspace-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { getDashboardData } from "@/lib/data";

export default async function SelfServicePage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Self-Service"
        title="Expose employee-facing workflows with the same backend system."
        description="This area surfaces profile, pay, PTO, banking, and voice assistant capabilities as a dedicated frontend experience on top of the self-service APIs."
      />

      <section className="workspace-section-grid">
        <SelfServiceWorkspacePanel />
        <VoiceAssistantPanel assistant={data.voiceActivatedHrAssistant} />
      </section>
    </>
  );
}
