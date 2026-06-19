import { loadPublicCrossAudit, loadLatestSession } from "@/lib/data/loader";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/format";

const LAYER_COLOR: Record<string, string> = {
  "经营层 · 漏斗后端": "bg-red-50 border-red-200 text-red-800",
  "经营层 · 漏斗前端": "bg-red-50 border-red-200 text-red-800",
  "经营层 · 营销追回": "bg-orange-50 border-orange-200 text-orange-800",
  "执行层 · 数据基础": "bg-purple-50 border-purple-200 text-purple-800",
  "执行层 · PDP 内容": "bg-amber-50 border-amber-200 text-amber-800",
  "执行层 · 技术性能": "bg-yellow-50 border-yellow-200 text-yellow-800",
  "战略层 · 可见度": "bg-blue-50 border-blue-200 text-blue-800",
  "战略层 · 系统安全": "bg-neutral-50 border-neutral-300 text-neutral-700",
};

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const session = loadLatestSession() as any;

  const dn = data?.diagnosticNarrative ?? {};
  const scqa = dn.scqa ?? {};
  const problems: any[] = dn.problems ?? [];
  const ranking: any[] = dn.lossRanking ?? [];
  const reliability = dn.dataReliabilitySummary ?? {};
  const ext = data?.external ?? {};
  const ops = data?.currentOperations ?? {};

  const fe = data?.financialEvidence ?? {};
  const fs = fe.summary ?? {};
  const fa = fe.financialArguments ?? {};

  const fmtUsd = (v: number | undefined | null) =>
    v != null ? `$${v.toLocaleString()}` : null;

  return (
    <div className="p-8 max-w-container">
      <div className="mb-10">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">
          I · 诊断总览 · {formatDate(data?.generatedAt)}
        </div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-4">
          8 个问题正在同时<br />
          <span className="text-danger-500">侵蚀每一分钱的增量。</span>
        </h1>
        <div className="card-compact mb-3 border-l-4 border-l-neutral-300">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">现状 Situation</div>
          <p className="text-sm text-neutral-700 leading-relaxed">{scqa.situation}</p>
        </div>
        <div className="card-compact mb-3 border-l-4 border-l-danger-400">
          <div className="text-[10px] font-bold text-danger-500 uppercase tracking-widest mb-1">问题 Complication</div>
          <p className="text-sm text-neutral-900 leading-relaxed font-medium">{scqa.complication}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card-compact border-l-4 border-l-primary-400">
            <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">核心问题 Question</div>
            <p className="text-sm text-neutral-700">{scqa.question}</p>
          </div>
          <div className="card-compact border-l-4 border-l-success-500">
            <div className="text-[10px] font-bold text-success-700 uppercase tracking-widest mb-1">本报告的答案 Answer</div>
            <p className="text-sm text-neutral-700">{scqa.answer}</p>
          </div>
        </div>
      </div>

      {fs.totalSalesUsd && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              财务实证基线 · {fe.window} · {fe.dataRows?.toLocaleString()} 条 SKU 明细
            </h2>
            <span className="text-xs text-neutral-400">{fe.caveat?.slice(0, 30)}…</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="card-compact text-center">
              <div className="text-2xl font-bold text-neutral-900">{fs.totalSalesUsdFormatted}</div>
              <div className="text-xs text-neutral-500 mt-1">7个月总销售额</div>
            </div>
            <div className="card-compact text-center">
              <div className="text-2xl font-bold text-green-600">{fs.netMarginRate}%</div>
              <div className="text-xs text-neutral-500 mt-1">净利率（含折扣方法论）</div>
            </div>
            <div className="card-compact text-center">
              <div className="text-2xl font-bold text-danger-600">{fs.adToSalesRate}%</div>
              <div className="text-xs text-neutral-500 mt-1">广告费 / 销售额</div>
            </div>
            <div className="card-compact text-center">
              <div className="text-2xl font-bold text-warning-600">{fs.highDiscountOrderShare}%</div>
              <div className="text-xs text-neutral-500 mt-1">订单伴随 &gt;30% 折扣</div>
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 leading-relaxed">
            <strong>核心财务规律：</strong>{fe.keyInsight_adLeverage?.evidence}。
            {fe.keyInsight_adLeverage?.implication}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {fa.P3_cartRecovery && (
              <div className="card-compact border-l-4 border-orange-400">
                <div className="text-[10px] font-bold text-orange-600 uppercase mb-1">P3 · 弃单追回 = 每月可追回</div>
                <div className="text-xl font-bold text-orange-700">${fa.P3_cartRecovery.monthlyPotentialUsd?.toLocaleString()}</div>
                <div className="text-xs text-neutral-500 mt-1">{fa.P3_cartRecovery.calculation}</div>
              </div>
            )}
            {fa.P5_adAttributionLoss && (
              <div className="card-compact border-l-4 border-purple-400">
                <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">P5 · 广告归因丢失 = 每月浪费</div>
                <div className="text-xl font-bold text-purple-700">${fa.P5_adAttributionLoss.monthlyLossUsd?.toLocaleString()}</div>
                <div className="text-xs text-neutral-500 mt-1">{fa.P5_adAttributionLoss.keyEvidence?.slice(0, 60)}</div>
              </div>
            )}
            {fa.P6_euAdEfficiency && (
              <div className="card-compact border-l-4 border-blue-400">
                <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">P7 · EU广告效率优势 = 月节省潜力</div>
                <div className="text-xl font-bold text-blue-700">${fa.P6_euAdEfficiency.potentialMonthlySavingUsd?.toLocaleString()}</div>
                <div className="text-xs text-neutral-500 mt-1">US广告率{fa.P6_euAdEfficiency.usAdRate}% vs EU {fa.P6_euAdEfficiency.euAvgAdRate}%</div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          问题优先级 · 按可估算损失排序
        </h2>
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">问题</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">损失估算（全周期）</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">月化</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-24">详情页</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item: any, i: number) => {
                const problem = problems.find((p: any) => p.id === item.id);
                const pageMap: Record<string, string> = {
                  forensics: "III · 风险归因",
                  metrics: "II · 指标口径",
                  "cross-audit": "V · 决策矩阵",
                };
                return (
                  <tr key={item.id} className={`border-b border-neutral-100 ${i === 0 ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-400 w-6">{item.id}</span>
                        <span className="font-medium text-neutral-900">{item.title}</span>
                      </div>
                      {problem && (
                        <p className="text-xs text-neutral-500 mt-0.5 ml-8">
                          {problem.layer}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.lossUsdEstimate ? (
                        <span className="font-bold text-danger-600 text-base">
                          {fmtUsd(item.lossUsdEstimate)}
                          <span className="text-xs font-normal text-neutral-400 ml-1">假设情景</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 italic">{item.note}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {item.lossMonthly ? fmtUsd(item.lossMonthly) + "/月" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {problem?.pageOwner && (
                        <a
                          href={`/brands/momcozy/${problem.pageOwner}`}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          {pageMap[problem.pageOwner] ?? problem.pageOwner}
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          ⚠ 损失估算均为假设情景，基于行业基准（Shopify 母婴品类 / Klaviyo 弃单基准），需通过 A/B 实验验证后方可作为收益承诺。
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          8 个问题完整诊断
        </h2>
        <div className="space-y-4">
          {problems.map((p: any) => {
            const layerClass = LAYER_COLOR[p.layer] ?? "bg-neutral-50 border-neutral-200 text-neutral-700";
            return (
              <div key={p.id} className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 bg-neutral-900 text-white">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold bg-white/10 rounded px-2 py-0.5 mt-0.5 shrink-0">{p.id}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded mb-2 border ${layerClass}`}>
                        {p.layer}
                      </div>
                      <h3 className="text-sm font-semibold leading-snug">{p.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-neutral-400 uppercase tracking-wide">S · </span>
                      <span className="text-neutral-600">{p.scqa?.s}</span>
                    </div>
                    <div>
                      <span className="font-bold text-danger-500 uppercase tracking-wide">C · </span>
                      <span className="text-neutral-800 font-medium">{p.scqa?.c}</span>
                    </div>
                    <div>
                      <span className="font-bold text-primary-500 uppercase tracking-wide">Q · </span>
                      <span className="text-neutral-600">{p.scqa?.q}</span>
                    </div>
                    <div>
                      <span className="font-bold text-success-700 uppercase tracking-wide">A · </span>
                      <span className="text-neutral-700">{p.scqa?.a}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">证据链</div>
                    <ul className="space-y-1">
                      {(p.evidence ?? []).map((e: string, i: number) => (
                        <li key={i} className="text-xs text-neutral-600 flex gap-1.5">
                          <span className="text-danger-400 shrink-0 mt-0.5">▸</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">损失估算</div>
                    {p.lossEstimate ? (
                      <div className="space-y-1">
                        {p.lossEstimate.value_usd && (
                          <div className="text-2xl font-bold text-danger-600">
                            {fmtUsd(p.lossEstimate.value_usd)}
                          </div>
                        )}
                        {p.lossEstimate.value_usd_low && (
                          <div className="text-xl font-bold text-danger-600">
                            {fmtUsd(p.lossEstimate.value_usd_low)} – {fmtUsd(p.lossEstimate.value_usd_high)}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 leading-relaxed">{p.lossEstimate.scenario}</p>
                        <p className="text-[10px] text-neutral-400 italic">{p.lossEstimate.confidence}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">
                        {p.id === "P5" ? "元问题：污染所有其他决策，无法单独量化" :
                         p.id === "P6" ? "P1+P2 损失的技术放大器" :
                         p.id === "P4" ? "P1+P2 的直接根因" :
                         p.id === "P7" ? "未来增长天花板，难以当期量化" :
                         "尾部风险，触发时灾难性"}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">立即行动</div>
                    <ol className="space-y-1 list-decimal list-inside">
                      {(p.immediateActions ?? []).map((a: string, i: number) => (
                        <li key={i} className="text-xs text-neutral-600">{a}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          数据可信度矩阵
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-success-700 mb-2">✅ 可信数字</div>
            <div className="space-y-2">
              {(reliability.reliable ?? []).map((item: any) => (
                <div key={item.field} className="card-compact bg-success-50 border-success-200">
                  <div className="font-semibold text-xs text-neutral-800">{item.field}: {item.value}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-danger-600 mb-2">⚠️ 不可信 / 需修正口径</div>
            <div className="space-y-2">
              {(reliability.unreliable ?? []).map((item: any) => (
                <div key={item.field} className="card-compact bg-danger-50 border-danger-200">
                  <div className="font-semibold text-xs text-neutral-800">{item.field}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
