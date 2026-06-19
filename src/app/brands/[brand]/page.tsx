import { loadPublicCrossAudit, loadLatestSession } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatPercent, formatMs, formatKb, formatNumber, formatDate, relativeDate } from "@/lib/utils/format";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const data = loadPublicCrossAudit() as any;
  const session = loadLatestSession() as any;

  const ext = data?.external ?? {};
  const ops = data?.currentOperations ?? {};
  const hist = data?.historicalOperations ?? {};

  const conclusions = (data?.conclusions ?? []) as any[];
  const gaps = data?.diagnosticGaps360?.gaps ?? {};

  return (
    <div className="p-8 max-w-container">

      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">
          I · 总览 · {formatDate(data?.generatedAt)}
        </div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          真实经营数据回归，<br />
          <span className="text-primary-500">关键风险收敛。</span>
        </h1>
        <p className="text-neutral-600 text-base max-w-2xl">
          采集-诊断-洞察-优化-执行决策全链路。
          最新外部采集：<span className="font-medium text-neutral-800">{ext.latestSession}</span>
          {session && <> · {relativeDate(session.observedAt)}</>}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">经营漏斗（当前 workbook）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="整体转化率"
            value={formatPercent(ops.conversion?.conversionRate)}
            sub="当前 workbook · 含口径风险"
            variant="default"
          />
          <MetricCard
            label="加购率"
            value={formatPercent(ops.conversion?.addToCartRate)}
            sub="访客→加购"
          />
          <MetricCard
            label="平均订单价值"
            value={ops.sales?.averageOrderValue ? `$${ops.sales.averageOrderValue.toFixed(0)}` : "—"}
            sub="AOV · 当前窗口"
          />
          <MetricCard
            label="复购率"
            value={formatPercent(ops.sales?.repurchaseRate)}
          sub={`Attach rate: ${formatPercent(ops.sales?.attachRate)}`}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">技术病灶（外部采集 · {ext.latestSession}）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="首页 TTFB"
            value={formatMs(ext.homepageTtfbDesktopMs)}
            sub="桌面端 · 非主因"
            variant="success"
          />
          <MetricCard
            label="首页 JS 体积"
            value={formatKb(ext.homepageJsKb)}
            sub={`PDP 最高: ${formatKb(ext.pdpJsKb)}`}
            variant="danger"
          />
          <MetricCard
            label="最大 DOM 节点"
            value={formatNumber(ext.maxDomNodes)}
            sub="PDP watchlist 最高"
            variant="danger"
          />
          <MetricCard
            label="LCP 可观测"
            value={`${ext.lcpObservedSamples ?? 0} / ${ext.lcpTotalSamples ?? 0}`}
            sub="全路由-视口样本均未观测"
            variant="warn"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <MetricCard
            label="第三方失败（最高）"
            value={formatNumber(ext.maxThirdPartyFailures)}
            sub={`PDP: ${ext.pdpThirdPartyFailures ?? "—"}`}
            variant="danger"
          />
          <MetricCard
            label="PDP Watchlist"
            value={`${data?.internal?.pdpWatchlistCount ?? 0} 个`}
            sub="首轮双视口采集已完成"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">关键结论</h2>
        <div className="space-y-3">
          {conclusions.map((c: any) => (
            <div key={c.id} className="card-compact flex gap-4 items-start">
              <div className="mt-0.5">
                <Badge grade={c.confidence === "High" ? "A" : c.confidence === "Medium" ? "B" : "C"}>
                  {c.id}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 text-sm mb-0.5">{c.issue}</div>
                <div className="text-xs text-neutral-600 leading-relaxed">{c.verdict?.slice(0, 120)}…</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          360 框架状态 · {data?.diagnosticGaps360?.coveredDimensions ?? 9} / {data?.diagnosticGaps360?.totalDimensions ?? 20} 维度覆盖
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(gaps).map(([key, gap]: [string, any]) => (
            <div key={key} className="card-compact flex items-center gap-3">
              <Badge status={gap.status === "collected" ? "collected" : gap.status === "partial" ? "warn" : "pending"} size="sm" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-neutral-800 truncate">{gap.label}</div>
                <div className="text-[10px] text-neutral-500">{key.split("_")[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
