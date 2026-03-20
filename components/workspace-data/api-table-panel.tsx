"use client";

import { useEffect, useState } from "react";

import { formatCurrency, formatDate, toStatusClass } from "@/lib/utils";

export interface ApiTableColumn<T> {
  label: string;
  render: (item: T) => React.ReactNode;
}

interface ApiTablePanelProps<T> {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: ApiTableColumn<T>[];
  emptyMessage: string;
  countLabel?: string;
  getKey: (item: T) => string;
  selectItems?: (payload: unknown) => T[];
}

function defaultSelectItems<T>(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  return [];
}

export function ApiTablePanel<T>({
  title,
  subtitle,
  endpoint,
  columns,
  emptyMessage,
  countLabel = "records",
  getKey,
  selectItems = defaultSelectItems,
}: ApiTablePanelProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(endpoint, { cache: "no-store" });
        const payload = (await response.json()) as { data?: unknown; error?: { message?: string } };

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Failed to load data.");
        }

        if (active) {
          setItems(selectItems(payload.data));
          setError(null);
          setLastUpdatedLabel(
            new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            }),
          );
        }
      } catch (loadError) {
        if (active) {
          setItems([]);
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
  }, [endpoint, refreshCount, selectItems]);

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>{title}</h3>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
        <div className="workspace-panel-actions">
          {lastUpdatedLabel ? <span className="muted">Updated {lastUpdatedLabel}</span> : null}
          <span className="pill">
            {loading ? "Loading" : `${items.length} ${countLabel}`}
          </span>
          <button
            className="button-ghost workspace-panel-refresh"
            onClick={() => setRefreshCount((value) => value + 1)}
            type="button"
          >
            {error ? "Retry" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}

      {!error && loading ? <p className="workspace-panel-message">Loading data...</p> : null}

      {!error && !loading && items.length === 0 ? (
        <p className="workspace-panel-message">{emptyMessage}</p>
      ) : null}

      {!error && !loading && items.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={getKey(item)}>
                  {columns.map((column) => (
                    <td key={column.label}>{column.render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </article>
  );
}

export function renderPrimary(text: string, detail?: string | null) {
  return (
    <>
      <span className="table-primary">{text}</span>
      {detail ? <span className="muted">{detail}</span> : null}
    </>
  );
}

export function renderStatus(status: string) {
  return <span className={toStatusClass(status)}>{status}</span>;
}

export function renderCurrency(value: number) {
  return formatCurrency(value);
}

export function renderDate(value: string | null | undefined) {
  return value ? formatDate(value) : "Not set";
}
