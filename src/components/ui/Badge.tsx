"use client";

import { cn } from "@/lib/utils/cn";
import { GRADE_CONFIG, type Grade } from "@/lib/utils/grade";

interface BadgeProps {
  grade?: Grade;
  status?: "pass" | "warn" | "fail" | "pending" | "collected" | "missing";
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_STYLE = {
  pass:      { bg: "#D1FAE5", text: "#065F46", label: "通过" },
  warn:      { bg: "#FEF3C7", text: "#92400E", label: "预警" },
  fail:      { bg: "#FEE2E2", text: "#991B1B", label: "失败" },
  pending:   { bg: "#F3F4F6", text: "#374151", label: "待采集" },
  collected: { bg: "#EEF2FF", text: "#3730A3", label: "已采集" },
  missing:   { bg: "#FEF3C7", text: "#92400E", label: "数据缺失" },
};

export function Badge({ grade, status, children, className, size = "md" }: BadgeProps) {
  const style = grade ? GRADE_CONFIG[grade] : status ? STATUS_STYLE[status] : null;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-pill",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
      style={
        style
          ? { backgroundColor: style.bg, color: style.text }
          : undefined
      }
    >
      {children ?? (grade ? GRADE_CONFIG[grade].label : status ? STATUS_STYLE[status].label : null)}
    </span>
  );
}
