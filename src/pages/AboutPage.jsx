import { Badge } from "../components/common/Badge.jsx";
import { Panel } from "../components/common/Panel.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";

const sections = [
  "What PARK-GUARD does",
  "Data flow",
  "Why it is more than a static heatmap",
  "Forecasting and calibration",
  "Obstruction evidence",
  "Data confidence",
  "Balanced patrol coverage",
  "Adaptive deployment",
  "MapMyIndia role",
  "Limitations and safeguards",
];

export function AboutPage() {
  return (
    <PageShell className="py-10">
      <div className="max-w-3xl">
        <Badge variant="cyan">Methodology shell</Badge>
        <h1 className="mt-4 text-4xl font-black">
          Built as historical decision support.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          The full About page will describe the approved methodology after the
          static evaluation and metadata files are generated. It will not claim
          live traffic, automatic enforcement, legal guilt, or causal congestion
          reduction.
        </p>
      </div>
      <section className="mt-8 grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <Panel className="p-4" key={section}>
            <h2 className="font-semibold">{section}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Approved content will be added in the dedicated Landing and About
              stage.
            </p>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
}
