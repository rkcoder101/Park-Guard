import { LAYER_IDS, SOURCE_IDS } from "./mapConfig.js";

export const ACTION_COLORS = {
  preventive_patrol: "#22d3ee",
  active_parking_enforcement: "#3b82f6",
  verify_before_enforcement: "#f59e0b",
  targeted_obstruction_enforcement: "#ef4444",
};

export const CONFIDENCE_COLORS = {
  high_confidence: "#34d399",
  medium_confidence: "#93c5fd",
  low_confidence: "#f59e0b",
};

const actionColorExpression = [
  "match",
  ["get", "patrolAction"],
  "preventive_patrol",
  ACTION_COLORS.preventive_patrol,
  "active_parking_enforcement",
  ACTION_COLORS.active_parking_enforcement,
  "verify_before_enforcement",
  ACTION_COLORS.verify_before_enforcement,
  "targeted_obstruction_enforcement",
  ACTION_COLORS.targeted_obstruction_enforcement,
  ACTION_COLORS.preventive_patrol,
];

const confidenceColorExpression = [
  "match",
  ["get", "confidenceTier"],
  "high_confidence",
  CONFIDENCE_COLORS.high_confidence,
  "medium_confidence",
  CONFIDENCE_COLORS.medium_confidence,
  "low_confidence",
  CONFIDENCE_COLORS.low_confidence,
  CONFIDENCE_COLORS.medium_confidence,
];

const markerRadiusExpression = [
  "interpolate",
  ["linear"],
  ["coalesce", ["get", "markerScale"], 0.5],
  0,
  8,
  1,
  16,
];

const ringRadiusExpression = [
  "interpolate",
  ["linear"],
  ["coalesce", ["get", "markerScale"], 0.5],
  0,
  14,
  1,
  24,
];

export function getMetricValue(recommendation, metric) {
  switch (metric) {
    case "expectedPressure":
      return recommendation.expectedPressure;
    case "hotspotProbability":
      return recommendation.severeHotspotProbability;
    case "dataConfidence":
      return recommendation.dataConfidence;
    case "priority":
    default:
      return recommendation.priorityScore;
  }
}

export function addParkGuardLayers(map) {
  map.addLayer({
    id: LAYER_IDS.gridFill,
    source: SOURCE_IDS.allZones,
    type: "fill",
    layout: { visibility: "none" },
    paint: {
      "fill-color": "#0f172a",
      "fill-opacity": 0.04,
    },
  });

  map.addLayer({
    id: LAYER_IDS.gridLine,
    source: SOURCE_IDS.allZones,
    type: "line",
    layout: { visibility: "none" },
    paint: {
      "line-color": "#94a3b8",
      "line-opacity": 0.2,
      "line-width": 0.8,
    },
  });

  map.addLayer({
    id: LAYER_IDS.recommendedFill,
    source: SOURCE_IDS.recommendedZones,
    type: "fill",
    paint: {
      "fill-color": actionColorExpression,
      "fill-opacity": [
        "case",
        ["boolean", ["get", "selected"], false],
        0.28,
        0.16,
      ],
    },
  });

  map.addLayer({
    id: LAYER_IDS.recommendedLine,
    source: SOURCE_IDS.recommendedZones,
    type: "line",
    paint: {
      "line-color": actionColorExpression,
      "line-opacity": [
        "case",
        ["boolean", ["get", "selected"], false],
        0.95,
        0.75,
      ],
      "line-width": ["case", ["boolean", ["get", "selected"], false], 3, 2],
    },
  });

  map.addLayer({
    id: LAYER_IDS.selectedFill,
    source: SOURCE_IDS.selectedZone,
    type: "fill",
    paint: {
      "fill-color": "#22d3ee",
      "fill-opacity": 0.22,
    },
  });

  map.addLayer({
    id: LAYER_IDS.selectedLine,
    source: SOURCE_IDS.selectedZone,
    type: "line",
    paint: {
      "line-color": "#f8fafc",
      "line-opacity": 0.96,
      "line-width": 3,
    },
  });

  map.addLayer({
    id: LAYER_IDS.coverageFill,
    source: SOURCE_IDS.coverage,
    type: "fill",
    paint: {
      "fill-color": "#22d3ee",
      "fill-opacity": 0.08,
    },
  });

  map.addLayer({
    id: LAYER_IDS.coverageLine,
    source: SOURCE_IDS.coverage,
    type: "line",
    paint: {
      "line-color": "#22d3ee",
      "line-opacity": 0.82,
      "line-width": 2,
    },
  });

  map.addLayer({
    id: LAYER_IDS.confidenceRing,
    source: SOURCE_IDS.recommendationPoints,
    type: "circle",
    paint: {
      "circle-color": "#020617",
      "circle-opacity": 0.18,
      "circle-radius": ringRadiusExpression,
      "circle-stroke-color": confidenceColorExpression,
      "circle-stroke-opacity": [
        "match",
        ["get", "confidenceTier"],
        "high_confidence",
        0.95,
        "medium_confidence",
        0.72,
        "low_confidence",
        1,
        0.72,
      ],
      "circle-stroke-width": [
        "match",
        ["get", "confidenceTier"],
        "high_confidence",
        3,
        "medium_confidence",
        2,
        "low_confidence",
        4,
        2,
      ],
    },
  });

  map.addLayer({
    id: LAYER_IDS.marker,
    source: SOURCE_IDS.recommendationPoints,
    type: "circle",
    paint: {
      "circle-color": actionColorExpression,
      "circle-opacity": 0.96,
      "circle-radius": markerRadiusExpression,
      "circle-stroke-color": "#07111f",
      "circle-stroke-opacity": 0.96,
      "circle-stroke-width": 2,
    },
  });

  map.addLayer({
    id: LAYER_IDS.rankLabel,
    source: SOURCE_IDS.recommendationPoints,
    type: "symbol",
    layout: {
      "text-allow-overlap": false,
      "text-field": ["to-string", ["get", "selectionOrder"]],
      "text-ignore-placement": false,
      "text-size": 12,
    },
    paint: {
      "text-color": "#f8fafc",
      "text-halo-color": "#020617",
      "text-halo-width": 1.5,
    },
  });
}

export function setGridVisibility(map, showAllZones) {
  const visibility = showAllZones ? "visible" : "none";
  for (const layerId of [LAYER_IDS.gridFill, LAYER_IDS.gridLine]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  }
}
