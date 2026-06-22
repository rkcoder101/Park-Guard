import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Panel } from "../common/Panel.jsx";

export function CommandLoadingState() {
  return (
    <Panel className="grid min-h-[420px] place-items-center text-center">
      <div>
        <LoaderCircle
          className="mx-auto h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-black">Loading command data</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fetching manifest, metadata, schedule, and zone GeoJSON.
        </p>
      </div>
    </Panel>
  );
}

export function CommandErrorState({ error }) {
  return (
    <Panel className="grid min-h-[420px] place-items-center text-center">
      <div className="max-w-lg">
        <AlertTriangle
          className="mx-auto h-8 w-8 text-operational-amber"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-black">Command data unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The static data bundle could not be loaded. Check that Stage 2
          generated files exist under public/data.
        </p>
        <p className="mt-4 rounded-md border border-border bg-background/70 p-3 text-left text-xs text-muted-foreground">
          {error?.message ?? "Unknown data loading error"}
        </p>
      </div>
    </Panel>
  );
}
