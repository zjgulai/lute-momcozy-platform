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
  const g7 = gaps.G7_checkout_business ?? {};
  const g9 = gaps.G9_pdp_content_depth ?? {};
  const g11 = gaps.G11_seo_architecture ?? {};
  const g6 = gaps.G6_review_ecosystem ?? {};
  const g5 = gaps.G5_inventory ?? {};
  const g7cs = g7.collectedSignals ?? {};

  const attackRows = (sec.attackSurfacePriority ?? []).map((item: any) => [
    <Badge grade={item.rank === "P0" ? "F" : item.rank === "P1" ? "D" : "C"} size="sm">{item.rank}</Badge>,
    <span className="font-medium text-sm">{item.vector}</span>,
    <span className="text-xs text-neutral-600">{item.evidence?.slice(0, 80)}</span>,
    <span className="text-xs text-neutral-700">{item.recommendation?.slice(0, 80)}</span>,
  ]);

  const dn = data?.diagnosticNarrative ?? {};
  const p1 = (dn.problems ?? []).find((p: any) => p.id === "P1");
  const p2 = (dn.problems ?? []).find((p: any) => p.id === "P2");
  const p4 = (dn.problems ?? []).find((p: any) => p.id === "P4");
  const p6 = (dn.problems ?? []).find((p: any) => p.id === "P6");
  const p8 = (dn.problems ?? []).find((p: any) => p.id === "P8");

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">III · 风险归因 · P1 P2 P4 P6 P8</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          漏斗两端同时失血，<br /><span className="text-danger-500">根因在 PDP 和技术负担。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl leading-relaxed">
          本页解答 P1（漏斗前端失血）、P2（漏斗后端失血）、P4（PDP 内容阻塞）、
          P6（技术负担超载）、P8（供应链安全）。5 个问题共享同一根因：
          用户在看到购买理由之前就已经流失了。
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {[p2, p1].filter(Boolean).map((p: any) => (
          <div key={p.id} className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
            <div className="px-4 py-2 bg-red-100 border-b border-red-200 flex items-center justify-between">
              <span className="text-xs font-bold text-red-700">{p.id} · {p.layer}</span>
              {p.lossEstimate?.value_usd && (
                <span className="text-sm font-bold text-red-600">${p.lossEstimate.value_usd.toLocaleString()} 机会</span>
              )}
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-neutral-800 mb-2">{p.scqa?.c}</p>
              <div className="space-y-1">
                {(p.evidence ?? []).slice(0, 2).map((e: string, i: number) => (
                  <div key={i} className="text-xs text-red-700 flex gap-1.5">
                    <span className="shrink-0">▸</span><span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
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

      {p6 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
            P6 技术负担 · 竞品对标 · {p6.competitorBenchmark ? "10竞品数据" : ""}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {(p6.competitorBenchmark ? [
              { label: "3P 失败超标", momcozy: "92次", competitor: "23次 (eufy)", ratio: "4.0×" },
              { label: "DOM 节点超标", momcozy: "11,742", competitor: "6,966 (eufy PDP)", ratio: "1.7×" },
              { label: "Medela 基准", momcozy: "2,212KB JS", competitor: "176KB", ratio: "12.6×" },
            ] : []).map((row, i) => (
              <div key={i} className="card-compact border border-danger-200 bg-danger-50">
                <div className="text-[10px] font-bold text-danger-600 uppercase tracking-widest mb-1">{row.label} {row.ratio}</div>
                <div className="text-sm font-bold text-neutral-900">{row.momcozy}</div>
                <div className="text-xs text-neutral-500">竞品：{row.competitor}</div>
              </div>
            ))}
          </div>
          {(p6.newInsights ?? []).map((insight: string, i: number) => (
            <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1">
              <span className="text-danger-400 shrink-0">▸</span><span>{insight}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
