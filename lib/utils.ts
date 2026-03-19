export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function initialsFromName(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "HR";
}

export function toStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (["paid", "approved", "active"].includes(normalized)) {
    return "status-badge status-paid";
  }

  if (["processing", "in review"].includes(normalized)) {
    return "status-badge status-processing";
  }

  if (["pending", "scheduled"].includes(normalized)) {
    return "status-badge status-pending";
  }

  if (normalized === "on leave") {
    return "status-badge status-on-leave";
  }

  return "status-badge status-draft";
}
