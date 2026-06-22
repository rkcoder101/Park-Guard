import { useCommandCenter } from "../../context/useCommandCenter.js";

const metricOptions = [
  ["priority", "Patrol priority"],
  ["expectedPressure", "Expected pressure"],
  ["hotspotProbability", "Severe hotspot probability"],
  ["dataConfidence", "Data confidence"],
];

export function MapControls() {
  const { actions, showAllZones, visibleMetric } = useCommandCenter();

  return (
    <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-md border border-border bg-card/95 p-2 shadow-panel">
      <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold">
        <input
          checked={showAllZones}
          className="h-4 w-4 accent-cyan-400"
          onChange={(event) => actions.setShowAllZones(event.target.checked)}
          type="checkbox"
        />
        Show all analysis zones
      </label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
        Visual metric
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          onChange={(event) => actions.setVisibleMetric(event.target.value)}
          value={visibleMetric}
        >
          {metricOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
