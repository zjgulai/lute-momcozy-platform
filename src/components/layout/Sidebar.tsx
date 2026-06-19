"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { BrandConfig } from "@/lib/data/brands";

interface SidebarProps {
  brand: BrandConfig;
}

const NAV_ITEMS = [
  { href: "",             label: "总览",     icon: "◈" },
  { href: "/metrics",    label: "指标口径", icon: "∿" },
  { href: "/forensics",  label: "风险归因", icon: "⚑" },
  { href: "/trends",     label: "趋势证据", icon: "⤴" },
  { href: "/cross-audit",label: "决策矩阵", icon: "⊞" },
  { href: "/competitors",label: "竞品对比", icon: "⊕" },
  { href: "/360",        label: "360框架",  icon: "◉" },
  { href: "/collection", label: "采集管理", icon: "⊗" },
  { href: "/execution",  label: "执行战单", icon: "▷" },
];

export function Sidebar({ brand }: SidebarProps) {
  const pathname = usePathname();
  const base = `/brands/${brand.id}`;

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col bg-neutral-900 border-r border-neutral-800"
      style={{ width: "var(--sidebar-width)" }}
    >
      <div className="px-4 py-5 border-b border-neutral-800">
        <Link href={base} className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-md bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
            {brand.logoMark}
          </span>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">{brand.name}</div>
            <div className="text-[10px] text-neutral-500 tracking-wide uppercase">诊断监控360</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.href}`;
          const isActive = item.href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5",
                isActive
                  ? "bg-primary-500 text-white font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-neutral-800">
        <div className="text-[10px] text-neutral-600 leading-relaxed">
          路特 AI × 诊断监控360
          <br />
          <span className="text-neutral-700">{brand.domain}</span>
        </div>
      </div>
    </aside>
  );
}
