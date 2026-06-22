import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/Badge.jsx";
import { Button } from "../components/common/Button.jsx";
import { Panel } from "../components/common/Panel.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";

const workflowSteps = [
  "Incident records",
  "Hourly 250 m zones",
  "Next-hour pressure forecast",
  "Evidence and confidence",
  "Adaptive patrol plan",
];

export function LandingPage() {
  return (
    <PageShell className="py-12">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Badge variant="cyan">Historical simulation</Badge>
          <p className="mt-8 text-sm font-black tracking-[0.24em] text-primary">
            PARK-GUARD
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-black leading-[1.02] text-foreground md:text-6xl">
            Predictive parking-enforcement support for 250 m city zones.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Replay historical target hours, inspect next-hour parking-incident
            pressure, and review adaptive patrol recommendations with clear
            evidence and confidence boundaries.
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
        </div>
        <Panel className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Route Shell
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Design foundation ready for generated data.
              </h2>
            </div>
            <ShieldCheck
              className="h-8 w-8 text-operational-green"
              aria-hidden="true"
            />
          </div>
          <div className="mt-8 grid gap-3">
            {workflowSteps.map((step, index) => (
              <div
                className="flex items-center gap-3 rounded-md border border-border bg-background/60 px-4 py-3"
                key={step}
              >
                <span className="tabular flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}
