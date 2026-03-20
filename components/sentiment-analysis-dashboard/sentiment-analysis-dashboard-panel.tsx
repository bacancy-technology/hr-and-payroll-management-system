import type { SentimentAnalysisDashboard } from "@/lib/types";

import { SentimentStatusPill } from "@/components/sentiment-analysis-dashboard/sentiment-status-pill";

interface SentimentAnalysisDashboardPanelProps {
  dashboard: SentimentAnalysisDashboard;
}

export function SentimentAnalysisDashboardPanel({
  dashboard,
}: SentimentAnalysisDashboardPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Sentiment analysis dashboard</h3>
          <p className="panel-subtitle">Structured sentiment signals inferred from reviews, approvals, and operational communications.</p>
        </div>
        <span className="pill">{dashboard.summary.signalsAnalyzed} signals analyzed</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Positive</span>
          <strong>{dashboard.summary.positiveSignals}</strong>
          <p>Signals that read as constructive and confidence-building.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Watch</span>
          <strong>{dashboard.summary.watchSignals}</strong>
          <p>Signals with mixed tone or unfinished follow-through.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">At risk</span>
          <strong>{dashboard.summary.atRiskSignals}</strong>
          <p>Signals that may require immediate leadership attention.</p>
        </div>
      </div>

      <div className="sentiment-grid">
        <div className="stack">
          {dashboard.themes.map((theme) => (
            <div className="sentiment-card" key={theme.id}>
              <div className="split">
                <strong>{theme.topic}</strong>
                <SentimentStatusPill sentiment={theme.sentiment} />
              </div>
              <p>{theme.summary}</p>
              <span className="small-label">{theme.signalCount} connected signals</span>
            </div>
          ))}
        </div>

        <div className="stack">
          {dashboard.signals.map((signal) => (
            <div className="sentiment-card" key={signal.id}>
              <div className="split">
                <div>
                  <span className="small-label">{signal.source}</span>
                  <strong>{signal.subject}</strong>
                </div>
                <SentimentStatusPill sentiment={signal.sentiment} />
              </div>
              <p>{signal.excerpt}</p>
              <p className="muted">{signal.recommendedAction}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
