import { CircleAlert, ListFilter } from "lucide-react";
import { Badge } from "../common/Badge.jsx";
import { CapacityControl } from "./CapacityControl.jsx";
import { RecommendationFilters } from "./RecommendationFilters.jsx";
import { ZoneDetailPanel } from "./ZoneDetailPanel.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import { formatPercent, formatScore } from "../../lib/formatting/dateTime.js";
import {
  formatAction,
  formatConfidenceTier,
  formatDispatchTier,
} from "../../lib/formatting/labels.js";

export function RecommendationRail() {
  const {
    actions,
    dailyError,
    dailyStatus,
    capacityRecommendations,
    recommendations,
    selectedHour,
    selectedZoneId,
    visibleRecommendations,
  } = useCommandCenter();

  return (
    <aside className="min-h-[620px] rounded-lg border border-border bg-card/88 shadow-panel">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Recommendation rail</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecting a recommendation updates the map when Mappls is available.
            </p>
          </div>
          <ListFilter
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="mt-4">
          <CapacityControl />
        </div>
      </div>
      <RecommendationFilters />

      <div className="p-4">
        {dailyStatus === "loading" ? (
          <RailNotice
            title="Loading selected hour"
            copy="Fetching the generated recommendation file for this date."
          />
        ) : null}
        {dailyStatus === "error" ? (
          <RailNotice
            title="Recommendation data unavailable"
            copy={dailyError?.message ?? "The selected date could not be loaded."}
          />
        ) : null}
        {dailyStatus !== "error" && selectedHour?.recommendedPatrols === 0 ? (
          <RailNotice
            title="No deployment recommended for this hour"
            copy="No zone exceeded the validation-selected dispatch threshold."
          />
        ) : null}
        {dailyStatus === "ready" &&
        selectedHour?.recommendedPatrols > 0 &&
        visibleRecommendations.length === 0 ? (
          <RailNotice
            title="No recommendations match the selected filters."
            copy="Clear filters to return to the selected capacity view."
          />
        ) : null}

        {visibleRecommendations.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Showing {visibleRecommendations.length} of{" "}
              {capacityRecommendations.length} visible recommendation
              {capacityRecommendations.length === 1 ? "" : "s"} from{" "}
              {recommendations.length} adaptive recommendation
              {recommendations.length === 1 ? "" : "s"}
            </p>
            {visibleRecommendations.map((recommendation) => (
              <RecommendationCard
                isSelected={selectedZoneId === recommendation.zoneIndex}
                key={recommendation.recommendationId}
                onSelect={() =>
                  actions.setSelectedZoneId(recommendation.zoneIndex)
                }
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : null}

        {selectedHour?.recommendedPatrols > 0 ? (
          <div className="mt-4">
            <ZoneDetailPanel />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function RailNotice({ copy, title }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-background/60 p-5">
      <CircleAlert className="h-5 w-5 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

function RecommendationCard({ isSelected, onSelect, recommendation }) {
  return (
    <button
      className={[
        "w-full rounded-md border p-4 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-background/65 hover:border-primary/60",
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="tabular text-sm font-black text-primary">
            #{recommendation.selectionOrder} Zone {recommendation.zoneIndex}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {recommendation.zoneGridId}
          </p>
        </div>
        {recommendation.verificationRequired ? (
          <Badge variant="amber">Verify</Badge>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{formatDispatchTier(recommendation.dispatchTier)}</Badge>
        <Badge variant="cyan">{formatAction(recommendation.patrolAction)}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Metric
          label="Pressure"
          value={formatScore(recommendation.expectedPressure, 2)}
        />
        <Metric
          label="Hotspot"
          value={formatPercent(recommendation.severeHotspotProbability, 1)}
        />
        <Metric
          label="Confidence"
          value={formatPercent(recommendation.dataConfidence, 0)}
        />
      </dl>

      <p className="mt-3 text-xs font-semibold text-muted-foreground">
        {formatConfidenceTier(recommendation.confidenceTier)}
      </p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {recommendation.evidenceSummary}
      </p>
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular mt-1 font-bold text-foreground">{value}</dd>
    </div>
  );
}
