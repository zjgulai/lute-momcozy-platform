import { loadPublicCrossAudit, loadLatestSession } from "@/lib/data/loader";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  await params;
  const data = loadPublicCrossAudit() as any;
  const session = loadLatestSession() as any;

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">
          正在构建
        </div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">
          此页面 Phase R2 实施中
        </h1>
        <p className="text-neutral-600 mt-3 text-sm">
          数据已加载：{data ? "✅" : "❌"} 最新采集：{session?.observedAt ?? "—"}
        </p>
      </div>
      <div className="card">
        <pre className="text-xs text-neutral-600 overflow-auto max-h-96">
          {JSON.stringify({ sectionKeys: Object.keys(data ?? {}) }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
