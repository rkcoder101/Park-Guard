import { Badge } from "../common/Badge.jsx";
import { ScenarioSimulator } from "../scenario/ScenarioSimulator.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import { formatPercent, formatScore } from "../../lib/formatting/dateTime.js";
import {
  formatAction,
  formatConfidenceTier,
  formatDispatchTier,
  formatDisruptionClass,
  formatReasonCode,
} from "../../lib/formatting/labels.js";

export function ZoneDetailPanel() {
  const { selectedRecommendation } = useCommandCenter();

  if (!selectedRecommendation) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background/55 p-4 text-sm leading-6 text-muted-foreground">
        Select a recommendation to inspect evidence, confidence, and scenario
        estimates.
      </div>
    );
  }

  const recommendation = selectedRecommendation;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/80 p-4">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Zone detail
            </p>
            <h2 className="mt-2 text-xl font-black">
              Zone {recommendation.zoneIndex}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {recommendation.zoneGridId}
            </p>
          </div>
          <Badge variant={recommendation.verificationRequired ? "amber" : "cyan"}>
            {recommendation.verificationRequired
              ? "Verify before enforcement"
              : "Verification not required"}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>#{recommendation.selectionOrder}</Badge>
          <Badge>{formatDispatchTier(recommendation.dispatchTier)}</Badge>
          <Badge variant="cyan">{formatAction(recommendation.patrolAction)}</Badge>
        </div>
      </section>

      <DetailSection title="Forecast">
        <Metric label="Expected parking pressure" value={formatScore(recommendation.expectedPressure, 2)} />
        <Metric label="Patrol priority score" value={formatScore(recommendation.priorityScore, 2)} />
        <Metric label="Severe hotspot probability" value={formatPercent(recommendation.severeHotspotProbability, 1)} />
        <Metric label="Nearby parking activity" value={formatScore(recommendation.nearbyActivity, 2)} />
      </DetailSection>

      <DetailSection title="Current evidence">
        <Metric label="Current incidents" value={recommendation.currentIncidents} />
        <Metric label="Unique vehicles" value={recommendation.uniqueVehicles} />
        <Metric label="Active neighbouring zones" value={recommendation.activeNeighbourCount} />
        <Metric label="Temporal burst" value={formatScore(recommendation.currentBurstZ, 2)} />
        <Metric label="Same-hour relative activity" value={formatScore(recommendation.relativeToSameHour, 2)} />
        <Metric label="Consecutive active hours" value={recommendation.consecutiveActiveHours} />
        <Metric label="Road-interface evidence" value={yesNo(recommendation.roadObstructionEvidence)} />
        <Metric label="Large-vehicle evidence" value={yesNo(recommendation.largeVehicleEvidence)} />
        <Metric label="Multiple-offence evidence" value={yesNo(recommendation.multiOffenceEvidence)} />
        <Metric label="Obstruction evidence" value={formatDisruptionClass(recommendation.disruptionClass)} />
      </DetailSection>

      <section className="rounded-md border border-border bg-background/55 p-4">
        <h3 className="font-semibold">Confidence</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Data confidence" value={formatPercent(recommendation.dataConfidence, 0)} />
          <Metric label="Confidence tier" value={formatConfidenceTier(recommendation.confidenceTier)} />
          <Metric label="Verification" value={recommendation.verificationRequired ? "Required" : "Not required"} />
        </dl>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {recommendation.confidenceNote}
        </p>
        {recommendation.verificationRequired ? (
          <p className="mt-3 rounded-md border border-operational-amber/35 bg-operational-amber/10 p-3 text-sm font-semibold text-foreground">
            Verify before enforcement.
          </p>
        ) : null}
      </section>

      <section className="rounded-md border border-border bg-background/55 p-4">
        <h3 className="font-semibold">Explanation</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {recommendation.evidenceSummary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendation.reasonCodes.map((reasonCode) => (
            <Badge key={reasonCode}>{formatReasonCode(reasonCode)}</Badge>
          ))}
        </div>
      </section>

      <ScenarioSimulator recommendation={recommendation} />
    </div>
  );
}

function DetailSection({ children, title }) {
  return (
    <section className="rounded-md border border-border bg-background/55 p-4">
      <h3 className="font-semibold">{title}</h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular mt-1 text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}

function yesNo(value) {
  return value ? "Present" : "Absent";
}
