import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPinned,
  Radar,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/Badge.jsx";
import { Button } from "../components/common/Button.jsx";
import { MetricsStrip } from "../components/common/MetricsStrip.jsx";
import { Panel } from "../components/common/Panel.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { useEvaluationSummary } from "../hooks/useEvaluationSummary.js";

const workflowSteps = [
  "Incident records",
  "Hourly 250 m zones",
  "Next-hour pressure forecast",
  "Confidence and obstruction evidence",
  "Adaptive patrol plan",
];

const safeguards = [
  {
    icon: ShieldCheck,
    title: "Human verification for low-confidence zones",
    copy: "Low-confidence recommendations are marked for on-site verification before enforcement.",
  },
  {
    icon: CheckCircle2,
    title: "No automatic penalties",
    copy: "PARK-GUARD supports operator decisions. It does not issue penalties or infer legal guilt.",
  },
  {
    icon: TriangleAlert,
    title: "Scenario estimates are non-causal",
    copy: "Suppression values are hypothetical local pressure estimates, not guarantees of traffic improvement.",
  },
];

export function LandingPage() {
  const evaluationSummary = useEvaluationSummary();

  return (
    <PageShell className="space-y-14 py-10">
      <section className="grid min-h-[calc(100vh-8rem)] gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <Badge variant="cyan">Historical simulation</Badge>
          <p className="mt-8 text-sm font-black tracking-[0.24em] text-primary">
            PARK-GUARD
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-black leading-[1.02] text-foreground md:text-6xl">
            Predictive parking enforcement for the next target hour.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Replay historical Bengaluru parking-incident records as an
            operational forecast environment, then inspect adaptive patrol
            recommendations for 250 m zones with evidence, confidence, and
            coverage context.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/command-center">
                Launch Command Centre
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/about">How it works</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
              Forecast replay in IST
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
              250 m analysis zones
            </span>
          </div>
        </div>

        <Panel className="relative overflow-hidden p-0">
          <div className="border-b border-border bg-muted/35 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Command Centre Preview
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Historical target hour
                </h2>
              </div>
              <Badge variant="amber">Simulated Live</Badge>
            </div>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-[1fr_230px]">
            <div className="min-h-[360px] bg-card p-5">
              <div className="relative h-full overflow-hidden rounded-md border border-border bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.38)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.38)_1px,transparent_1px)] bg-[size:38px_38px]" />
                <div className="absolute left-[19%] top-[25%] h-24 w-24 rounded-md border border-operational-cyan/80 bg-operational-cyan/15" />
                <div className="absolute left-[47%] top-[42%] h-24 w-24 rounded-md border border-operational-amber/80 bg-operational-amber/15" />
                <div className="absolute bottom-[17%] right-[18%] h-24 w-24 rounded-md border border-operational-blue/80 bg-operational-blue/15" />
                <div className="absolute left-[28%] top-[34%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-operational-cyan text-sm font-black text-background shadow-panel">
                  1
                </div>
                <div className="absolute left-[56%] top-[51%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-operational-amber text-sm font-black text-background shadow-panel">
                  2
                </div>
                <div className="absolute bottom-[28%] right-[28%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-operational-blue text-sm font-black text-background shadow-panel">
                  3
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-md border border-border bg-card/95 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Selected zone
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Expected pressure, nearby parking activity, and data
                    confidence stay visible together.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 bg-card p-4">
              {["Highest priority", "Verify before enforcement", "Extended coverage"].map(
                (label, index) => (
                  <div
                    className="rounded-md border border-border bg-background/70 p-3"
                    key={label}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="tabular text-sm font-black text-primary">
                        0{index + 1}
                      </span>
                      <Radar
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Recommendation label, not a dispatch command.
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </Panel>
      </section>

      <MetricsStrip
        error={evaluationSummary.error}
        isLoading={evaluationSummary.isLoading}
        summary={evaluationSummary.data}
      />

      <section>
        <div className="max-w-3xl">
          <Badge>Workflow</Badge>
          <h2 className="mt-4 text-3xl font-black">
            From historical incident records to an adaptive patrol plan.
          </h2>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <Panel className="p-4" key={step}>
              <span className="tabular flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-sm font-black text-primary">
                {index + 1}
              </span>
              <p className="mt-4 text-sm font-semibold leading-6">{step}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <div className="grid gap-3 md:grid-cols-3">
          {safeguards.map((item) => {
            const Icon = item.icon;
            return (
              <Panel className="p-5" key={item.title}>
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.copy}
                </p>
              </Panel>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
