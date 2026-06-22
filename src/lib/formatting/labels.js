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

const disruptionClassLabels = {
  compounded_disruption_evidence: "Compounded disruption evidence",
  no_explicit_context: "No explicit obstruction context",
  single_context_signal: "Single context signal",
};

const reasonCodeLabels = {
  ABOVE_USUAL_SAME_HOUR: "Above usual same-hour activity",
  CURRENT_INCIDENT_ACTIVITY: "Current incident activity",
  FORECAST_RECURRENCE_SIGNAL: "Forecast recurrence signal",
  LARGE_VEHICLE_EVIDENCE: "Large-vehicle evidence",
  MULTIPLE_OFFENCE_EVIDENCE: "Multiple-offence evidence",
  NEARBY_ACTIVITY: "Nearby parking activity",
  ON_SITE_VERIFICATION_REQUIRED: "On-site verification required",
  PERSISTENT_RECENT_ACTIVITY: "Persistent recent activity",
  ROAD_INTERFACE_EVIDENCE: "Road-interface evidence",
  TEMPORAL_BURST: "Temporal burst",
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

export function formatDisruptionClass(value) {
  return disruptionClassLabels[value] ?? formatUnknownLabel(value);
}

export function formatReasonCode(value) {
  return reasonCodeLabels[value] ?? formatUnknownLabel(value);
}

export function formatUnknownLabel(value) {
  return String(value || "Unknown")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
