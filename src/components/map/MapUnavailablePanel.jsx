import { AlertTriangle, Map } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { Panel } from "../common/Panel.jsx";

export function MapUnavailablePanel({ onRetry, reason }) {
  const hasMapKey = Boolean(import.meta.env.VITE_MAPTILER_API_KEY?.trim());
  const hasStyleId = Boolean(
    import.meta.env.VITE_MAPTILER_STYLE_ID?.trim() || "streets-v4",
  );

  return (
    <Panel className="flex min-h-[520px] flex-col justify-between overflow-hidden p-0">
      <div className="border-b border-border bg-muted/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
            <Map className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Map configuration unavailable
            </h2>
            <p className="text-sm text-muted-foreground">
              The operational recommendations remain available in the list.
            </p>
          </div>
        </div>
      </div>
      <div className="grid flex-1 place-items-center px-6 py-12 text-center">
        <div className="max-w-md">
          <AlertTriangle
            className="mx-auto mb-5 h-10 w-10 text-operational-amber"
            aria-hidden="true"
          />
          <h3 className="text-xl font-semibold">
            Historical recommendations will remain usable without the map.
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Timeline controls, adaptive recommendation lists, and zone
            selection are active. The visual basemap, polygons, markers, and
            500 m coverage area will load after the hosted vector basemap
            configuration is available.
          </p>
          <div className="mt-5 rounded-md border border-border bg-background/70 px-4 py-3 text-left text-xs text-muted-foreground">
            Basemap key status:{" "}
            <span className="font-semibold text-foreground">
              {hasMapKey ? "configured" : "missing VITE_MAPTILER_API_KEY"}
            </span>
            <span className="mt-2 block">
              Basemap style status:{" "}
              <span className="font-semibold text-foreground">
                {hasStyleId ? "configured" : "missing VITE_MAPTILER_STYLE_ID"}
              </span>
            </span>
            {reason ? (
              <span className="mt-2 block">
                Map status:{" "}
                <span className="font-semibold text-foreground">
                  {formatMapReason(reason)}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          No alternate map provider is used.
        </p>
        <Button onClick={onRetry} size="sm" type="button" variant="secondary">
          Retry later
        </Button>
      </div>
    </Panel>
  );
}

function formatMapReason(reason) {
  const labels = {
    "invalid-recommendation-coordinates": "Recommendation coordinates are invalid",
    "malformed-zone-geojson": "Zone GeoJSON is malformed",
    "map-load-timeout": "Map initialization timed out",
    "map-style-error": "Basemap style could not be loaded",
    "map-tile-error": "Basemap tiles could not be loaded",
    "missing-maptiler-key": "Missing basemap key",
    "overlay-creation-failed": "Recommendation overlays could not be created",
    "selection-overlay-failed": "Selected-zone overlay could not be created",
    "webgl-unsupported": "WebGL is unavailable in this browser",
  };
  return labels[reason] ?? "Basemap unavailable";
}
