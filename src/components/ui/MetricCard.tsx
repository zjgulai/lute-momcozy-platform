import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "danger" | "warn" | "success";
  className?: string;
}

const VARIANT_STYLES = {
  default: "bg-white border-neutral-200",
  danger:  "bg-danger-100 border-danger-500",
  warn:    "bg-warning-100 border-warning-500",
  success: "bg-success-100 border-success-500",
};

export function MetricCard({ label, value, sub, trend, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn("border rounded-lg p-4 shadow-xs", VARIANT_STYLES[variant], className)}>
      <div className="metric-label mb-1">{label}</div>
      <div className="metric-number">{value}</div>
      {sub && <div className="text-xs text-neutral-600 mt-1">{sub}</div>}
      {trend && (
        <div className={cn("text-xs mt-1 font-medium",
          trend === "up" ? "text-success-700" : trend === "down" ? "text-danger-700" : "text-neutral-600"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </div>
      )}
    </div>
  );
}
