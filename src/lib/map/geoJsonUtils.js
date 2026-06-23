import { getMetricValue } from "./mapStyles.js";

const EARTH_RADIUS_M = 6371008.8;

export const emptyFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function assertZoneFeatureCollection(zones) {
  if (zones?.type !== "FeatureCollection" || !Array.isArray(zones.features)) {
    throw new Error("malformed-zone-geojson");
  }

  for (const feature of zones.features) {
    if (
      feature?.type !== "Feature" ||
      feature.geometry?.type !== "Polygon" ||
      !Array.isArray(feature.geometry.coordinates?.[0]) ||
      !Number.isFinite(Number(feature.properties?.zoneIndex))
    ) {
      throw new Error("malformed-zone-geojson");
    }
  }
}

export function createZoneLookup(zones) {
  const lookup = new Map();
  for (const feature of zones?.features ?? []) {
    lookup.set(String(feature.properties?.zoneIndex), feature);
  }
  return lookup;
}

export function createRecommendedZoneGeoJson({
  recommendations,
  selectedZoneId,
  zoneByIndex,
}) {
  return {
    type: "FeatureCollection",
    features: recommendations
      .map((recommendation) => {
        const zoneFeature = zoneByIndex.get(String(recommendation.zoneIndex));
        if (!zoneFeature) {
          return null;
        }

        return {
          type: "Feature",
          geometry: zoneFeature.geometry,
          properties: createSafeRecommendationProperties(
            recommendation,
            recommendation.zoneIndex === selectedZoneId,
          ),
        };
      })
      .filter(Boolean),
  };
}

export function createRecommendationPointGeoJson({
  recommendations,
  selectedZoneId,
  visibleMetric,
}) {
  const scaleForRecommendation = createNormalizedMetricScale(
    recommendations,
    visibleMetric,
  );

  return {
    type: "FeatureCollection",
    features: recommendations.map((recommendation) => {
      assertRecommendationCoordinates(recommendation);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [recommendation.longitude, recommendation.latitude],
        },
        properties: {
          ...createSafeRecommendationProperties(
            recommendation,
            recommendation.zoneIndex === selectedZoneId,
          ),
          markerScale: scaleForRecommendation(recommendation),
        },
      };
    }),
  };
}

export function createSelectedZoneGeoJson({ selectedRecommendation, zoneByIndex }) {
  if (!selectedRecommendation) {
    return emptyFeatureCollection;
  }

  const zoneFeature = zoneByIndex.get(String(selectedRecommendation.zoneIndex));
  if (!zoneFeature) {
    return emptyFeatureCollection;
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: zoneFeature.geometry,
        properties: createSafeRecommendationProperties(selectedRecommendation, true),
      },
    ],
  };
}

export function createCoverageGeoJson(selectedRecommendation) {
  if (!selectedRecommendation) {
    return emptyFeatureCollection;
  }

  assertRecommendationCoordinates(selectedRecommendation);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: createGeodesicCircleGeoJson(
          selectedRecommendation.longitude,
          selectedRecommendation.latitude,
          selectedRecommendation.coverageRadiusM || 500,
        ),
        properties: {
          radiusMeters: selectedRecommendation.coverageRadiusM || 500,
          zoneIndex: selectedRecommendation.zoneIndex,
        },
      },
    ],
  };
}

export function createGeodesicCircleGeoJson(
  longitude,
  latitude,
  radiusMeters = 500,
  steps = 64,
) {
  const centerLat = degreesToRadians(latitude);
  const centerLng = degreesToRadians(longitude);
  const angularDistance = radiusMeters / EARTH_RADIUS_M;
  const coordinates = [];

  for (let index = 0; index <= steps; index += 1) {
    const bearing = (2 * Math.PI * index) / steps;
    const pointLat = Math.asin(
      Math.sin(centerLat) * Math.cos(angularDistance) +
        Math.cos(centerLat) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const pointLng =
      centerLng +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(centerLat),
        Math.cos(angularDistance) - Math.sin(centerLat) * Math.sin(pointLat),
      );

    coordinates.push([
      normalizeLongitude(radiansToDegrees(pointLng)),
      radiansToDegrees(pointLat),
    ]);
  }

  return {
    type: "Polygon",
    coordinates: [coordinates],
  };
}

function createNormalizedMetricScale(recommendations, metric) {
  const values = recommendations
    .map((recommendation) => getMetricValue(recommendation, metric))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);

  if (!values.length) {
    return () => 0.5;
  }

  const lower = percentile(values, values.length >= 5 ? 0.1 : 0);
  const upper = percentile(values, values.length >= 5 ? 0.9 : 1);
  const span = Math.max(upper - lower, 0.000001);

  return (recommendation) => {
    const value = getMetricValue(recommendation, metric);
    if (!Number.isFinite(value)) {
      return 0.5;
    }

    return Math.max(0, Math.min(1, (value - lower) / span));
  };
}

function createSafeRecommendationProperties(recommendation, selected) {
  return {
    confidenceTier: recommendation.confidenceTier,
    dataConfidence: recommendation.dataConfidence,
    expectedPressure: recommendation.expectedPressure,
    patrolAction: recommendation.patrolAction,
    priorityScore: recommendation.priorityScore,
    selected,
    selectionOrder: recommendation.selectionOrder,
    severeHotspotProbability: recommendation.severeHotspotProbability,
    zoneIndex: recommendation.zoneIndex,
  };
}

function assertRecommendationCoordinates(recommendation) {
  if (
    !Number.isFinite(recommendation?.longitude) ||
    !Number.isFinite(recommendation?.latitude) ||
    recommendation.longitude < -180 ||
    recommendation.longitude > 180 ||
    recommendation.latitude < -90 ||
    recommendation.latitude > 90
  ) {
    throw new Error("invalid-recommendation-coordinates");
  }
}

function percentile(values, ratio) {
  if (values.length === 1) {
    return values[0];
  }

  const position = (values.length - 1) * ratio;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const weight = position - lowerIndex;

  return values[lowerIndex] * (1 - weight) + values[upperIndex] * weight;
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

function normalizeLongitude(longitude) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}
