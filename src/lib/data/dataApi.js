import { getDataBaseUrl } from "./baseUrl.js";

const dailyRecommendationCache = new Map();

async function fetchJson(path) {
  const response = await fetch(`${getDataBaseUrl()}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Malformed JSON in ${path}: ${error.message}`);
  }
}

export async function loadCommandCenterBootstrap() {
  const [manifest, metadata, schedule, zones] = await Promise.all([
    fetchJson("manifest.json"),
    fetchJson("metadata.json"),
    fetchJson("schedule.json"),
    fetchJson("zones.geojson"),
  ]);

  if (!Array.isArray(schedule?.entries)) {
    throw new Error("Schedule data is missing entries");
  }
  for (const entry of schedule.entries) {
    if (
      typeof entry?.targetTime !== "string" ||
      typeof entry?.dataFile !== "string" ||
      typeof entry?.recommendedPatrols !== "number"
    ) {
      throw new Error("Schedule data contains a malformed entry");
    }
  }
  if (!Array.isArray(manifest?.recommendationFiles)) {
    throw new Error("Manifest data is missing recommendationFiles");
  }
  if (zones?.type !== "FeatureCollection" || !Array.isArray(zones.features)) {
    throw new Error("Zone GeoJSON is not a FeatureCollection");
  }

  return { manifest, metadata, schedule, zones };
}

export async function loadDailyRecommendations(path) {
  if (dailyRecommendationCache.has(path)) {
    return dailyRecommendationCache.get(path);
  }

  const promise = fetchJson(path).then((payload) => {
    if (!Array.isArray(payload?.hours)) {
      throw new Error(`Daily recommendation file ${path} is missing hours`);
    }
    for (const hour of payload.hours) {
      if (typeof hour?.targetTime !== "string") {
        throw new Error(`Daily recommendation file ${path} has a malformed hour`);
      }
      if (!Array.isArray(hour?.recommendations)) {
        throw new Error(
          `Daily recommendation file ${path} is missing recommendations for ${hour.targetTime}`,
        );
      }
      for (const recommendation of hour.recommendations) {
        if (
          typeof recommendation?.recommendationId !== "string" ||
          typeof recommendation?.zoneIndex !== "number" ||
          typeof recommendation?.zoneGridId !== "string"
        ) {
          throw new Error(
            `Daily recommendation file ${path} contains a malformed recommendation`,
          );
        }
      }
    }
    return payload;
  });

  dailyRecommendationCache.set(path, promise);
  return promise;
}

export function getCachedDailyFileCount() {
  return dailyRecommendationCache.size;
}
