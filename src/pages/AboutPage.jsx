import {
  AlertCircle,
  BarChart3,
  BrainCircuit,
  CircleDot,
  Database,
  Map,
  Network,
  Radar,
  Route,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../components/common/Badge.jsx";
import { MetricsStrip } from "../components/common/MetricsStrip.jsx";
import { Panel } from "../components/common/Panel.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { useEvaluationSummary } from "../hooks/useEvaluationSummary.js";

const methodologySections = [
  {
    icon: Radar,
    title: "What PARK-GUARD does",
    copy: "PARK-GUARD forecasts next-hour parking-incident pressure for 250 m zones and recommends patrol locations for a traffic control-room operator. It is a historical simulation and decision-support interface.",
  },
  {
    icon: Database,
    title: "Data flow",
    copy: "Source CSV and Parquet outputs are preprocessed once into date-partitioned JSON and generated zone GeoJSON. The browser loads static assets only, plus Mappls basemap resources when credentials are configured.",
  },
  {
    icon: BarChart3,
    title: "Why it is more than a static heatmap",
    copy: "The interface replays target hours, ranks zones for the next hour, adapts the number of patrol recommendations, and keeps current evidence and observation confidence visible.",
  },
  {
    icon: BrainCircuit,
    title: "Forecasting and calibration",
    copy: "The forecast target is incident pressure, not traffic speed or legal guilt. Severe-hotspot probability and calibrated pressure describe model outputs for the selected historical target hour.",
  },
  {
    icon: AlertCircle,
    title: "Obstruction evidence",
    copy: "Road-interface, large-vehicle, and multiple-offence signals help explain recommendation context. Missing evidence remains absent rather than being converted into a positive claim.",
  },
  {
    icon: ShieldCheck,
    title: "Data confidence",
    copy: "Confidence describes observation reliability. Low-confidence recommendations must show verification-first language before any enforcement decision is considered.",
  },
  {
    icon: Network,
    title: "Balanced patrol coverage",
    copy: "Ranking balances direct zone risk with nearby parking activity and 500 m coverage. This is neighbourhood context, not learned propagation or causal spillover.",
  },
  {
    icon: CircleDot,
    title: "Adaptive deployment",
    copy: "Some hours recommend fewer patrols, or no patrols, when no zone exceeds the validation-selected dispatch threshold. The UI never invents recommendations to fill a capacity view.",
  },
  {
    icon: Map,
    title: "MapMyIndia role",
    copy: "MapMyIndia / Mappls is the visual basemap provider for existing coordinates, zone polygons, markers, popups, and coverage circles. It is not used as an analytical model input in this prototype.",
  },
  {
    icon: Route,
    title: "Limitations and safeguards",
    copy: "Scenario estimates are hypothetical local pressure-suppression values, not causal guarantees. PARK-GUARD does not provide live traffic, route optimization, automatic penalties, or offender identification.",
  },
];

export function AboutPage() {
  const evaluationSummary = useEvaluationSummary();

  return (
    <PageShell className="space-y-10 py-10">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <Badge variant="cyan">Methodology and safeguards</Badge>
          <h1 className="mt-4 text-balance text-4xl font-black md:text-5xl">
            A historical simulation for better-supported parking patrol
            decisions.
          </h1>
        </div>
        <p className="text-base leading-8 text-muted-foreground">
          PARK-GUARD keeps the model boundary explicit: incident pressure is not
          traffic speed, confidence is not certainty of an offence, nearby
          parking activity is not propagation, and scenario values are not
          causal enforcement impact.
        </p>
      </section>

      <MetricsStrip
        error={evaluationSummary.error}
        isLoading={evaluationSummary.isLoading}
        summary={evaluationSummary.data}
        variant="compact"
      />

      <section className="grid gap-3 md:grid-cols-2">
        {methodologySections.map((section) => {
          const Icon = section.icon;
          return (
            <Panel className="p-5" key={section.title}>
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {section.copy}
                  </p>
                </div>
              </div>
            </Panel>
          );
        })}
      </section>

      <Panel className="border-operational-amber/35 bg-operational-amber/8">
        <h2 className="text-lg font-bold">
          Scenario estimates are hypothetical local pressure-suppression values,
          not causal guarantees of congestion reduction.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The prototype supports human review. It must not be read as a live
          Bengaluru incident feed, automatic dispatch system, traffic-speed
          product, or legal enforcement engine.
        </p>
      </Panel>
    </PageShell>
  );
}
