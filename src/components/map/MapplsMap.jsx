import { useEffect, useMemo, useRef, useState } from "react";
import { MapUnavailablePanel } from "./MapUnavailablePanel.jsx";
import { MapControls } from "./MapControls.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import { MapplsAdapter } from "../../lib/map/mapplsAdapter.js";
import { loadMapplsSdk, resetMapplsLoader } from "../../lib/map/mapplsLoader.js";

const containerId = "park-guard-map";

export function MapplsMap() {
  const {
    actions,
    selectedZoneId,
    showAllZones,
    visibleMetric,
    visibleRecommendations,
    zones,
  } = useCommandCenter();
  const sdkPromiseRef = useRef(null);
  const adapterRef = useRef(null);
  const initializationRef = useRef(false);
  const [status, setStatus] = useState("idle");
  const [errorCode, setErrorCode] = useState(null);
  const mapKey = import.meta.env.VITE_MAPPLS_MAP_SDK_KEY;

  const zoneByIndex = useMemo(() => {
    const lookup = new Map();
    for (const feature of zones?.features ?? []) {
      lookup.set(String(feature.properties?.zoneIndex), feature);
    }
    return lookup;
  }, [zones]);

  const selectedRecommendation = visibleRecommendations.find(
    (recommendation) => recommendation.zoneIndex === selectedZoneId,
  );

  useEffect(() => {
    if (!mapKey) {
      setStatus("error");
      setErrorCode("missing-key");
      return;
    }
    if (initializationRef.current) {
      return;
    }

    let isActive = true;
    initializationRef.current = true;
    setStatus("loading");
    setErrorCode(null);

    sdkPromiseRef.current = loadMapplsSdk(mapKey);
    sdkPromiseRef.current
      .then(async (mappls) => {
        if (!isActive) {
          return;
        }
        const adapter = new MapplsAdapter(mappls);
        adapterRef.current = adapter;
        await adapter.createMap(containerId);
        if (isActive) {
          setStatus("ready");
        }
      })
      .catch((error) => {
        if (isActive) {
          console.warn("Mappls map unavailable", error.message);
          initializationRef.current = false;
          setErrorCode(error.message);
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
      adapterRef.current?.destroy();
      adapterRef.current = null;
      initializationRef.current = false;
    };
  }, [mapKey]);

  useEffect(() => {
    if (status !== "ready" || !adapterRef.current) {
      return;
    }

    try {
      adapterRef.current.setRecommendations({
        onSelect: actions.setSelectedZoneId,
        recommendations: visibleRecommendations,
        selectedZoneId,
        visibleMetric,
        zoneByIndex,
      });
    } catch (error) {
      console.warn("Recommendation overlay creation failed", error.message);
      setErrorCode("overlay-creation-failed");
      setStatus("error");
    }
  }, [
    actions.setSelectedZoneId,
    selectedZoneId,
    status,
    visibleMetric,
    visibleRecommendations,
    zoneByIndex,
  ]);

  useEffect(() => {
    if (status !== "ready" || !adapterRef.current) {
      return;
    }

    try {
      adapterRef.current.setGridVisibility({ showAllZones, zones });
    } catch (error) {
      console.warn("Grid overlay creation failed", error.message);
      setErrorCode("grid-creation-failed");
      setStatus("error");
    }
  }, [showAllZones, status, zones]);

  useEffect(() => {
    if (status !== "ready" || !adapterRef.current) {
      return;
    }

    try {
      adapterRef.current.setSelectedZone(selectedRecommendation ?? null);
    } catch (error) {
      console.warn("Selected-zone overlay failed", error.message);
      setErrorCode("selection-overlay-failed");
      setStatus("error");
    }
  }, [selectedRecommendation, status]);

  const retry = () => {
    adapterRef.current?.destroy();
    adapterRef.current = null;
    initializationRef.current = false;
    resetMapplsLoader();
    setStatus("idle");
    setErrorCode(null);
  };

  if (status === "error") {
    return <MapUnavailablePanel reason={errorCode} onRetry={retry} />;
  }

  return (
    <section className="relative min-h-[620px] overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      <MapControls />
      {status === "loading" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/82">
          <div className="rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold">
            Loading Mappls basemap
          </div>
        </div>
      ) : null}
      <div id={containerId} className="h-[620px] w-full" />
    </section>
  );
}
