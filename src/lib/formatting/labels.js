const actionLabels = {
  active_parking_enforcement: "Active parking enforcement",
  preventive_patrol: "Preventive patrol",
  targeted_obstruction_enforcement: "Targeted obstruction enforcement",
  verify_before_enforcement: "Verify before enforcement",
};

const confidenceLabels = {
  high_confidence: "High confidence",
  low_confidence: "Low confidence",
  medium_confidence: "Medium confidence",
};

const dispatchTierLabels = {
  extended_coverage: "Extended coverage",
  highest_priority: "Highest priority",
  secondary_priority: "Secondary priority",
};

export function formatAction(value) {
  return actionLabels[value] ?? formatUnknownLabel(value);
}

export function formatConfidenceTier(value) {
  return confidenceLabels[value] ?? formatUnknownLabel(value);
}

export function formatDispatchTier(value) {
  return dispatchTierLabels[value] ?? formatUnknownLabel(value);
}

export function formatUnknownLabel(value) {
  return String(value || "Unknown")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
