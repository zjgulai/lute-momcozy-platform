import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "诊断监控360 · 路特 AI",
  description: "品牌独立站诊断监控360平台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
