import { Badge } from "./Badge.jsx";
import { Panel } from "./Panel.jsx";
import { cn } from "../../lib/utils.js";

const metricItems = [
  {
    key: "pressureCaptureAt25",
    label: "Pressure captured within the top 25 ranked zones",
  },
  {
    key: "hotspotRecallAt25",
    label: "Severe hotspots identified within the top 25",
  },
  {
    key: "averagePatrolReductionPercent",
    label: "Fewer average patrol deployments through adaptive dispatch",
  },
];

export function MetricsStrip({
  className,
  error,
  isLoading,
  summary,
  variant = "default",
}) {
  const isCompact = variant === "compact";
  const display = summary?.display;

  return (
    <Panel className={cn("p-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Validated historical evaluation
          </p>
          {display?.caption ? (
            <p className="mt-1 text-sm text-muted-foreground">{display.caption}</p>
          ) : null}
        </div>
        <Badge variant="cyan">Held-out test period</Badge>
      </div>
      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-b-lg bg-border",
          isCompact ? "md:grid-cols-3" : "lg:grid-cols-3",
        )}
      >
        {metricItems.map((item) => (
          <div className="bg-card px-5 py-5" key={item.key}>
            <p className="tabular text-3xl font-black text-primary">
              {isLoading ? "..." : display?.[item.key] ?? "Unavailable"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      {error ? (
        <p className="border-t border-border px-5 py-3 text-sm text-operational-amber">
          Evaluation summary could not be loaded from generated data.
        </p>
      ) : null}
    </Panel>
  );
}
