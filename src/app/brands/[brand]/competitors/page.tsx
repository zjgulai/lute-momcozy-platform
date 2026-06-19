import { loadPublicCrossAudit, loadLatestCompetitors } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { formatNumber } from "@/lib/utils/format";

export default async function CompetitorsPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const compData = loadLatestCompetitors() as any;
  const competitors = (compData?.competitors ?? []) as any[];
  const compEvidence = data?.competitorEvidence ?? {};

  const getMetric = (comp: any, route: string, vp: string, key: string) => {
    const page = comp.pages?.find((p: any) => p.routeId === route);
    const viewport = page?.viewports?.find((v: any) => v.label === vp);
    return viewport?.metrics?.[key] ?? null;
  };

  const compRows = competitors.map((c: any) => {
    const homepageDesktop3p = getMetric(c, "homepage", "desktop", "thirdPartyFailures");
    const pdpDesktop3p = getMetric(c, "pdp", "desktop", "thirdPartyFailures");
    const homepageJsKb = getMetric(c, "homepage", "desktop", "jsKb");
    const cartReachable = c.pages?.find((p: any) => p.routeId === "cart")?.status === 200;
    const robotsOk = c.robots?.sitemapCount > 0;

    return [
      <span className="font-semibold text-sm">{c.label}</span>,
      <span className={`text-sm font-mono ${(homepageDesktop3p ?? 0) > 40 ? "text-danger-500 font-semibold" : "text-success-700"}`}>
        {homepageDesktop3p ?? "—"}
      </span>,
      <span className={`text-sm font-mono ${(homepageJsKb ?? 0) > 800 ? "text-warning-500" : "text-success-700"}`}>
        {homepageJsKb ? `${homepageJsKb}KB` : "—"}
      </span>,
      cartReachable ? <Badge status="collected" size="sm">可达</Badge> : <Badge status="pending" size="sm">不可达</Badge>,
      robotsOk ? <Badge status="collected" size="sm">✓ Sitemap</Badge> : <Badge status="missing" size="sm">—</Badge>,
    ];
  });

  const momcozyRow = [
    <span className="font-semibold text-sm text-primary-500">Momcozy（自站）</span>,
    <span className="text-danger-500 font-semibold font-mono">92 ⚠</span>,
    <span className="text-danger-500 font-semibold font-mono">1903KB ⚠</span>,
    <Badge status="collected" size="sm">可达</Badge>,
    <Badge status="collected" size="sm">✓</Badge>,
  ];

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">VI · 竞品对比</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          竞品不是借口，<br /><span className="text-primary-500">是预算上限。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl">
          {compEvidence.competitorCount ?? 6} 站 · {compEvidence.sampledPageCount ?? 18} 页面 · {compEvidence.viewportSampleCount ?? 24} 视口 · {compEvidence.observedAt ?? "2026-06-18"}
        </p>
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="竞品最高 3P 失败" value={compEvidence.maxThirdPartyFailures?.replace?.("(", "\n(")?.split("\n")?.[0] ?? "42"} sub="babybrezza pdp mobile" />
          <MetricCard label="竞品最高 JS" value={compEvidence.maxJsKb?.split(" ")?.[0] ?? "1000KB"} sub="babybuddha pdp desktop" />
          <MetricCard label="Momcozy 3P 失败" value="92" sub="高于竞品上限 2.2×" variant="danger" />
          <MetricCard label="Momcozy JS" value="1903KB" sub="高于竞品上限 1.9×" variant="danger" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">技术指标横向对比</h2>
        <Table
          headers={["品牌", "首页 3P 失败", "首页 JS", "Cart 可达", "Robots/Sitemap"]}
          rows={[momcozyRow, ...compRows]}
        />
        <p className="text-xs text-neutral-400 mt-2">
          * Momcozy 数据来自 session-2026-06-17；竞品来自 competitor-recollect-2026-06-18。首轮样本，不可作为最终分值化对标。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">SEO 技术对比</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data?.seoTechnical?.competitorComparison ?? []).map((c: any, i: number) => (
            <div key={i} className="card-compact">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{c.brand}</span>
                {c.status === "404" && <Badge status="fail" size="sm">URL 失效</Badge>}
              </div>
              {c.assessment && <p className="text-xs text-neutral-600">{c.assessment}</p>}
              {c.reviewCount && (
                <div className="mt-2 text-xs text-neutral-500">
                  评论: <span className="font-semibold text-neutral-800">{c.reviewCount}</span> · {c.ratingValue}★
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">竞品执行记录</h2>
        <div className="card-compact bg-neutral-50">
          <div className="text-xs text-neutral-600 space-y-1">
            <div>✅ 竞品 PDP 可达: {compEvidence.reachablePdpCount ?? 6}/{compEvidence.competitorCount ?? 6}</div>
            <div>✅ Cart 可达: {compEvidence.reachableCartCount ?? 5}/{compEvidence.competitorCount ?? 6}（Elvie cart 404）</div>
            <div>✅ robots.txt OK: {compEvidence.robotsOkCount ?? 5}/{compEvidence.competitorCount ?? 6}</div>
            <div>✅ 有 Sitemap: {compEvidence.robotsWithSitemapCount ?? 5}/{compEvidence.competitorCount ?? 6}</div>
            <div>⚠️ 竞品上限后 多次复采 + owner表 + checkout状态 补齐才可恢复分值化对标</div>
          </div>
        </div>
      </section>
    </div>
  );
}
