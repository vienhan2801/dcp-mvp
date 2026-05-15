// ─────────────────────────────────────────────
// FORMATTING UTILITIES
// ─────────────────────────────────────────────

export function fmtVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtDateTime(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtPercent(value: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
