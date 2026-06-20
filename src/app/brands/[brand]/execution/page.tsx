import { loadPublicCrossAudit } from "@/lib/data/loader";
import { Badge } from "@/components/ui/Badge";

export default async function ExecutionPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;

  const executionOrders = (data?.decisionArchitecture?.executionOrders ?? []) as any[];
  const hardConclusions = (data?.decisionArchitecture?.hardConclusions ?? []) as any[];
  const summary = data?.decisionArchitecture?.executionSummary ?? {};
  const approvedCount = hardConclusions.filter((c: any) => !String(c.title ?? "").startsWith("不批准")).length;
  const frozenCount = hardConclusions.length - approvedCount;

  const statusBadge = (status: string) => {
    if (status === "done") return "bg-green-100 text-green-700 border border-green-300";
    if (status === "in_progress") return "bg-blue-100 text-blue-700 border border-blue-300";
    return "bg-neutral-100 text-neutral-500 border border-neutral-200";
  };
  const statusLabel = (status: string) => {
    if (status === "done") return "✅ 完成";
    if (status === "in_progress") return "🔄 进行中";
    return "⏳ 待执行";
  };

  const windowBadgeClass = (w: string) => {
    if (w?.includes("48") || w?.includes("小时")) return "bg-red-50 text-red-600 border border-red-200";
    if (w?.includes("3 天") || w?.includes("3天")) return "bg-orange-50 text-orange-700 border border-orange-200";
    if (w?.includes("1 周") || w?.includes("7 天")) return "bg-blue-50 text-blue-600 border border-blue-200";
    return "bg-neutral-100 text-neutral-600 border border-neutral-200";
  };

  const sprintNow = executionOrders.filter((o: any) =>
    o.window?.includes("48") || o.window?.includes("小时") || o.window?.includes("3 天") || o.window?.includes("3天") || o.window?.includes("1 周") || o.window?.includes("7 天")
  );
  const sprintNext = executionOrders.filter((o: any) =>
    o.window?.includes("2 周") || o.window?.includes("14 天")
  );
  const sprintLater = executionOrders.filter((o: any) =>
    o.window?.includes("30 天") || o.window?.includes("1 个月")
  );
  const sprintOther = executionOrders.filter((o: any) =>
    !sprintNow.includes(o) && !sprintNext.includes(o) && !sprintLater.includes(o)
  );

  const OrderCard = ({ order }: { order: any }) => (
    <div className="card overflow-hidden p-0">
      <div className="bg-neutral-900 text-white px-5 py-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {order.problemId && (
            <span className="text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded">
              {order.problemId}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${windowBadgeClass(order.window)}`}>
            {order.window}
          </span>
          {order.owner && (
            <span className="text-[10px] text-neutral-400 truncate">{order.owner.slice(0, 25)}</span>
          )}
          <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded ${statusBadge(order.status ?? "pending")}`}>
            {statusLabel(order.status ?? "pending")}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-tight">{order.action}</h3>
        {order.expectedImpact && (
          <p className="text-[10px] text-green-400 mt-1 leading-relaxed">{order.expectedImpact.slice(0, 80)}</p>
        )}
      </div>
      <div className="px-5 py-4 space-y-3">
        {(order.steps ?? []).length > 0 && (
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">执行步骤</div>
            <ol className="space-y-1 list-decimal list-inside">
              {(order.steps as string[]).map((s: string, si: number) => (
                <li key={si} className="text-xs text-neutral-600">{s.slice(0, 100)}</li>
              ))}
            </ol>
          </div>
        )}
        {order.gate && (
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-xs font-semibold text-primary-500 mb-1">验收门禁</div>
            <p className="text-xs text-neutral-600">{order.gate.slice(0, 120)}</p>
          </div>
        )}
      </div>
    </div>
  );

  const SprintGroup = ({ title, dot, orders }: { title: string; dot: string; orders: any[] }) => (
    orders.length > 0 ? (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${dot} shrink-0`}></span>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            {title} ({orders.length} 条)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order: any, i: number) => <OrderCard key={i} order={order} />)}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">IX · 执行战单</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          批准 {approvedCount}，冻结 {frozenCount}，<br />
          <span className="text-primary-500">推进 {executionOrders.length} 条战单。</span>
        </h1>
        <p className="text-neutral-600 text-sm">
          每条战单绑定负责人、时间窗口和验收门禁 · 完成后必须通过复采验证
        </p>
        {summary.total > 0 && (
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-neutral-600">完成 {summary.done ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs text-neutral-600">进行中 {summary.in_progress ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
              <span className="text-xs text-neutral-600">待执行 {summary.pending ?? executionOrders.length}</span>
            </div>
          </div>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">硬结论矩阵</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card-compact text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-xs text-neutral-500 mt-1">批准结论</div>
          </div>
          <div className="card-compact text-center">
            <div className="text-2xl font-bold text-orange-500">{frozenCount}</div>
            <div className="text-xs text-neutral-500 mt-1">冻结结论</div>
          </div>
          <div className="card-compact text-center">
            <div className="text-2xl font-bold text-primary-600">{executionOrders.length}</div>
            <div className="text-xs text-neutral-500 mt-1">执行战单</div>
          </div>
        </div>
        <div className="space-y-2">
          {hardConclusions.map((c: any, i: number) => {
            const isFreeze = String(c.title ?? "").startsWith("不批准");
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                  isFreeze ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
                }`}
              >
                <span className="text-base">{isFreeze ? "❄️" : "✅"}</span>
                <div>
                  <span className="font-semibold text-neutral-800">{c.title}</span>
                  {c.reason && <p className="text-neutral-600 mt-0.5">{c.reason.slice(0, 100)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          战单明细 · Sprint 分组（{executionOrders.length} 条）
        </h2>
        <SprintGroup title="Sprint Now · 立即执行" dot="bg-red-500" orders={sprintNow} />
        <SprintGroup title="Sprint Next · 本周内" dot="bg-blue-500" orders={sprintNext} />
        <SprintGroup title="Sprint Later · 本月内" dot="bg-neutral-400" orders={sprintLater} />
        <SprintGroup title="其他战单" dot="bg-neutral-300" orders={sprintOther} />
      </section>
    </div>
  );
}
