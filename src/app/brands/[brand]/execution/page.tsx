import { loadPublicCrossAudit } from "@/lib/data/loader";
import { Badge } from "@/components/ui/Badge";

export default async function ExecutionPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const playbookCards = (data?.legacyRecovery?.playbookCards ?? []) as any[];
  const roadmap = (data?.legacyRecovery?.roadmap ?? []) as any[];

  const p0Cards = playbookCards.filter((c: any) => c.priority === "P0" || c.id?.includes("P0"));
  const p1Cards = playbookCards.filter((c: any) => c.priority === "P1" || c.id?.includes("P1"));
  const restCards = playbookCards.filter((c: any) =>
    !c.priority?.includes("P0") && !c.id?.includes("P0") &&
    !c.priority?.includes("P1") && !c.id?.includes("P1")
  );

  const renderCard = (card: any) => (
    <div key={card.id ?? card.title} className="card overflow-hidden p-0">
      <div className="bg-neutral-900 text-white px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          {card.id && <span className="text-xs font-mono text-neutral-400">{card.id}</span>}
          {card.priority && (
            <Badge grade={card.priority === "P0" ? "F" : card.priority === "P1" ? "D" : "C"} size="sm">
              {card.priority}
            </Badge>
          )}
          {card.category && <span className="text-xs text-neutral-500">{card.category}</span>}
        </div>
        <h3 className="text-sm font-semibold leading-tight">{card.title}</h3>
        {card.why && <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{card.why.slice(0, 120)}</p>}
      </div>
      <div className="px-5 py-4 space-y-3">
        {card.steps && (
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">执行步骤</div>
            <ol className="space-y-1 list-decimal list-inside">
              {(card.steps as string[]).map((s, i) => (
                <li key={i} className="text-xs text-neutral-600">{s.slice(0, 80)}</li>
              ))}
            </ol>
          </div>
        )}
        {card.gate && (
          <div className="pt-2 border-t border-neutral-100">
            <div className="text-xs font-semibold text-primary-500 mb-1">验收门禁</div>
            <p className="text-xs text-neutral-600">{card.gate.slice(0, 100)}</p>
          </div>
        )}
        {card.estimatedEffort && (
          <div className="text-xs text-neutral-400">⏱ {card.estimatedEffort}</div>
        )}
        {card.owner && (
          <div className="text-xs text-neutral-400">👤 {card.owner}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">IX · 执行战单</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          每项修复，<br /><span className="text-primary-500">都有 owner 和验收门禁。</span>
        </h1>
        <p className="text-neutral-600 text-sm">
          {playbookCards.length} 张执行卡 · P0 立即执行 · P1 本周内 · 每卡含验收门禁
        </p>
      </div>

      {p0Cards.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge grade="F" size="sm">P0</Badge>
            <h2 className="text-sm font-semibold text-neutral-700">立即执行（{p0Cards.length} 张）</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p0Cards.map(renderCard)}
          </div>
        </section>
      )}

      {p1Cards.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge grade="D" size="sm">P1</Badge>
            <h2 className="text-sm font-semibold text-neutral-700">本周内（{p1Cards.length} 张）</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p1Cards.map(renderCard)}
          </div>
        </section>
      )}

      {restCards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">其他执行卡（{restCards.length} 张）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restCards.map(renderCard)}
          </div>
        </section>
      )}

      {roadmap.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">4 阶段路线图</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roadmap.map((phase: any, i: number) => (
              <div key={i} className="card-compact">
                <div className="text-xs font-bold text-primary-500 mb-1">{phase.phase}</div>
                <div className="text-sm font-semibold text-neutral-800 mb-2">{phase.title}</div>
                <p className="text-xs text-neutral-600 leading-relaxed">{phase.focus?.slice(0, 80)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
