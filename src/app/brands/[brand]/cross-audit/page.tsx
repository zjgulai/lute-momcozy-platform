import { loadPublicCrossAudit } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { formatNumber } from "@/lib/utils/format";

export default async function CrossAuditPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const conclusions = (data?.conclusions ?? []) as any[];
  const crossMatrix = data?.finalAudit?.crossMatrix ?? [];
  const contradictions = data?.finalAudit?.contradictions ?? [];
  const execOrders = data?.decisionArchitecture?.executionOrders ?? [];
  const hardConclusions = data?.decisionArchitecture?.hardConclusions ?? [];
  const geo = data?.geoBaseline ?? {};
  const gaps = data?.diagnosticGaps360?.gaps ?? {};
  const geoMethodology = data?.geoTestingMethodology ?? {};
  const geoCategories = (geoMethodology.proposedFramework?.categories ?? []) as any[];
  const geoKPIs = geoMethodology.quarterlySOPTemplate?.targetKPIs ?? {};
  const geoContentGaps = (geoMethodology.priorityContentGaps ?? []) as any[];

  const confBadge = (c: string) => c === "High" ? "A" as const : c === "Medium" ? "B" as const : "C" as const;

  const geoRows = (geo.questions ?? []).map((q: any) => [
    <span className="text-xs font-mono">{q.id}</span>,
    <span className="text-xs">{q.question?.slice(0, 50)}…</span>,
    q.momcozyMentioned ? <Badge status="collected" size="sm">出现</Badge> : <Badge status="pending" size="sm">未出现</Badge>,
    <span className="text-xs text-neutral-600">{q.momcozyPosition ?? "—"}</span>,
    <span className="text-xs font-medium">{q.topRecommendation?.slice(0, 30)}</span>,
  ]);

  const p7 = (data?.diagnosticNarrative?.problems ?? []).find((p: any) => p.id === "P7");

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">V · 决策矩阵 · P7</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          SEO/GEO 双重盲区——<br /><span className="text-danger-500">品牌增长天花板正在关闭。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl">
          本页解答 P7（SEO 架构缺陷 + GEO 叙事主权缺失）及所有已确认的硬结论与执行战单。
          0/5 AI 推荐获得 best overall；nursing-bra 品类 130 个分面 URL 正在浪费爬虫预算。
        </p>
      </div>

      {p7 && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
          <div className="px-4 py-3 bg-blue-100 border-b border-blue-200">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">P7 证据摘要</span>
          </div>
          <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {(p7.evidence ?? []).map((e: string, i: number) => (
              <div key={i} className="text-xs text-blue-800 flex gap-1.5">
                <span className="text-blue-400 shrink-0">▸</span><span>{e}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键结论 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">关键结论 ({conclusions.length})</h2>
        <div className="space-y-2">
          {conclusions.map((c: any) => (
            <div key={c.id} className="card-compact flex gap-3 items-start">
              <Badge grade={confBadge(c.confidence)} size="sm" className="shrink-0 mt-0.5">{c.id}</Badge>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">{c.issue}</div>
                <div className="text-xs text-neutral-600 mt-0.5">{c.verdict?.slice(0, 120)}…</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 硬结论 */}
      {hardConclusions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">硬结论（批准/冻结）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hardConclusions.map((h: any, i: number) => (
              <div key={i} className="card-compact border-l-4 border-primary-500">
                <div className="text-sm font-semibold text-neutral-900 mb-1">{h.title}</div>
                <div className="text-xs text-neutral-600">{h.why?.slice(0, 100)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GEO 基线 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          GEO 可见度基线 · Perplexity 实测 · {geo.testedAt ?? "2026-06-18"}
          <span className="ml-2"><Badge status="collected" size="sm" /></span>
        </h2>
        <div className="card-compact mb-4 bg-warning-100 border-warning-500">
          <p className="text-sm text-warning-700 font-medium">
            {geo.overallFinding?.slice(0, 200)}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <MetricCard label="问题覆盖" value={`${(geo.questions ?? []).filter((q: any) => q.momcozyMentioned).length}/${geo.questions?.length ?? 0}`} sub="均被提及" variant="success" />
          <MetricCard label="Best Overall" value="0 / 5" sub="从未获得首推" variant="danger" />
          <MetricCard label="AI 定位" value="Budget" sub="被固化为低价选项" variant="warn" />
        </div>
        <Table
          headers={["问题", "搜索词", "Momcozy 出现", "定位", "Best Overall"]}
          rows={geoRows}
          compact
        />
      </section>

      {/* 执行战单 */}
      {execOrders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">执行战单</h2>
          <div className="space-y-3">
            {execOrders.map((o: any, i: number) => (
              <div key={i} className="card-compact flex gap-4">
                <div className="shrink-0">
                  <div className="text-xs font-mono text-neutral-500">{o.window}</div>
                  <div className="text-xs font-semibold text-neutral-700 mt-1">{o.owner?.slice(0, 20)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{o.action}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">验收：{o.gate?.slice(0, 80)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {geoCategories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            GEO 测试升级方案 · 从 5题单引擎 → 20题×3引擎标准框架
          </h2>

          <div className="card-compact mb-4 bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>当前基线缺陷</strong>：{geoMethodology.currentBaseline?.limitation}。
            建议升级为 {geoMethodology.proposedFramework?.totalQuestions} 个问题 ×{" "}
            {geoMethodology.proposedFramework?.enginesRequired?.join("/")} 三引擎测试。
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {geoCategories.map((cat: any, i: number) => (
              <div key={i} className="card-compact">
                <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  {cat.type}（{cat.count}题）
                </div>
                <div className="space-y-1">
                  {cat.examples.slice(0, 2).map((ex: string, j: number) => (
                    <div key={j} className="text-[10px] text-neutral-600 bg-neutral-50 rounded px-1.5 py-1">
                      {ex.slice(0, 45)}
                    </div>
                  ))}
                  {cat.examples.length > 2 && (
                    <div className="text-[10px] text-neutral-400">+{cat.examples.length - 2} 更多…</div>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-primary-600">{cat.goal?.slice(0, 50)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="card-compact">
              <div className="text-[10px] font-bold text-neutral-500 uppercase mb-2">季度复测目标 KPI</div>
              <div className="space-y-1">
                {Object.entries(geoKPIs).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-neutral-600">{key.replace(/Target$/, "").replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="font-semibold text-primary-700">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-compact">
              <div className="text-[10px] font-bold text-neutral-500 uppercase mb-2">优先内容缺口（GEO 叙事主权）</div>
              <div className="space-y-2">
                {geoContentGaps.map((gap: any, i: number) => (
                  <div key={i} className={`rounded p-2 text-[10px] ${
                    gap.scenario === "保险渠道" ? "bg-red-50 border border-red-200" :
                    gap.scenario === "职场场景" ? "bg-orange-50 border border-orange-200" :
                    "bg-blue-50 border border-blue-200"
                  }`}>
                    <div className="font-bold mb-0.5">{gap.scenario} — {gap.currentGeoStatus}</div>
                    <div className="text-neutral-600">{gap.contentNeeded?.slice(0, 80)}</div>
                    <div className="text-neutral-500 mt-0.5">预计见效：{gap.estimatedTimeToRank}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-compact bg-neutral-50">
            <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1">
              季度复测 SOP · {geoMethodology.quarterlySOPTemplate?.frequency} · 约{geoMethodology.quarterlySOPTemplate?.estimatedTime}
            </div>
            <ol className="space-y-0.5">
              {(geoMethodology.quarterlySOPTemplate?.steps ?? []).map((s: string, i: number) => (
                <li key={i} className="text-[10px] text-neutral-600 flex gap-1.5">
                  <span className="text-primary-500 font-bold shrink-0">{i + 1}.</span><span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {contradictions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">决策冲突处理 ({contradictions.length})</h2>
          <Table
            headers={["冲突", "业务风险", "处理方式", "验收"]}
            rows={contradictions.map((c: any) => [
              <span className="text-sm font-medium">{c.issue}</span>,
              <span className="text-xs text-neutral-600">{c.diagnosis?.slice(0, 60)}</span>,
              <span className="text-xs">{c.fix?.slice(0, 60)}</span>,
              <span className="text-xs text-neutral-500">{c.proof?.slice(0, 40)}</span>,
            ])}
            compact
          />
        </section>
      )}
    </div>
  );
}
