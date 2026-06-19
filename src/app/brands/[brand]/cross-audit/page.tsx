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

  const confBadge = (c: string) => c === "High" ? "A" as const : c === "Medium" ? "B" as const : "C" as const;

  const geoRows = (geo.questions ?? []).map((q: any) => [
    <span className="text-xs font-mono">{q.id}</span>,
    <span className="text-xs">{q.question?.slice(0, 50)}…</span>,
    q.momcozyMentioned ? <Badge status="collected" size="sm">出现</Badge> : <Badge status="pending" size="sm">未出现</Badge>,
    <span className="text-xs text-neutral-600">{q.momcozyPosition ?? "—"}</span>,
    <span className="text-xs font-medium">{q.topRecommendation?.slice(0, 30)}</span>,
  ]);

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">V · 决策矩阵</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          历史报告为基线，<br /><span className="text-primary-500">当前只留行动。</span>
        </h1>
      </div>

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

      {/* 冲突处理 */}
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
