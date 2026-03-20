interface ScheduleStatusPillProps {
  label: string;
  tone: "Strong" | "Partial" | "Limited" | "Compliant" | "Watch" | "Needs Review" | "Low" | "Medium" | "High";
}

function toToneClass(tone: ScheduleStatusPillProps["tone"]) {
  return `schedule-status-pill schedule-status-${tone.toLowerCase().replace(/\s+/g, "-")}`;
}

export function ScheduleStatusPill({ label, tone }: ScheduleStatusPillProps) {
  return <span className={toToneClass(tone)}>{label}</span>;
}
