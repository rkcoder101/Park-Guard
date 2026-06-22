import { useCommandCenter } from "../../context/useCommandCenter.js";
import { formatScore } from "../../lib/formatting/dateTime.js";

const scenarioLevels = [30, 60, 90];

export function ScenarioSimulator({ recommendation }) {
  const { actions, scenario } = useCommandCenter();
  const selectedReduction =
    recommendation.scenarioReduction[String(scenario)] ?? 0;
  const remainingPressure = Math.max(
    recommendation.expectedPressure - selectedReduction,
    0,
  );

  return (
    <section className="rounded-md border border-border bg-background/55 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Scenario simulator</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Uses packaged local pressure-suppression values only.
          </p>
        </div>
        <div className="flex rounded-md border border-border bg-card p-1">
          {scenarioLevels.map((level) => (
            <button
              className={[
                "rounded px-3 py-1.5 text-sm font-semibold transition-colors",
                scenario === level
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
              key={level}
              onClick={() => actions.setScenario(level)}
              type="button"
            >
              {level}%
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Selected scenario"
          value={`${scenario}% local reduction`}
        />
        <Metric
          label="Scenario-estimated local reduction"
          value={formatScore(selectedReduction, 2)}
        />
        <Metric
          label="Expected remaining local pressure"
          value={formatScore(remainingPressure, 2)}
        />
      </dl>

      <p className="mt-4 rounded-md border border-operational-amber/35 bg-operational-amber/10 p-3 text-xs leading-5 text-muted-foreground">
        Scenario estimates are hypothetical local pressure-suppression values,
        not causal guarantees of congestion reduction.
      </p>
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
