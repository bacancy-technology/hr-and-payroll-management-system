import type {
  SentimentAnalysisDashboard,
  SentimentSignal,
  SentimentTheme,
} from "@/lib/types";
import type { AuthenticatedSupabaseClient } from "@/lib/modules/shared/api/context";

import { listApprovals } from "@/lib/modules/approvals/services/approval-service";
import { listPerformanceReviews } from "@/lib/modules/performance/services/performance-review-service";

interface AnnouncementRow {
  id: string;
  label: string;
  title: string;
  body: string;
}

interface RawSentimentSignal {
  id: string;
  source: string;
  topic: string;
  subject: string;
  excerpt: string;
  score: number;
}

const POSITIVE_TERMS = ["strong", "better", "improved", "refreshed", "dropped", "clearing", "shortens", "finalize", "ownership"];
const NEGATIVE_TERMS = ["pending", "blocked", "delay", "manual", "review", "rejected", "exception", "risk", "awaiting"];

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function scoreText(text: string) {
  const normalized = text.toLowerCase();
  const positive = POSITIVE_TERMS.reduce((sum, term) => sum + (normalized.includes(term) ? 1 : 0), 0);
  const negative = NEGATIVE_TERMS.reduce((sum, term) => sum + (normalized.includes(term) ? 1 : 0), 0);

  return positive - negative;
}

function toSentiment(score: number): SentimentSignal["sentiment"] {
  if (score >= 1) {
    return "Positive";
  }

  if (score <= -1) {
    return "At Risk";
  }

  return "Mixed";
}

function recommendationFor(signal: RawSentimentSignal, sentiment: SentimentSignal["sentiment"]) {
  if (signal.source === "Approval") {
    return sentiment === "Positive"
      ? "Keep approval turnaround consistent so operational confidence stays high."
      : "Triage aging approvals before they start affecting employee confidence in response times.";
  }

  if (signal.source === "Performance Review") {
    return sentiment === "Positive"
      ? "Reinforce momentum with specific coaching and follow-through during the next check-in."
      : "Resolve open review items quickly so mixed feedback does not linger without context.";
  }

  return sentiment === "Positive"
    ? "Echo this message broadly so teams understand the operational win behind it."
    : "Pair the message with clear owners and next steps so uncertainty does not spread.";
}

function buildSignal(raw: RawSentimentSignal): SentimentSignal {
  const sentiment = toSentiment(raw.score);

  return {
    id: raw.id,
    source: raw.source,
    topic: raw.topic,
    subject: raw.subject,
    sentiment,
    excerpt: raw.excerpt,
    recommendedAction: recommendationFor(raw, sentiment),
  };
}

export function buildSentimentAnalysisDashboard(input: {
  announcements: AnnouncementRow[];
  approvals: Awaited<ReturnType<typeof listApprovals>>;
  performanceReviews: Awaited<ReturnType<typeof listPerformanceReviews>>;
  generatedAt?: string;
}) {
  const rawSignals: RawSentimentSignal[] = [
    ...input.announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      source: "Announcement",
      topic: announcement.label,
      subject: announcement.title,
      excerpt: announcement.body,
      score: scoreText(`${announcement.title} ${announcement.body}`),
    })),
    ...input.performanceReviews.map((review) => ({
      id: `review-${review.id}`,
      source: "Performance Review",
      topic: "Performance",
      subject: review.employeeName,
      excerpt: `${review.summary ?? "No summary provided."}${review.notes ? ` ${review.notes}` : ""}`,
      score:
        scoreText(`${review.summary ?? ""} ${review.notes ?? ""}`) +
        (review.score && review.score >= 4 ? 1 : 0) +
        (review.score && review.score <= 3 ? -1 : 0) +
        (review.status === "Draft" || review.status === "In Review" ? -0.5 : 0),
    })),
    ...input.approvals.slice(0, 3).map((approval) => ({
      id: `approval-${approval.id}`,
      source: "Approval",
      topic: "Approvals",
      subject: `${approval.entityType.replace(/_/g, " ")} queue`,
      excerpt: approval.decisionNote ?? `${approval.entityType.replace(/_/g, " ")} is currently ${approval.status.toLowerCase()}.`,
      score:
        scoreText(`${approval.decisionNote ?? ""} ${approval.status}`) +
        (approval.status === "Approved" ? 1 : 0) +
        (approval.status === "Rejected" ? -1 : 0),
    })),
  ];

  const signals = rawSignals
    .map((signal) => buildSignal(signal))
    .sort((left, right) => left.topic.localeCompare(right.topic) || left.subject.localeCompare(right.subject));

  const themes = Object.entries(
    signals.reduce<Record<string, { count: number; total: number }>>((accumulator, signal) => {
      const current = accumulator[signal.topic] ?? { count: 0, total: 0 };

      accumulator[signal.topic] = {
        count: current.count + 1,
        total:
          current.total +
          (signal.sentiment === "Positive" ? 1 : signal.sentiment === "At Risk" ? -1 : 0),
      };

      return accumulator;
    }, {}),
  )
    .map(([topic, aggregate]) => {
      const average = aggregate.count === 0 ? 0 : round(aggregate.total / aggregate.count);
      const sentiment = toSentiment(average);

      return {
        id: `sentiment-theme-${topic.toLowerCase().replace(/\s+/g, "-")}`,
        topic,
        sentiment,
        signalCount: aggregate.count,
        summary:
          sentiment === "Positive"
            ? `Signals in ${topic} are trending constructive, with more positive language than blockers.`
            : sentiment === "At Risk"
              ? `${topic} includes enough negative language to warrant follow-up and leadership attention.`
              : `${topic} has mixed language, suggesting progress is visible but not fully settled yet.`,
      } satisfies SentimentTheme;
    })
    .sort((left, right) => right.signalCount - left.signalCount);

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    summary: {
      signalsAnalyzed: signals.length,
      positiveSignals: signals.filter((signal) => signal.sentiment === "Positive").length,
      watchSignals: signals.filter((signal) => signal.sentiment === "Mixed").length,
      atRiskSignals: signals.filter((signal) => signal.sentiment === "At Risk").length,
    },
    themes,
    signals,
  } satisfies SentimentAnalysisDashboard;
}

export async function getSentimentAnalysisDashboard(
  supabase: AuthenticatedSupabaseClient,
  organizationId: string,
) {
  const [announcementsResult, approvals, performanceReviews] = await Promise.all([
    supabase
      .from("announcements")
      .select("id, label, title, body")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true })
      .limit(4),
    listApprovals(supabase, organizationId),
    listPerformanceReviews(supabase, organizationId),
  ]);

  return buildSentimentAnalysisDashboard({
    announcements: (announcementsResult.data ?? []) as AnnouncementRow[],
    approvals,
    performanceReviews,
  });
}
