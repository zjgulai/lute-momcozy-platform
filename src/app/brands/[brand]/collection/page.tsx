import { loadAllSessions, loadPublicCrossAudit } from "@/lib/data/loader";
import { Badge } from "@/components/ui/Badge";
import { formatDate, relativeDate } from "@/lib/utils/format";

export default async function CollectionPage({ params }: { params: Promise<{ brand: string }> }) {
  await params;
  const sessions = loadAllSessions() as any[];
  const data = loadPublicCrossAudit() as any;
  const bhSessions = data?.diagnosticGaps360?.bhSessions;

  const sessionsByConf = (conf: string) => sessions.filter(s => s?.confidence === conf).length;

  return (
    <div className="p-8 max-w-container">
      <div className="mb-8">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-2">VIII · 采集管理</div>
        <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight mb-3">
          三层采集引擎，<br /><span className="text-primary-500">持续监控360。</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{sessions.length}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">性能层 Sessions</div>
          <div className="text-xs text-neutral-400 mt-1">Playwright 自动采集</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-1">1</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">内容层 Sessions</div>
          <div className="text-xs text-neutral-400 mt-1">collect-360-content.mjs</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{bhSessions ? "1" : "0"}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide">BH Sessions</div>
          <div className="text-xs text-neutral-400 mt-1">browser-harness AI层</div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Layer 1 · 性能层历史（Playwright）</h2>
        <div className="card overflow-hidden p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Session</th>
                <th>采集日期</th>
                <th>置信度</th>
                <th>路由数</th>
                <th>方法版本</th>
              </tr>
            </thead>
            <tbody>
              {[...sessions].reverse().map((s: any, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{s?.sessionId}</td>
                  <td className="text-sm">{s?.observedAt} <span className="text-neutral-400">({relativeDate(s?.observedAt)})</span></td>
                  <td>
                    <Badge
                      status={s?.confidence === "high" ? "pass" : s?.confidence === "medium" ? "warn" : "pending"}
                      size="sm"
                    >
                      {s?.confidence}
                    </Badge>
                  </td>
                  <td className="text-sm">{s?.routes?.length ?? "—"}</td>
                  <td className="text-xs text-neutral-500 font-mono">{s?.methodologyVersion?.slice(0, 30)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Layer 3 · browser-harness AI层</h2>
        {bhSessions ? (
          <div className="card-compact">
            <div className="flex items-center gap-3 mb-3">
              <Badge status="collected" size="sm" />
              <span className="font-semibold text-sm">content-session-{bhSessions.firstSession}</span>
            </div>
            <div className="text-xs text-neutral-600 mb-3">{bhSessions.sessionType}</div>
            <ul className="space-y-1">
              {(bhSessions.keyFindings ?? []).map((f: string, i: number) => (
                <li key={i} className="text-xs text-neutral-600 flex gap-2">
                  <span className="text-primary-500">›</span><span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card-compact border-dashed border-neutral-300 text-center py-6 text-neutral-400 text-sm">
            尚无 browser-harness 采集记录
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">采集命令速查</h2>
        <div className="space-y-3">
          {[
            { label: "Layer 1 性能层（月度自动）", cmd: "AUDIT_TARGET_URL=https://momcozy.com npm run collect" },
            { label: "Layer 2 内容层（月度同步）", cmd: "AUDIT_TARGET_URL=https://momcozy.com npm run collect:360" },
            { label: "Layer 1 PDP Watchlist", cmd: "AUDIT_TARGET_URL=https://momcozy.com AUDIT_ROUTE_CONFIG=config/collection-routes-pdp-watchlist.json npm run collect" },
            { label: "竞品采集", cmd: "npm run collect:competitors" },
          ].map(({ label, cmd }) => (
            <div key={label} className="card-compact">
              <div className="text-xs font-semibold text-neutral-500 mb-1">{label}</div>
              <code className="text-xs font-mono text-neutral-700 bg-neutral-100 px-2 py-1 rounded block overflow-x-auto">{cmd}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
