interface SentimentStatusPillProps {
  sentiment: "Positive" | "Mixed" | "At Risk";
}

function toSentimentClass(sentiment: SentimentStatusPillProps["sentiment"]) {
  return `sentiment-status-pill sentiment-status-${sentiment.toLowerCase().replace(/\s+/g, "-")}`;
}

export function SentimentStatusPill({ sentiment }: SentimentStatusPillProps) {
  return <span className={toSentimentClass(sentiment)}>{sentiment}</span>;
}
