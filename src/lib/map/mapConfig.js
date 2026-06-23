export const MAPTILER_API_KEY =
  import.meta.env.VITE_MAPTILER_API_KEY?.trim() || "";

export const MAPTILER_STYLE_ID =
  import.meta.env.VITE_MAPTILER_STYLE_ID?.trim() || "streets-v4";

export const DATA_BASE_URL = import.meta.env.VITE_DATA_BASE_URL?.trim() || "/data";

export const MAP_LOAD_TIMEOUT_MS = 10000;

export const BENGALURU_CENTER = [77.5946, 12.9716];

export const SOURCE_IDS = {
  allZones: "park-guard-all-zones",
  recommendedZones: "park-guard-recommended-zones",
  recommendationPoints: "park-guard-recommendation-points",
  selectedZone: "park-guard-selected-zone",
  coverage: "park-guard-coverage",
};

export const LAYER_IDS = {
  gridFill: "park-guard-grid-fill",
  gridLine: "park-guard-grid-line",
  recommendedFill: "park-guard-recommended-fill",
  recommendedLine: "park-guard-recommended-line",
  confidenceRing: "park-guard-confidence-ring",
  marker: "park-guard-marker",
  rankLabel: "park-guard-rank-label",
  selectedFill: "park-guard-selected-fill",
  selectedLine: "park-guard-selected-line",
  coverageFill: "park-guard-coverage-fill",
  coverageLine: "park-guard-coverage-line",
};

export function getMapStyleUrl() {
  if (!MAPTILER_API_KEY) {
    return null;
  }

  return `https://api.maptiler.com/maps/${encodeURIComponent(
    MAPTILER_STYLE_ID,
  )}/style.json?key=${encodeURIComponent(MAPTILER_API_KEY)}`;
}
