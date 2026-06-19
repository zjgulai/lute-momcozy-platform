"use client";

import dynamic from "next/dynamic";

const TrendsChartsClient = dynamic(
  () => import("./TrendsCharts").then(m => ({ default: m.TrendsCharts })),
  { ssr: false }
);

interface Props {
  sessions: any[];
  latestSession: any;
}

export function TrendsChartsWrapper({ sessions, latestSession }: Props) {
  return <TrendsChartsClient sessions={sessions} latestSession={latestSession} />;
}
