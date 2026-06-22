import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "../common/Button.jsx";
import { Panel } from "../common/Panel.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import { getDatePart, getHourLabel } from "../../lib/formatting/dateTime.js";

const playbackSpeeds = [0.5, 1, 2];

export function TimeControls() {
  const {
    actions,
    availableDates,
    availableHoursForSelectedDate,
    canGoNext,
    canGoPrevious,
    isPlaying,
    metadata,
    mode,
    playbackSpeed,
    prefersReducedMotion,
    selectedTargetTime,
  } = useCommandCenter();

  const selectedDate = selectedTargetTime ? getDatePart(selectedTargetTime) : "";

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Previous hour"
            aria-keyshortcuts="ArrowLeft"
            disabled={!canGoPrevious}
            onClick={actions.previousHour}
            size="sm"
            type="button"
            variant="secondary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <Button
            aria-label={isPlaying ? "Pause replay" : "Play replay"}
            aria-keyshortcuts="Space"
            disabled={!canGoNext || prefersReducedMotion}
            onClick={() => actions.setPlaying(!isPlaying)}
            size="sm"
            type="button"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            aria-label="Next hour"
            aria-keyshortcuts="ArrowRight"
            disabled={!canGoNext}
            onClick={actions.nextHour}
            size="sm"
            type="button"
            variant="secondary"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {playbackSpeeds.map((speed) => (
            <button
              className={[
                "h-9 rounded-md border px-3 text-sm font-semibold transition-colors",
                playbackSpeed === speed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
              ].join(" ")}
              key={speed}
              onClick={() => actions.setPlaybackSpeed(speed)}
              type="button"
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Date</span>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
            onChange={(event) => actions.setDate(event.target.value)}
            value={selectedDate}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">
            Target hour IST
          </span>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
            onChange={(event) =>
              actions.setSelectedTargetTime(event.target.value)
            }
            value={selectedTargetTime ?? ""}
          >
            {availableHoursForSelectedDate.map((entry) => (
              <option key={entry.targetTime} value={entry.targetTime}>
                {getHourLabel(entry.targetTime)} IST
              </option>
            ))}
          </select>
        </label>
        <Button
          className="self-end"
          onClick={actions.goToPeakDemo}
          type="button"
          variant="secondary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Peak Demo
        </Button>
        <Button
          className="self-end"
          onClick={actions.goToQuietHour}
          type="button"
          variant="secondary"
        >
          Quiet Hour
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex rounded-md border border-border bg-background p-1">
          {[
            ["simulated-live", "Simulated Live"],
            ["historical", "Historical"],
          ].map(([value, label]) => (
            <button
              className={[
                "rounded px-3 py-1.5 text-sm font-semibold transition-colors",
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
              key={value}
              onClick={() => actions.setMode(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Historical simulation in IST. Replay spans {metadata?.minimumTargetTime}{" "}
          to {metadata?.maximumTargetTime}; no new live data is implied.
          {prefersReducedMotion
            ? " Autoplay is paused because reduced motion is enabled."
            : ""}
        </p>
      </div>
    </Panel>
  );
}
