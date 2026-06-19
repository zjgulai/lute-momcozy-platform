"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TrendsClientProps {
  sessions: any[];
  latestSession: any;
}

const METRIC_LABELS: Record<string, string> = {
  fcp: "FCP (s)",
  ttfb: "TTFB (ms)",
  jsKb: "JS (KB)",
  domNodes: "DOM 节点",
  thirdPartyFailures: "3P 失败",
};

export function TrendsCharts({ sessions, latestSession }: TrendsClientProps) {
  const trendData = sessions
    .filter((s: any) => s?.observedAt && s?.metrics)
    .map((s: any) => ({
      date: s.observedAt,
      fcp: s.metrics.fcp,
      ttfb: s.metrics.ttfb,
      jsKb: s.metrics.jsKb,
      domNodes: s.metrics.domNodes,
      thirdPartyFailures: s.metrics.thirdPartyFailures,
      confidence: s.confidence,
    }));

  const routeData = (latestSession?.routes ?? []).map((r: any) => {
    const desktop = r.viewports?.find((v: any) => v.label === "desktop");
    return {
      route: r.routeId?.replace("pdp-", "").slice(0, 12),
      thirdPartyFailures: desktop?.metrics?.thirdPartyFailures ?? 0,
      domNodes: desktop?.metrics?.domNodes ?? 0,
      jsKb: desktop?.metrics?.jsKb ?? 0,
    };
  }).filter((r: any) => r.route);

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="text-sm font-semibold text-neutral-700 mb-1">第三方失败 趋势（7次采集）</div>
        <div className="text-xs text-neutral-500 mb-4">月度 Playwright 自动采集；M1-M3 为手工基线（confidence: low）</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="thirdPartyFailures" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="3P 失败" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="text-sm font-semibold text-neutral-700 mb-1">JS 体积趋势（KB）</div>
        <div className="text-xs text-neutral-500 mb-4">首页桌面端 JS 传输大小</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="jsKb" stroke="#5079D9" strokeWidth={2} dot={{ r: 3 }} name="JS KB" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {routeData.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold text-neutral-700 mb-1">各路由 3P 失败对比（{latestSession?.observedAt}）</div>
          <div className="text-xs text-neutral-500 mb-4">最新采集 13 条路由桌面端数据</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="route" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="thirdPartyFailures" fill="#EF4444" name="3P 失败" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
