import Link from "next/link";
import { BRANDS } from "@/lib/data/brands";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-3">路特 AI</div>
        <h1 className="text-5xl font-semibold text-neutral-900 tracking-tight mb-4">诊断监控360</h1>
        <p className="text-neutral-600 text-base max-w-md mx-auto">
          品牌独立站全维度诊断 · 采集-诊断-洞察-优化-执行
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-lg">
        {BRANDS.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.id}`}
            className="card hover:border-primary-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: brand.accentColor }}
              >
                {brand.logoMark}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 group-hover:text-primary-500 transition-colors">
                  {brand.name}
                </div>
                <div className="text-sm text-neutral-500">{brand.domain}</div>
              </div>
              <div className="text-neutral-300 group-hover:text-primary-500 transition-colors text-lg">→</div>
            </div>
          </Link>
        ))}

        <div className="card border-dashed border-neutral-300 text-center py-8 text-neutral-400 text-sm cursor-default">
          + 添加新品牌
        </div>
      </div>
    </div>
  );
}
