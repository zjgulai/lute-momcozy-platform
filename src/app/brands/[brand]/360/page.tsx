import { loadPublicCrossAudit } from "@/lib/data/loader";
import { Badge } from "@/components/ui/Badge";

export default async function DiagnosticPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const g360 = data?.diagnosticGaps360 ?? {};
  const gaps = g360.gaps ?? {};

  const LAYERS: Record<string, { label: string; color: string; keys: string[] }> = {
    A: { label: "Layer A · 行为数据层", color: "border-danger-500", keys: ["G1_behavior", "G2_funnel_segmented"] },
    B: { label: "Layer B · 经营健康层", color: "border-warning-500", keys: ["G3_ltv_cohort", "G4_email_sms", "G10_support_quality"] },
    C: { label: "Layer C · 技术可采集层", color: "border-success-500", keys: ["G5_inventory", "G6_review_ecosystem", "G7_checkout_business", "G9_pdp_content_depth", "G11_seo_architecture"] },
    D: { label: "Layer D · 社交商务层", color: "border-primary-500", keys: ["G8_social_commerce"] },
  };

  const existing = [
    { id: "D1", label: "前端性能指标", status: "collected" as const, note: "FCP/TTFB/LCP/DOM/JS/3P失败" },
    { id: "D2", label: "第三方脚本治理", status: "collected" as const, note: "kill-list + owner制 + 失败预算" },
    { id: "D3", label: "内部经营漏斗", status: "warn" as const, note: "有口径风险（C7）" },
    { id: "D4", label: "竞品技术对标", status: "collected" as const, note: "6站×性能×双视口" },
    { id: "D5", label: "SEO 技术底座", status: "collected" as const, note: "Schema/canonical/meta" },
    { id: "D6", label: "GEO/AI 可见度", status: "collected" as const, note: "Perplexity 5问实测" },
    { id: "D7", label: "安全被动扫描", status: "collected" as const, note: "CSP/SRI/双Pixel/myshopify" },
    { id: "D8", label: "Bot 流量治理", status: "warn" as const, note: "框架有，数据缺" },
    { id: "D9", label: "渠道归因质量", status: "warn" as const, note: "C7 已识别，数据待补" },
  ];

  const collectedCount = Object.values(gaps).filter((g: any) => g.status === "collected" || g.status === "partial").length;
  const totalNew = g360.newDimensions ?? 11;
  const totalAll = g360.totalDimensions ?? 20;

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">VII · 360框架</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          20 维度覆盖，<br /><span className="text-primary-500">无死角诊断。</span>
        </h1>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900">{totalAll}</div>
            <div className="text-xs text-neutral-500">总维度</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-500">{existing.filter(d => d.status === "collected").length + collectedCount}</div>
            <div className="text-xs text-neutral-500">已采集</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-500">{totalAll - (existing.filter(d => d.status === "collected").length + collectedCount)}</div>
            <div className="text-xs text-neutral-500">待采集</div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">已有维度 D1-D9</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {existing.map(d => (
            <div key={d.id} className="card-compact flex gap-3">
              <Badge status={d.status} size="sm" className="shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-neutral-500">{d.id}</div>
                <div className="text-sm font-medium text-neutral-800">{d.label}</div>
                <div className="text-xs text-neutral-500">{d.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {Object.entries(LAYERS).map(([layer, cfg]) => (
        <section key={layer} className={`mb-6 border-l-2 pl-4 ${cfg.color}`}>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{cfg.label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cfg.keys.map(key => {
              const gap = gaps[key] as any;
              if (!gap) return null;
              const isCollected = gap.status === "collected" || gap.status === "partial";
              const findings = (gap.keyFindings ?? []) as string[];
              return (
                <div key={key} className="card-compact">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge status={isCollected ? "collected" : "pending"} size="sm" className="shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-neutral-400">{key.split("_")[0]}</div>
                      <div className="text-sm font-semibold text-neutral-800">{gap.label}</div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 mb-2">{gap.impactEstimate ?? gap.layerDesc}</p>
                  {findings.length > 0 && (
                    <div className="space-y-0.5">
                      {findings.slice(0, 3).map((f, i) => (
                        <div key={i} className="text-xs text-neutral-500 flex gap-1">
                          <span className={f.includes("CRITICAL") ? "text-danger-500" : "text-neutral-300"}>›</span>
                          <span>{f.slice(0, 80)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isCollected && gap.actionItems?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-100">
                      <div className="text-[10px] font-semibold text-neutral-400 uppercase mb-1">下一步</div>
                      <div className="text-xs text-neutral-500">{gap.actionItems[0]}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
