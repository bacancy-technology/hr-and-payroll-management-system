import type { BenefitsRecommendation } from "@/lib/types";

const priorityClassName: Record<BenefitsRecommendation["priority"], string> = {
  Priority: "benefits-pill benefits-pill-priority",
  Recommended: "benefits-pill benefits-pill-recommended",
  Consider: "benefits-pill benefits-pill-consider",
};

interface RecommendationPriorityPillProps {
  priority: BenefitsRecommendation["priority"];
}

export function RecommendationPriorityPill({ priority }: RecommendationPriorityPillProps) {
  return <span className={priorityClassName[priority]}>{priority}</span>;
}
