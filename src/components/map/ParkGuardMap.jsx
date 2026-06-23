import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapControls } from "./MapControls.jsx";
import { MapUnavailablePanel } from "./MapUnavailablePanel.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import {
  BENGALURU_CENTER,
  LAYER_IDS,
  MAP_LOAD_TIMEOUT_MS,
  SOURCE_IDS,
  getMapStyleUrl,
} from "../../lib/map/mapConfig.js";
import {
  assertZoneFeatureCollection,
  createCoverageGeoJson,
  createRecommendationPointGeoJson,
  createRecommendedZoneGeoJson,
  createSelectedZoneGeoJson,
  createZoneLookup,
  emptyFeatureCollection,
} from "../../lib/map/geoJsonUtils.js";
import {
  addParkGuardLayers,
  setGridVisibility,
} from "../../lib/map/mapStyles.js";

export function ParkGuardMap() {
  const {
    actions,
    prefersReducedMotion,
    selectedRecommendation,
    selectedTargetTime,
    selectedZoneId,
    showAllZones,
    visibleMetric,
    visibleRecommendations,
    zones,
  } = useCommandCenter();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const initializedRef = useRef(false);
  const fittedHourRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorCode, setErrorCode] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const styleUrl = useMemo(() => getMapStyleUrl(), []);
  const zoneByIndex = useMemo(() => createZoneLookup(zones), [zones]);

  useEffect(() => {
    if (!styleUrl) {
      setStatus("error");
      setErrorCode("missing-maptiler-key");
      return;
    }

    if (!isWebGlSupported()) {
      setStatus("error");
      setErrorCode("webgl-unsupported");
      return;
    }

    if (
      initializedRef.current ||
      mapRef.current ||
      !mapContainerRef.current
    ) {
      return;
    }

    try {
      assertZoneFeatureCollection(zones);
    } catch (error) {
      setStatus("error");
      setErrorCode(error.message);
      return;
    }

    let isActive = true;
    initializedRef.current = true;
    setStatus("loading");
    setErrorCode(null);

    const map = new maplibregl.Map({
      attributionControl: true,
      center: BENGALURU_CENTER,
      container: mapContainerRef.current,
      maxZoom: 18,
      minZoom: 8,
      style: styleUrl,
      zoom: 11,
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
      }),
      "top-right",
    );

    const failMap = (reason) => {
      if (!isActive) {
        return;
      }
      map.remove();
      mapRef.current = null;
      initializedRef.current = false;
      setErrorCode(reason);
      setStatus("error");
    };

    const timeoutId = window.setTimeout(() => {
      failMap("map-load-timeout");
    }, MAP_LOAD_TIMEOUT_MS);

    const handleMarkerClick = (event) => {
      const zoneIndex = Number(event.features?.[0]?.properties?.zoneIndex);
      if (Number.isFinite(zoneIndex)) {
        actions.setSelectedZoneId(zoneIndex);
      }
    };

    const handleMarkerEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMarkerLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleLoad = () => {
      if (!isActive) {
        return;
      }
      window.clearTimeout(timeoutId);

      try {
        addParkGuardSources(map, zones);
        addParkGuardLayers(map);
        setGridVisibility(map, false);
        map.on("click", LAYER_IDS.marker, handleMarkerClick);
        map.on("click", LAYER_IDS.rankLabel, handleMarkerClick);
        map.on("mouseenter", LAYER_IDS.marker, handleMarkerEnter);
        map.on("mouseleave", LAYER_IDS.marker, handleMarkerLeave);
        setStatus("ready");
      } catch (error) {
        failMap(error.message);
      }
    };

    const handleError = () => {
      failMap(map.loaded() ? "map-tile-error" : "map-style-error");
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      if (mapRef.current === map) {
        map.off("load", handleLoad);
        map.off("error", handleError);
        if (map.getLayer(LAYER_IDS.marker)) {
          map.off("click", LAYER_IDS.marker, handleMarkerClick);
          map.off("mouseenter", LAYER_IDS.marker, handleMarkerEnter);
          map.off("mouseleave", LAYER_IDS.marker, handleMarkerLeave);
        }
        if (map.getLayer(LAYER_IDS.rankLabel)) {
          map.off("click", LAYER_IDS.rankLabel, handleMarkerClick);
        }
        map.remove();
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [actions, retryNonce, styleUrl, zones]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) {
      return;
    }

    try {
      assertZoneFeatureCollection(zones);
      setSourceData(map, SOURCE_IDS.allZones, zones);
    } catch (error) {
      removeMap(mapRef, initializedRef);
      setErrorCode(error.message);
      setStatus("error");
    }
  }, [status, zones]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) {
      return;
    }

    try {
      setSourceData(
        map,
        SOURCE_IDS.recommendedZones,
        createRecommendedZoneGeoJson({
          recommendations: visibleRecommendations,
          selectedZoneId,
          zoneByIndex,
        }),
      );
      setSourceData(
        map,
        SOURCE_IDS.recommendationPoints,
        createRecommendationPointGeoJson({
          recommendations: visibleRecommendations,
          selectedZoneId,
          visibleMetric,
        }),
      );
      setSourceData(
        map,
        SOURCE_IDS.selectedZone,
        createSelectedZoneGeoJson({ selectedRecommendation, zoneByIndex }),
      );
      setSourceData(
        map,
        SOURCE_IDS.coverage,
        createCoverageGeoJson(selectedRecommendation),
      );
    } catch (error) {
      removeMap(mapRef, initializedRef);
      setErrorCode(error.message);
      setStatus("error");
    }
  }, [
    selectedRecommendation,
    selectedZoneId,
    status,
    visibleMetric,
    visibleRecommendations,
    zoneByIndex,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (status === "ready" && map) {
      setGridVisibility(map, showAllZones);
    }
  }, [showAllZones, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map || !selectedRecommendation) {
      return;
    }

    map.easeTo({
      center: [selectedRecommendation.longitude, selectedRecommendation.latitude],
      duration: prefersReducedMotion ? 0 : 700,
      zoom: Math.max(map.getZoom(), 14),
    });
  }, [prefersReducedMotion, selectedRecommendation, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      status !== "ready" ||
      !map ||
      !selectedTargetTime ||
      fittedHourRef.current === selectedTargetTime ||
      selectedRecommendation
    ) {
      return;
    }

    fitVisibleRecommendations({
      map,
      prefersReducedMotion,
      recommendations: visibleRecommendations,
    });
    fittedHourRef.current = selectedTargetTime;
  }, [
    prefersReducedMotion,
    selectedRecommendation,
    selectedTargetTime,
    status,
    visibleRecommendations,
  ]);

  const retry = () => {
    removeMap(mapRef, initializedRef);
    fittedHourRef.current = null;
    setStatus("idle");
    setErrorCode(null);
    setRetryNonce((value) => value + 1);
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
            Loading vector basemap
          </div>
        </div>
      ) : null}
      <div ref={mapContainerRef} className="h-[620px] w-full" />
    </section>
  );
}

