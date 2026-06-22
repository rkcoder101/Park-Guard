import { Database, MapPinned } from "lucide-react";
import { Badge } from "../components/common/Badge.jsx";
import {
  CommandErrorState,
  CommandLoadingState,
} from "../components/timeline/CommandStatus.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { MapplsMap } from "../components/map/MapplsMap.jsx";
import { RecommendationRail } from "../components/recommendations/RecommendationRail.jsx";
import { SummaryCards } from "../components/timeline/SummaryCards.jsx";
import { TimeControls } from "../components/timeline/TimeControls.jsx";
import { CommandCenterProvider } from "../context/CommandCenterContext.jsx";
import { useCommandCenter } from "../context/useCommandCenter.js";
import { formatTargetTime } from "../lib/formatting/dateTime.js";

export function CommandCenterPage() {
  return (
    <CommandCenterProvider>
      <CommandCenterContent />
    </CommandCenterProvider>
  );
}

function CommandCenterContent() {
  const {
    bootstrapStatus,
    error,
    manifest,
    metadata,
    mode,
    selectedTargetTime,
    zones,
  } = useCommandCenter();

  return (
    <PageShell
      action={<Badge variant="amber">Historical simulation</Badge>}
      className="py-6"
    >
      {bootstrapStatus === "loading" ? <CommandLoadingState /> : null}
      {bootstrapStatus === "error" ? <CommandErrorState error={error} /> : null}
      {bootstrapStatus === "ready" ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan">
                  {mode === "simulated-live" ? "Simulated Live" : "Historical"}
                </Badge>
                <Badge>Historical target hour</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-black">Command Centre</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedTargetTime
                  ? `${formatTargetTime(selectedTargetTime)} IST`
                  : "Target hour unavailable"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <Database className="h-4 w-4 text-primary" aria-hidden="true" />
                {metadata?.recommendationCount.toLocaleString("en-IN")} recommendations
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
                {zones?.features?.length.toLocaleString("en-IN")} zones
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                {manifest?.recommendationFiles?.length} date files cached on demand
              </span>
            </div>
          </div>

          <TimeControls />
          <SummaryCards />

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
            <MapplsMap />
            <RecommendationRail />
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
