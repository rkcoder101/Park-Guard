export const actionColors = {
  active_parking_enforcement: "#60a5fa",
  preventive_patrol: "#22d3ee",
  targeted_obstruction_enforcement: "#f87171",
  verify_before_enforcement: "#fbbf24",
};

export const confidenceRings = {
  high_confidence: "#34d399",
  medium_confidence: "#93c5fd",
  low_confidence: "#fbbf24",
};

export function getActionColor(action) {
  return actionColors[action] ?? actionColors.preventive_patrol;
}

export function getConfidenceColor(confidenceTier) {
  return confidenceRings[confidenceTier] ?? confidenceRings.medium_confidence;
}

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

export function createMetricScale(recommendations, metric) {
  const values = recommendations
    .map((recommendation) => getMetricValue(recommendation, metric))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);

  if (values.length === 0) {
    return () => 36;
  }

  const min = values[Math.floor(values.length * 0.1)] ?? values[0];
  const max = values[Math.floor(values.length * 0.9)] ?? values[values.length - 1];
  const span = Math.max(max - min, 0.000001);

  return (recommendation) => {
    const value = getMetricValue(recommendation, metric);
    const ratio = Math.max(0, Math.min(1, (value - min) / span));
    return Math.round(32 + ratio * 18);
  };
}

export function createMarkerIcon(recommendation, size) {
  const fill = getActionColor(recommendation.patrolAction);
  const ring = getConfidenceColor(recommendation.confidenceTier);
  const text = String(recommendation.selectionOrder);
  const fontSize = text.length > 1 ? 14 : 16;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#020617" flood-opacity="0.6"/>
    </filter>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${fill}" stroke="${ring}" stroke-width="4" filter="url(#shadow)"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 9}" fill="#07111f" opacity="0.92"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#f8fafc">${text}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function polygonCoordinatesToPaths(feature) {
  const ring = feature?.geometry?.coordinates?.[0];
  if (!Array.isArray(ring)) {
    return null;
  }

  const paths = ring.map(([lng, lat]) => ({ lat, lng }));
  return paths.every((point) => isValidCoordinate(point)) ? paths : null;
}

export function isValidCoordinate(point) {
  return (
    Number.isFinite(point?.lat) &&
    Number.isFinite(point?.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}
