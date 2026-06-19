import { loadPublicCrossAudit, loadLatestSession } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { formatNumber, formatDate } from "@/lib/utils/format";

export default async function ForensicsPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const ext = data?.external ?? {};
  const sec = data?.securityAudit ?? {};
  const seo = data?.seoTechnical ?? {};
  const gaps = data?.diagnosticGaps360?.gaps ?? {};
  const backlog = (data?.legacyRecovery?.diagnosticBacklog ?? []) as any[];
  const playbookCards = (data?.legacyRecovery?.playbookCards ?? []) as any[];
  const g9 = gaps.G9_pdp_content_depth ?? {};
  const g11 = gaps.G11_seo_architecture ?? {};
  const g6 = gaps.G6_review_ecosystem ?? {};
  const g5 = gaps.G5_inventory ?? {};
  const g7 = gaps.G7_checkout_business ?? {};
  const g7cs = g7.collectedSignals ?? {};

  const attackRows = (sec.attackSurfacePriority ?? []).map((item: any) => [
    <Badge grade={item.rank === "P0" ? "F" : item.rank === "P1" ? "D" : "C"} size="sm">{item.rank}</Badge>,
    <span className="font-medium text-sm">{item.vector}</span>,
    <span className="text-xs text-neutral-600">{item.evidence?.slice(0, 80)}</span>,
    <span className="text-xs text-neutral-700">{item.recommendation?.slice(0, 80)}</span>,
  ]);

  const backlogP0 = backlog.filter((b: any) => b.priority === "P0");
  const backlogP1 = backlog.filter((b: any) => b.priority === "P1");

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">III · 风险归因</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          归属先行，<br /><span className="text-primary-500">再处理脚本与 PDP。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl leading-relaxed">
          第三方脚本治理 · PDP watchlist · SEO 技术底座 · 安全攻击面 · 内容深度。
          外部采集：<span className="font-medium text-neutral-800">{ext.latestSession}</span>
        </p>
      </div>

      {/* 关键数字 */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="3P 失败最高" value={formatNumber(ext.maxThirdPartyFailures)} sub="PDP watchlist max" variant="danger" />
          <MetricCard label="DOM 最大" value={formatNumber(ext.maxDomNodes)} sub="PDP Mobile Flow" variant="danger" />
          <MetricCard label="CSP 安全头" value="3 / 7" sub="缺少 script-src" variant="warn" />
          <MetricCard label="外部脚本无 SRI" value="359+" sub="全站供应链注入风险" variant="danger" />
        </div>
      </section>

      {/* 安全攻击面 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          安全攻击面 · 被动扫描 · {sec.scannedAt ?? "2026-06-18"}
        </h2>
        <div className="card-compact mb-4 text-sm">
          <p className="text-neutral-700">{sec.summary?.slice(0, 200)}</p>
        </div>
        <Table
          headers={["优先级", "攻击向量", "证据", "建议"]}
          rows={attackRows}
        />
      </section>

      {/* PDP 内容深度 G9 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          G9 PDP 内容深度 · <Badge status="collected" size="sm" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MetricCard label="信任信号首屏" value="0 / 5" sub="全部 PDP 非首屏" variant="danger" />
          <MetricCard label="CTA 首屏" value="2 / 5" sub="仅 TuckGo/KleanPal" variant="warn" />
          <MetricCard label="安全认证" value="1 / 5" sub="仅 Mobile Flow" variant="warn" />
          <MetricCard label="FAQ 覆盖" value="8-22 条" sub="全部有 FAQ ✅" variant="success" />
        </div>
        {(g9.keyFindings ?? []).length > 0 && (
          <ul className="space-y-1">
            {(g9.keyFindings as string[]).map((f, i) => (
              <li key={i} className="text-xs text-neutral-600 flex gap-2">
                <span className={f.startsWith("CRITICAL") ? "text-danger-500 font-semibold" : "text-neutral-400"}>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SEO 架构 G11 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          G11 SEO 架构 · <Badge status="collected" size="sm" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <MetricCard label="品类页内容" value="4 字" sub="electric-breast-pump（目标 400+）" variant="danger" />
          <MetricCard label="分面导航 URL" value="130 个" sub="nursing-bra 爬虫预算浪费" variant="danger" />
          <MetricCard label="面包屑 Schema" value="全部 ✅" sub="所有 PDP 正确声明" variant="success" />
        </div>
        {(g11.keyFindings ?? []).length > 0 && (
          <ul className="space-y-1">
            {(g11.keyFindings as string[]).map((f, i) => (
              <li key={i} className="text-xs text-neutral-600 flex gap-2">
                <span className={f.startsWith("CRITICAL") ? "text-danger-500 font-semibold" : "text-neutral-400"}>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 评论生态 G6 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          G6 评论生态 · <Badge status="collected" size="sm" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(g6.collectedSignals ?? {}).map(([sku, d]: [string, any]) => (
            <div key={sku} className="card-compact">
              <div className="text-xs font-semibold text-neutral-700 mb-1">{sku.replace(/_/g, " ")}</div>
              <div className="metric-number text-lg">{d.reviewCount ?? "—"}</div>
              <div className="text-xs text-neutral-500">{d.ratingValue ?? "—"}★ · {d.hasPhotoReviews ? "有图片评论" : "—"}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          G7 结账链路 · <Badge status="collected" size="sm" />
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <MetricCard
            label="快捷支付"
            value="0 / 3"
            sub="Shop Pay / Apple Pay / Google Pay 匿名态未检测到"
            variant="warn"
          />
          <MetricCard
            label="Klarna / Afterpay"
            value="✅ 已集成"
            sub="先买后付，高 AOV 促成"
            variant="success"
          />
          <MetricCard
            label="HSA/FSA / 保险"
            value="✅ 已集成"
            sub="母婴品类核心渠道"
            variant="success"
          />
          <MetricCard
            label="表单字段数"
            value={String(g7cs.formFieldCount ?? "—")}
            sub={`运费早期可见: ${g7cs.shippingCostEarlyVisible ? "✅" : "❌"}`}
          />
        </div>
        {(g7.keyFindings ?? []).length > 0 && (
          <ul className="space-y-1">
            {(g7.keyFindings as string[]).map((f: string, i: number) => (
              <li key={i} className="text-xs text-neutral-600 flex gap-2">
                <span className="text-neutral-400">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-neutral-400 mt-2">
          ⚠️ Shop Pay / Apple Pay / Google Pay 在匿名空购物车状态未检测到，需 owner storage state 复采确认
        </p>
      </section>

      {/* 诊断 Backlog */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">诊断 Backlog · P0/P1</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...backlogP0, ...backlogP1].slice(0, 10).map((item: any, i) => (
            <div key={i} className="card-compact flex gap-3">
              <Badge grade={item.priority === "P0" ? "F" : "D"} size="sm" className="mt-0.5 shrink-0">{item.priority}</Badge>
              <div>
                <div className="text-sm font-medium text-neutral-800">{item.item}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{item.evidence?.slice(0, 80)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
