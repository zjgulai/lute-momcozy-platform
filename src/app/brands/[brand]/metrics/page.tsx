import { loadPublicCrossAudit, loadLatestSession, loadAllSessions } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { formatPercent, formatMs, formatKb, formatNumber, formatDate } from "@/lib/utils/format";

export default async function MetricsPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const session = loadLatestSession() as any;
  const ops = data?.currentOperations ?? {};
  const hist = data?.historicalOperations ?? {};
  const ext = data?.external ?? {};
  const gaps = data?.diagnosticGaps360?.gaps ?? {};

  const funnelRows = [
    ["浏览率（Avg PV）", formatNumber(ops.traffic?.avgPv, 2), formatNumber(hist.traffic?.avgPvPerVisitor, 2), "越高越好"],
    ["加购率", formatPercent(ops.conversion?.addToCartRate), formatPercent(hist.conversion?.addToCartRate), "当前更高"],
    ["结账率", formatPercent(ops.conversion?.checkoutRate), formatPercent(hist.conversion?.checkoutRate), "需分渠道"],
    ["转化率 CVR", formatPercent(ops.conversion?.conversionRate), formatPercent(hist.conversion?.overallCvr), "⚠️ 口径差异"],
    ["弃单率", formatPercent(ops.conversion?.cartAbandonmentRate), formatPercent(hist.conversion?.cartAbandonmentRate), "越低越好"],
    ["复购率", formatPercent(ops.sales?.repurchaseRate), formatPercent(hist.sales?.repurchaseRate), "当前更高"],
    ["Attach Rate", formatPercent(ops.sales?.attachRate), formatPercent(hist.sales?.attachRate), "当前更高"],
    ["退款率", formatPercent(ops.sales?.refundRate), formatPercent(hist.sales?.refundRate), "低 ✅"],
    ["平均停留(s)", `${Math.round(ops.traffic?.avgStaySec ?? 0)}s`, `${hist.traffic?.avgSessionSec ?? "—"}s`, "当前更长"],
    ["跳出率", formatPercent(ops.traffic?.bounceRate), formatPercent(hist.traffic?.bounceRate), "当前更低 ✅"],
  ];

  const pendingGaps = [
    { key: "G1_behavior", icon: "◐", color: "text-warning-500" },
    { key: "G2_funnel_segmented", icon: "◑", color: "text-danger-500" },
    { key: "G3_ltv_cohort", icon: "◐", color: "text-danger-500" },
    { key: "G4_email_sms", icon: "◑", color: "text-warning-500" },
    { key: "G8_social_commerce", icon: "◐", color: "text-warning-500" },
    { key: "G10_support_quality", icon: "◑", color: "text-neutral-400" },
  ];

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">II · 指标口径</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          先统一口径，<br /><span className="text-primary-500">再讨论增长。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl leading-relaxed">
          当前 workbook 可用于判断预算优先级；历史经营可用于恢复基线假设。
          两者不能直接拼成承诺收益。<strong className="text-neutral-800">自然搜索行为 = 0</strong>，付费流量占比约 45%（C7）。
        </p>
      </div>

      {/* 数据质量告警 */}
      <div className="mb-6 p-4 rounded-lg border border-warning-500 bg-warning-100 flex gap-3 items-start">
        <span className="text-warning-500 text-lg mt-0.5">⚠</span>
        <div className="text-sm">
          <span className="font-semibold text-warning-700">C7 口径风险：</span>
          <span className="text-warning-700">
            内部 workbook CVR 2.4% 很可能大量混入高意图付费流量。在付费/自然渠道 CVR 未分段前，当前漏斗改善不能被解读为自然获客效率提升。
          </span>
        </div>
      </div>

      {/* KPI 三栏对比 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">核心 KPI · 当前 vs 历史</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard label="转化率 CVR" value={formatPercent(ops.conversion?.conversionRate)} sub="当前 workbook · 含口径风险" variant="warn" />
          <MetricCard label="历史 CVR" value={formatPercent(hist.conversion?.overallCvr)} sub="历史 M1 v2.0 · 不同窗口口径" />
          <MetricCard label="AOV（当前）" value={`$${Math.round(ops.sales?.averageOrderValue ?? 0)}`} sub="当前窗口" />
          <MetricCard label="AOV（历史）" value={`$${Math.round(hist.sales?.averageOrderValueUsd ?? 0)}`} sub="历史 M1 · 更高" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="月均收入（历史）" value={`$${((hist.sales?.monthlyRevenueUsd ?? 0) / 1e6).toFixed(1)}M`} sub="历史 M1 · 不可直接承诺" />
          <MetricCard label="复购率（当前）" value={formatPercent(ops.sales?.repurchaseRate)} sub="当前 workbook" variant="success" />
          <MetricCard label="跳出率（当前）" value={formatPercent(ops.traffic?.bounceRate)} sub="当前 workbook" />
          <MetricCard label="跳出率（历史）" value={formatPercent(hist.traffic?.bounceRate)} sub="历史 · 更高" variant="success" />
        </div>
      </section>

      {/* 漏斗对比表 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">漏斗指标对比（当前 vs 历史）</h2>
        <Table
          headers={["指标", "当前 workbook", "历史 M1 v2.0", "说明"]}
          rows={funnelRows.map(row => row.map(cell => <span className="text-sm">{cell}</span>))}
        />
        <p className="text-xs text-neutral-500 mt-2">
          * 窗口不同：当前 {data?.internal?.trafficObservedDays ?? 137}天流量/{data?.internal?.salesObservedDays ?? 204}天销售；历史 {hist.periodDays ?? 135}天。币种待确认。直接比较无效。
        </p>
      </section>

      {/* 技术指标 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">技术指标（外部采集 · {ext.latestSession}）</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="TTFB 桌面" value={formatMs(ext.homepageTtfbDesktopMs)} sub="非主因" variant="success" />
          <MetricCard label="TTFB 移动" value={formatMs(ext.homepageTtfbMobileMs)} sub="非主因" variant="success" />
          <MetricCard label="首页 JS" value={formatKb(ext.homepageJsKb)} sub="PDP 最高：{formatKb(ext.pdpJsKb)}" variant="danger" />
          <MetricCard label="DOM 最大" value={formatNumber(ext.maxDomNodes)} sub="PDP watchlist 最高" variant="danger" />
          <MetricCard label="3P 失败最高" value={formatNumber(ext.maxThirdPartyFailures)} sub="全站路由复现" variant="danger" />
          <MetricCard label="LCP 可观测" value={`${ext.lcpObservedSamples ?? 0}/${ext.lcpTotalSamples ?? 0}`} sub="0 样本可观测" variant="warn" />
        </div>
      </section>

      {/* 经营健康待采集维度 */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          经营健康层 G1-G4/G8/G10 · 待接入后台数据
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingGaps.map(({ key, icon, color }) => {
            const gap = gaps[key] as any;
            if (!gap) return null;
            const isCollected = gap.status === "collected" || gap.status === "partial";
            const steps = (gap.actionItems ?? []).slice(0, 3) as string[];
            return (
              <div key={key} className="card-compact">
                <div className="flex items-center gap-2 mb-2">
                  <Badge status={isCollected ? "collected" : "pending"} size="sm" />
                  <span className={`text-xs font-bold ${color}`}>{key.split("_")[0]}</span>
                  <span className="text-xs font-semibold text-neutral-800">{gap.label}</span>
                </div>
                <p className="text-xs text-neutral-600 mb-2">{gap.impactEstimate}</p>
                {steps.length > 0 && (
                  <ol className="text-xs text-neutral-500 space-y-0.5 list-decimal list-inside">
                    {steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
