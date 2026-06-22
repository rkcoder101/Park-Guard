import { Clock3, Gauge, ListFilter } from "lucide-react";
import { Badge } from "../components/common/Badge.jsx";
import { Button } from "../components/common/Button.jsx";
import { Panel } from "../components/common/Panel.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { MapUnavailablePanel } from "../components/map/MapUnavailablePanel.jsx";

const summaryCards = [
  {
    label: "Recommended patrols",
    value: "Pending data",
  },
  {
    label: "Severe-hotspot probability",
    value: "Pending data",
  },
  {
    label: "Mean data confidence",
    value: "Pending data",
  },
  {
    label: "Zones requiring verification",
    value: "Pending data",
  },
];

export function CommandCenterPage() {
  return (
    <PageShell
      action={<Badge variant="amber">Historical simulation</Badge>}
      className="py-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan">Simulated Live</Badge>
            <Badge>Historical target hour</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-black">Command Centre</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stage 1 shell only. Data loading, replay controls, and
            recommendations arrive in later approved stages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled type="button" variant="secondary">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Peak Demo
          </Button>
          <Button disabled type="button" variant="secondary">
            Quiet Hour
          </Button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {summaryCards.map((card) => (
          <Panel className="p-4" key={card.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 text-lg font-bold text-foreground">
              {card.value}
            </p>
          </Panel>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <MapUnavailablePanel />
        <Panel className="min-h-[520px]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recommendation rail</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Waiting for generated static recommendation files.
              </p>
            </div>
            <ListFilter
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="mt-8 rounded-md border border-dashed border-border bg-background/55 p-5 text-sm leading-6 text-muted-foreground">
            This shell will support Top 5, Top 10, all recommended zones,
            filters, search, and synchronized map/list selection after the data
            pipeline stage.
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Gauge className="h-4 w-4" aria-hidden="true" />
            Action controls remain recommendation labels, not dispatch buttons.
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}