function addParkGuardSources(map, zones) {
  map.addSource(SOURCE_IDS.allZones, {
    data: zones,
    type: "geojson",
  });
  for (const sourceId of [
    SOURCE_IDS.recommendedZones,
    SOURCE_IDS.recommendationPoints,
    SOURCE_IDS.selectedZone,
    SOURCE_IDS.coverage,
  ]) {
    map.addSource(sourceId, {
      data: emptyFeatureCollection,
      type: "geojson",
    });
  }
}

function setSourceData(map, sourceId, data) {
  const source = map.getSource(sourceId);
  if (source && typeof source.setData === "function") {
    source.setData(data);
  }
}

function fitVisibleRecommendations({ map, prefersReducedMotion, recommendations }) {
  if (recommendations.length === 0) {
    return;
  }

  if (recommendations.length === 1) {
    const recommendation = recommendations[0];
    map.easeTo({
      center: [recommendation.longitude, recommendation.latitude],
      duration: prefersReducedMotion ? 0 : 700,
      zoom: Math.max(map.getZoom(), 14),
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  for (const recommendation of recommendations) {
    bounds.extend([recommendation.longitude, recommendation.latitude]);
  }

  map.fitBounds(bounds, {
    duration: prefersReducedMotion ? 0 : 700,
    maxZoom: 15,
    padding: 72,
  });
}

function removeMap(mapRef, initializedRef) {
  mapRef.current?.remove();
  mapRef.current = null;
  initializedRef.current = false;
}

function isWebGlSupported() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}
