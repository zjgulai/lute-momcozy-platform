export function formatNumber(n: number | null | undefined, decimals = 0): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export function formatKb(kb: number | null | undefined): string {
  if (kb == null) return "—";
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
}

export function formatUsd(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
}

export function relativeDate(s: string | null | undefined): string {
  if (!s) return "—";
  const diff = Date.now() - new Date(s).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 30) return `${days}天前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}
