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

  const dn = data?.diagnosticNarrative ?? {};
  const p3 = (dn.problems ?? []).find((p: any) => p.id === "P3");
  const p5 = (dn.problems ?? []).find((p: any) => p.id === "P5");

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">II · 指标口径 · P3 + P5</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          先修数字可信度，<br /><span className="text-danger-500">再讨论转化改善。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl leading-relaxed">
          本页解答 P3（弃单追回缺失）和 P5（归因系统失灵）。
          当前有 5 个数字不可信：CVR / 复购率 / 广告 ROAS / 新客增长率 / 历史对比趋势。
          弃单追回率 = 0%，每周期约 $14,000–$27,000 机会损失从未被触达。
        </p>
      </div>

      {p5 && (
        <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 overflow-hidden">
          <div className="px-4 py-3 bg-purple-100 border-b border-purple-200">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">P5 · 元问题：{p5.title}</span>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(p5.evidence ?? []).map((e: string, i: number) => (
                <div key={i} className="text-xs text-purple-800 flex gap-1.5">
                  <span className="text-purple-400 shrink-0">▸</span><span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-xl border-2 border-orange-400 bg-orange-50 overflow-hidden">
        <div className="px-5 py-3 bg-orange-400 flex items-center gap-2">
          <span className="text-white text-sm font-bold">⚡ Owner 现在可以做的 2 件事（解锁 P5 全部数字）</span>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">
              任务 1：FB Pixel 去重（5 分钟）
            </div>
            <p className="text-xs text-orange-900 mb-2">
              当前首页有 2 个不同 Pixel ID 同时触发，每笔订单被计算为 2 笔，广告 ROAS 虚高约 2x。
            </p>
            <ol className="text-xs text-orange-800 space-y-1 list-decimal list-inside">
              <li>Shopify Admin → Online Store → Preferences</li>
              <li>找到 Facebook Pixel 区域，记下所有 Pixel ID</li>
              <li>确认哪个是当前有效的广告账户 Pixel，删除另一个</li>
              <li>同时检查 theme.liquid 是否有硬编码的重复 Pixel</li>
            </ol>
          </div>
          <div>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">
              任务 2：分渠道 CVR 导出（30 分钟）
            </div>
            <p className="text-xs text-orange-900 mb-2">
              当前 CVR 2.4% 混淆了付费和自然流量，自然流量真实转化率未知。这是 C7 的核心修复。
            </p>
            <ol className="text-xs text-orange-800 space-y-1 list-decimal list-inside">
              <li>Shopify Admin → Analytics → Reports → Online Store Conversion Rate</li>
              <li>右上角 Breakdown → Traffic Source → 截图 Paid / Organic / Direct CVR</li>
              <li>再次 Breakdown → Device type → 截图 Desktop / Mobile CVR</li>
              <li>把数字发给 AI，立即更新诊断叙事</li>
            </ol>
          </div>
        </div>
      </div>


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
  const dn = data?.diagnosticNarrative ?? {};
  const p3 = (dn.problems ?? []).find((p: any) => p.id === "P3");
  const p5 = (dn.problems ?? []).find((p: any) => p.id === "P5");

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
