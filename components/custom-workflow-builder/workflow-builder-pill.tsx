interface WorkflowBuilderPillProps {
  label: string;
  tone: "Active" | "Draft" | "Needs Review" | "Ready" | "Watch" | "Blocked" | "Automated" | "Assisted" | "Manual";
}

function toWorkflowBuilderClass(tone: WorkflowBuilderPillProps["tone"]) {
  return `workflow-builder-pill workflow-builder-${tone.toLowerCase().replace(/\s+/g, "-")}`;
}

export function WorkflowBuilderPill({ label, tone }: WorkflowBuilderPillProps) {
  return <span className={toWorkflowBuilderClass(tone)}>{label}</span>;
}
