import { loadPublicCrossAudit, loadLatestCompetitors } from "@/lib/data/loader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";

export default async function CompetitorsPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const compData = loadLatestCompetitors() as any;
  const competitors = (compData?.competitors ?? []) as any[];
  const compEvidence = data?.competitorEvidence ?? {};
  const geoLandscape = data?.geoCompetitorLandscape ?? {};
  const geoComps = (geoLandscape.competitors ?? []) as any[];
  const p6 = (data?.diagnosticNarrative?.problems ?? []).find((p: any) => p.id === "P6");

  const getMetric = (comp: any, route: string, vp: string, key: string) => {
    const page = comp.pages?.find((p: any) => p.routeId === route);
    const viewport = page?.viewports?.find((v: any) => v.label === vp);
    return viewport?.metrics?.[key] ?? null;
  };

  const getAllMetric = (comp: any, key: string): number | null => {
    const vals: number[] = [];
    for (const page of comp.pages ?? []) {
      for (const vp of page.viewports ?? []) {
        const v = vp.metrics?.[key];
        if (v != null) vals.push(v);
      }
    }
    return vals.length ? Math.max(...vals) : null;
  };

  const is503 = (comp: any) =>
    (comp.pages ?? []).some((p: any) => String(p.status ?? "").startsWith("503"));

  const compRows = competitors.map((c: any) => {
    const hp3p = getMetric(c, "homepage", "desktop", "thirdPartyFailures");
    const hpJs = getMetric(c, "homepage", "desktop", "jsKb");
    const cartReachable = c.pages?.find((p: any) => p.routeId === "cart")?.status === 200;
    const blocked = is503(c);

    return [
      <div>
        <span className="font-semibold text-sm">{c.label}</span>
        {blocked && <div className="text-[10px] text-neutral-400 mt-0.5">503 部分页面 · bot防护</div>}
      </div>,
      <span className={`text-sm font-mono ${(hp3p ?? 0) > 20 ? "text-warning-500" : "text-success-700"}`}>
        {hp3p ?? "—"}
      </span>,
      <span className={`text-sm font-mono ${(hpJs ?? 0) > 800 ? "text-warning-500" : "text-success-700"}`}>
        {hpJs ? `${hpJs}KB` : blocked ? <span className="text-neutral-400">503</span> : "—"}
      </span>,
      cartReachable
        ? <Badge status="collected" size="sm">可达</Badge>
        : <Badge status="pending" size="sm">{blocked ? "503" : "不可达"}</Badge>,
      c.robots?.sitemapCount > 0
        ? <Badge status="collected" size="sm">✓ Sitemap</Badge>
        : <Badge status="missing" size="sm">—</Badge>,
    ];
  });

  const momcozyRow = [
    <span className="font-semibold text-sm text-primary-500">Momcozy（自站）</span>,
    <span className="text-danger-500 font-semibold font-mono">92 ⚠ (4.0×上限)</span>,
    <span className="text-danger-500 font-semibold font-mono">1903KB</span>,
    <Badge status="collected" size="sm">可达</Badge>,
    <Badge status="collected" size="sm">✓</Badge>,
  ];

  const freqStars = (f: string) =>
    f === "very_high" ? "★★★★★" : f === "high" ? "★★★★" : "★★★";
  const segLabel = (s: string) =>
    ({ premium: "高端", mid_to_premium: "中高", mid: "中端", budget_to_mid: "中低", budget: "预算" }[s] ?? s);

  const geoRows = geoComps.map((c: any) => [
    <div>
      <span className="font-semibold text-sm">{c.label}</span>
      <div className="text-[10px] text-neutral-400">{c.domain}</div>
    </div>,
    <span className="text-sm">{c.category}</span>,
    <span className="text-sm text-amber-500">{freqStars(c.geoFrequency)}</span>,
    <Badge
      grade={c.priceSegment === "premium" || c.priceSegment === "mid_to_premium" ? "A" : c.priceSegment === "mid" ? "B" : "C"}
      size="sm"
    >
      {segLabel(c.priceSegment)}
    </Badge>,
    <span className="text-xs text-neutral-600">{c.geoRole?.slice(0, 50)}</span>,
  ]);

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">VI · 竞品对比</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          竞品不是借口，<br /><span className="text-danger-500">是照妖镜。</span>
        </h1>
        <p className="text-neutral-600 text-sm max-w-2xl">
          {compEvidence.currentCompetitorCount ?? 10} 站已采集 · {geoLandscape.updatedAt ?? "2026-06-19"} GEO侦查 ·
          10竞品数据揭示：Momcozy 的技术负担不是行业宿命，是可以修复的选择。
        </p>
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="竞品新上限 3P失败"
            value={compEvidence.maxThirdPartyFailures?.split(" ")?.[0] ?? "23"}
            sub="eufy homepage · 10竞品基准"
          />
          <MetricCard
            label="Momcozy 3P 失败"
            value="92"
            sub="超出新竞品上限 4.0×"
            variant="danger"
          />
          <MetricCard
            label="Medela JS 体积"
            value="176KB"
            sub="全球最大母婴品牌 · Momcozy的1/12.6"
            variant="success"
          />
          <MetricCard
            label="Freemie DOM 节点"
            value="1,124"
            sub="Momcozy预算替代竞品 · Momcozy的1/10"
            variant="success"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          10竞品核心洞察 — 颠覆「重脚本是行业宿命」的假设
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2">🔴 Momcozy 3P失败超标 4.0×</div>
            <p className="text-sm text-red-900 font-semibold mb-1">92次 vs 竞品新上限 23次（eufy）</p>
            <p className="text-xs text-red-700">
              旧结论（6竞品）是超标 2.2×，10竞品数据更严峻：eufy 才是真实行业上限 23次，
              BabyBreeza 42次是异常值（现已部署bot防护，退出正常测量范围）。
              Momcozy 超标倍数从 2.2× 升级为 <strong>4.0×</strong>。
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">✅ Medela 证伪「品类宿命论」</div>
            <p className="text-sm text-green-900 font-semibold mb-1">Medela JS 仅 176KB = Momcozy 的 1/12.6</p>
            <p className="text-xs text-green-800">
              Medela 是全球最大母婴品牌，产品线比 Momcozy 更复杂，但 JS 体积只有 176KB。
              「母婴品类必须重脚本」这个借口彻底失效。
              Momcozy 的 2,212KB JS 是选择，不是宿命。
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">⚡ Freemie 体验反超 Momcozy</div>
            <p className="text-sm text-amber-900 font-semibold mb-1">DOM 1,090 vs Momcozy 11,742 = 10× 差距</p>
            <p className="text-xs text-amber-800">
              Freemie 是 GEO 侦查确认的「Momcozy 预算替代竞品」，用户选它因为便宜。
              但 Freemie 网站 DOM 仅 1,090，比 Momcozy 轻 10 倍。
              在「便宜」场景的 AI 推荐中，Freemie 网站体验优于 Momcozy。
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-2">🤖 3个竞品已部署Bot防护</div>
            <p className="text-sm text-neutral-800 font-semibold mb-1">Spectra / BEABA / BabyBreeza 全部 503</p>
            <p className="text-xs text-neutral-700">
              三个竞品在本次采集中返回 503，已部署反爬机制。
              Momcozy 当前无任何 bot 防护，竞品价格情报爬虫可自由采集定价数据。
              同时意味着「竞品上限」中已排除了最重的脚本竞品（BabyBreeza），
              Momcozy 的超标更加突出。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          GEO 竞品格局 · {geoComps.length} 品牌 · AI推荐频次
        </h2>
        <div className="card-compact mb-3 bg-warning-50 border border-warning-200">
          <p className="text-xs text-warning-800">
            <strong>Momcozy GEO 现状</strong>：5/5 问题均被提及，但 <strong>0/5 获得 best overall</strong>。
            突破方向：{(geoLandscape.momcozyPositioning?.targetScenarios ?? []).join(" · ")}
          </p>
        </div>
        <Table
          headers={["品牌", "类别", "GEO 频次", "价格段", "在 AI 推荐中的角色"]}
          rows={geoRows}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          技术指标横向对比（{competitors.length} 个竞品，首页数据）
        </h2>
        <Table
          headers={["品牌", "首页 3P 失败", "首页 JS", "Cart 可达", "Robots"]}
          rows={[momcozyRow, ...compRows]}
        />
        <p className="text-xs text-neutral-400 mt-2">
          Momcozy 数据：session-2026-06-17。竞品：{compEvidence.latestSnapshot}。
          Spectra/BEABA/BabyBreeza 部分或全部页面返回 503（已部署bot防护）。
          首轮样本，不可作为最终分值化结论。
        </p>
      </section>

      {(data?.seoTechnical?.competitorComparison ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">SEO 技术对比</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data.seoTechnical.competitorComparison ?? []).map((c: any, i: number) => (
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
      )}

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">采集状态</h2>
        <div className="card-compact bg-neutral-50">
          <div className="text-xs text-neutral-600 space-y-1">
            <div>✅ 已采集: {compEvidence.currentCompetitorCount ?? 10} 个竞品（{compEvidence.latestSnapshot}）</div>
            <div>✅ PDP 可达: {compEvidence.reachablePdpCount ?? 7}/{compEvidence.currentCompetitorCount ?? 10}（Spectra/BEABA/BabyBreeza PDP 503）</div>
            <div>✅ Cart 可达: {compEvidence.reachableCartCount ?? 8}/{compEvidence.currentCompetitorCount ?? 10}</div>
            <div>⚠️ 3个竞品 bot 防护已触发：{(compEvidence.blockedBy503 ?? []).slice(0, 3).join("、")}</div>
            <div>⚠️ 技术对标需多轮复采 + 同口径路由才可做分值化结论</div>
          </div>
        </div>
      </section>
    </div>
  );
}
