import { Database, MapPinned } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "../components/common/Badge.jsx";
import {
  CommandErrorState,
  CommandLoadingState,
} from "../components/timeline/CommandStatus.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { ParkGuardMap } from "../components/map/ParkGuardMap.jsx";
import { RecommendationRail } from "../components/recommendations/RecommendationRail.jsx";
import { TabletRecommendationSheet } from "../components/recommendations/TabletRecommendationSheet.jsx";
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
    actions,
    bootstrapStatus,
    canGoNext,
    canGoPrevious,
    error,
    isPlaying,
    manifest,
    metadata,
    mode,
    prefersReducedMotion,
    selectedTargetTime,
    zones,
  } = useCommandCenter();

  useCommandCenterKeyboardShortcuts({
    actions,
    canGoNext,
    canGoPrevious,
    isPlaying,
    prefersReducedMotion,
  });

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

          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="min-w-0">
              <ParkGuardMap />
            </div>
            <div className="hidden min-w-0 xl:block">
              <RecommendationRail />
            </div>
            <TabletRecommendationSheet />
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}

function useCommandCenterKeyboardShortcuts({
  actions,
  canGoNext,
  canGoPrevious,
  isPlaying,
  prefersReducedMotion,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft" && canGoPrevious) {
        event.preventDefault();
        actions.previousHour();
      }
      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        actions.nextHour();
      }
      if (event.key === " " && canGoNext && !prefersReducedMotion) {
        event.preventDefault();
        actions.setPlaying(!isPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions, canGoNext, canGoPrevious, isPlaying, prefersReducedMotion]);
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)
  );
}
