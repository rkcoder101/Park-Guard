import { Search, X } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import {
  formatAction,
  formatConfidenceTier,
  formatDisruptionClass,
} from "../../lib/formatting/labels.js";

const confidenceOptions = ["low_confidence", "medium_confidence", "high_confidence"];
const actionOptions = [
  "preventive_patrol",
  "verify_before_enforcement",
  "targeted_obstruction_enforcement",
  "active_parking_enforcement",
];
const disruptionOptions = [
  "no_explicit_context",
  "single_context_signal",
  "compounded_disruption_evidence",
];

const visualMetricOptions = [
  ["priority", "Patrol priority"],
  ["expectedPressure", "Expected parking pressure"],
  ["hotspotProbability", "Severe hotspot probability"],
  ["dataConfidence", "Data confidence"],
];

export function RecommendationFilters() {
  const { actions, filters, searchQuery, visibleMetric } = useCommandCenter();

  return (
    <div className="space-y-3 border-t border-border px-5 py-4">
      <label className="grid gap-1 text-sm">
        <span className="font-semibold text-muted-foreground">
          Zone ID or grid ID
        </span>
        <span className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-foreground"
            onChange={(event) => actions.setSearchQuery(event.target.value)}
            placeholder="401 or 250_3118"
            type="search"
            value={searchQuery}
          />
        </span>
      </label>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <FilterSelect
          label="Confidence"
          name="confidenceTier"
          onChange={actions.setFilter}
          options={confidenceOptions.map((value) => [
            value,
            formatConfidenceTier(value),
          ])}
          value={filters.confidenceTier}
        />
        <FilterSelect
          label="Patrol action"
          name="patrolAction"
          onChange={actions.setFilter}
          options={actionOptions.map((value) => [value, formatAction(value)])}
          value={filters.patrolAction}
        />
        <FilterSelect
          label="Obstruction evidence"
          name="disruptionClass"
          onChange={actions.setFilter}
          options={disruptionOptions.map((value) => [
            value,
            formatDisruptionClass(value),
          ])}
          value={filters.disruptionClass}
        />
        <FilterSelect
          label="Verification"
          name="verificationRequired"
          onChange={actions.setFilter}
          options={[
            ["true", "Required"],
            ["false", "Not required"],
          ]}
          value={filters.verificationRequired}
        />
        <FilterSelect
          label="Current evidence"
          name="currentIncidentEvidence"
          onChange={actions.setFilter}
          options={[
            ["true", "Present"],
            ["false", "Absent"],
          ]}
          value={filters.currentIncidentEvidence}
        />
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">
            Visual metric
          </span>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
            onChange={(event) => actions.setVisibleMetric(event.target.value)}
            value={visibleMetric}
          >
            {visualMetricOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button
        className="w-full"
        onClick={actions.clearFilters}
        size="sm"
        type="button"
        variant="secondary"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Clear filters
      </Button>
    </div>
  );
}

function FilterSelect({ label, name, onChange, options, value }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
        onChange={(event) => onChange(name, event.target.value)}
        value={value}
      >
        <option value="all">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
