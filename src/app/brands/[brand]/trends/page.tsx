import { loadPublicCrossAudit, loadLatestSession, loadAllSessions } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatKb, formatNumber } from "@/lib/utils/format";
import { TrendsChartsWrapper } from "@/components/charts/TrendsChartsWrapper";

export default async function TrendsPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const session = loadLatestSession() as any;
  const sessions = loadAllSessions() as any[];
  const ext = data?.external ?? {};
  const lcpNote = data?.lcpMethodologyNote ?? {};

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">IV · 趋势证据</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          趋势必须和<br /><span className="text-primary-500">经营 caveat 一起读。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl leading-relaxed">
          {sessions.length} 次采集 · 最新：<span className="font-medium text-neutral-800">{session?.observedAt ?? "—"}</span>
          · {session?.methodologyVersion ?? ""}。
          LCP {ext.lcpObservedSamples ?? 0}/{ext.lcpTotalSamples ?? 0} 样本可观测，JS / DOM / 3P 失败是当前可信主证据。
        </p>
      </div>

      <section className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="采集次数" value={`${sessions.length} 次`} sub="2026-03 → 2026-06" />
          <MetricCard
            label="3P 失败最高"
            value={formatNumber(ext.maxThirdPartyFailures)}
            sub="最新采集 · PDP max"
            variant="danger"
          />
          <MetricCard
            label="首页 JS 体积"
            value={formatKb(ext.homepageJsKb)}
            sub={`PDP 最高: ${formatKb(ext.pdpJsKb)}`}
            variant="danger"
          />
          <MetricCard
            label="LCP 可观测"
            value={`${ext.lcpObservedSamples ?? 0}/${ext.lcpTotalSamples ?? 0}`}
            sub="全路由 CSS background 根因"
            variant="warn"
          />
        </div>
      </section>

      {lcpNote.issue && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
          <strong>⚠️ 图表数据说明：</strong>
          {" "}{lcpNote.rootCause}
          {" "}3P 失败 / JS / DOM 是当前可信的主趋势指标；已修复采集脚本（{lcpNote.fix}）。
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          技术指标趋势（{sessions.length} 次采集）
        </h2>
        <TrendsChartsWrapper sessions={sessions} latestSession={session} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">融合结论</h2>
        <div className="card-compact bg-neutral-900 text-neutral-100">
          <p className="text-sm leading-relaxed">
            最新数据没有推翻历史站的主判断——问题已从首页推进到「homepage / PDP watchlist / cart / checkout 路径均复现」。
            客户端体积最大 {((ext.homepageJsKb ?? 0) / 1024).toFixed(1)}MB、DOM 最大 {formatNumber(ext.maxDomNodes)} 节点、
            第三方失败最大 {ext.maxThirdPartyFailures} 次（竞品上限 23 次），仍是核心技术债。
            LCP 不可观测是 Shopify 主题架构问题（hero 图片 CSS background），不影响其余指标可信度。
          </p>
        </div>
      </section>
    </div>
  );
}
