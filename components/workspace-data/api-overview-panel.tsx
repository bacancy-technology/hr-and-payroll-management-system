"use client";

import { useEffect, useState } from "react";

interface OverviewMetric {
  label: string;
  value: string;
  detail: string;
}

interface ApiOverviewPanelProps {
  title: string;
  subtitle: string;
  endpoint: string;
  metricLabel?: string;
  selectMetrics: (payload: unknown) => OverviewMetric[];
  renderBody?: (payload: unknown) => React.ReactNode;
}

export function ApiOverviewPanel({
  title,
  subtitle,
  endpoint,
  metricLabel = "metrics",
  selectMetrics,
  renderBody,
}: ApiOverviewPanelProps) {
  const [payload, setPayload] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(endpoint, { cache: "no-store" });
        const body = (await response.json()) as { data?: unknown; error?: { message?: string } };

        if (!response.ok) {
          throw new Error(body.error?.message ?? "Failed to load data.");
        }

        if (active) {
          setPayload(body.data ?? null);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setPayload(null);
          setError(loadError instanceof Error ? loadError.message : "Failed to load data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [endpoint]);

  const metrics = payload ? selectMetrics(payload) : [];

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>{title}</h3>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
        <span className="pill">
          {loading ? "Loading" : `${metrics.length} ${metricLabel}`}
        </span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}

      {!error && loading ? <p className="workspace-panel-message">Loading data...</p> : null}

      {!error && !loading && metrics.length > 0 ? (
        <div className="forecast-summary-grid">
          {metrics.map((metric) => (
            <div className="forecast-summary-card" key={metric.label}>
              <span className="small-label">{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      {!error && !loading && renderBody && payload ? renderBody(payload) : null}
    </article>
  );
}
