import { SelfServiceWorkspacePanel } from "@/components/self-service/self-service-workspace-panel";
import { VoiceAssistantPanel } from "@/components/voice-activated-hr-assistant/voice-assistant-panel";
import { WorkspacePageHeader } from "@/components/workspace-shell/workspace-page-header";
import { WorkspaceSection } from "@/components/workspace-shell/workspace-section";
import { WorkspaceSectionMap } from "@/components/workspace-shell/workspace-section-map";
import { getDashboardData } from "@/lib/data";

const SELF_SERVICE_SECTIONS = [
  {
    id: "employee-workspace",
    title: "Employee Workspace",
    description: "Profile, pay, PTO, and direct deposit context for the signed-in employee.",
  },
  {
    id: "voice-assistant",
    title: "Voice Assistant",
    description: "Conversational shortcuts for payroll and PTO actions.",
  },
];

export default async function SelfServicePage() {
  const data = await getDashboardData();

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Self-Service"
        title="Expose employee-facing workflows with the same backend system."
        description="This area surfaces profile, pay, PTO, banking, and voice assistant capabilities as a dedicated frontend experience on top of the self-service APIs."
      />

      <WorkspaceSectionMap items={SELF_SERVICE_SECTIONS} />

      <div className="workspace-section-stack">
        <WorkspaceSection
          description="Give employees a single view of their current profile, direct deposit, PTO, and payroll timeline."
          id="employee-workspace"
          title="Employee Workspace"
        >
          <SelfServiceWorkspacePanel />
        </WorkspaceSection>

        <WorkspaceSection
          description="Surface common spoken commands and assistant responses directly inside self-service."
          id="voice-assistant"
          title="Voice Assistant"
        >
          <VoiceAssistantPanel assistant={data.voiceActivatedHrAssistant} />
        </WorkspaceSection>
      </div>
    </>
  );
}
