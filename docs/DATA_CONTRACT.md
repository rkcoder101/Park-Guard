# PARK-GUARD Frontend Data Contract

## 1. Purpose

This document defines the exact operational data that the web application may consume. Codex must not invent fields, infer actual future outcomes, or silently rename fields outside the preprocessing boundary.

The browser should consume generated JSON/GeoJSON, not raw CSV or Parquet.

---

## 2. Source recommendation fields

The source file `prototype_dispatch_recommendations.csv` contains 42 operational fields.

| Field | Type | Frontend meaning |
|---|---|---|
| recommendation_id | string | Unique target-hour and zone recommendation ID |
| target_time | timestamp | Forecast target hour in IST |
| split | string | Historical model split; may be retained internally, usually hidden |
| selection_order | integer | Balanced patrol priority order for the hour |
| dispatch_tier | string | `highest_priority`, `secondary_priority`, or `extended_coverage` |
| recommended_patrols | integer | Adaptive number of recommendations for the target hour |
| deployment_status | string | Deployment recommendation status |
| zone_index | integer | Internal 250 m zone ID |
| zone_250m | string | Grid identifier |
| latitude | number | Zone centroid latitude |
| longitude | number | Zone centroid longitude |
| spatial_priority_score | number | Patrol priority score |
| calibrated_pressure | number | Expected next-hour parking pressure |
| hotspot_probability | number | Severe-hotspot probability in [0,1] |
| hotspot_probability_percent | number | Severe-hotspot probability in percent |
| incident_count | integer | Current-hour incidents |
| unique_vehicles | integer | Current-hour unique vehicles |
| distance_neighbour_exposure | number | Nearby parking activity |
| active_neighbour_count | integer | Number of active nearby zones |
| current_burst_z | number | Current activity burst relative to recent history |
| relative_to_same_hour | number | Activity relative to usual same-hour level |
| consecutive_active_hours_before | integer | Consecutive recent active hours |
| explicit_road_obstruction | boolean/integer | Road-interface evidence present |
| large_vehicle_evidence | boolean/integer | Large-vehicle evidence present |
| multi_offence_evidence | boolean/integer | Multiple-offence evidence present |
| disruption_class | string | Obstruction-evidence class |
| observation_confidence | number | Data confidence in [0,1] |
| confidence_tier | string | `low_confidence`, `medium_confidence`, or `high_confidence` |
| verification_required | boolean | On-site verification required |
| has_current_incident_evidence | boolean | Current incident evidence present |
| patrol_action | string | Recommended operational action |
| reason_codes | string | Pipe-separated machine-readable reasons |
| evidence_summary | string | Human-readable explanation |
| confidence_note | string | Confidence explanation |
| local_pressure_removed_30pct | number | 30% hypothetical local reduction |
| local_pressure_removed_60pct | number | 60% hypothetical local reduction |
| local_pressure_removed_90pct | number | 90% hypothetical local reduction |
| dispatch_threshold_score | number | Validation-selected minimum dispatch score |
| patrol_balance_alpha | number | Direct-risk/coverage balance, currently 0.60 |
| coverage_radius_m | number | Coverage radius, currently 500 m |
| scenario_scope | string | Non-causal scenario warning |
| spatial_context_role | string | Spatial-context limitation |

### Forbidden operational fields

Do not include or display:

- `actual_pressure`
- actual next-hour incident outcomes
- evaluation labels
- model-training split target values
- any future information used only for offline evaluation

---

## 3. Recommendation JSON shape

Each date file should use:

```json
{
  "date": "2024-04-08",
  "timezone": "Asia/Kolkata",
  "hours": [
    {
      "targetTime": "2024-04-08T23:00:00+05:30",
      "recommendedPatrols": 3,
      "deploymentStatus": "deployment_recommended",
      "recommendations": []
    }
  ]
}
```

Each recommendation should be transformed to camelCase:

```json
{
  "recommendationId": "20240408T230000+0530_Z401",
  "selectionOrder": 1,
  "dispatchTier": "highest_priority",
  "zoneIndex": 401,
  "zoneGridId": "250_3118_5738",
  "latitude": 12.9643,
  "longitude": 77.5769,
  "priorityScore": 0.751,
  "expectedPressure": 0.6709,
  "severeHotspotProbability": 0.021235,
  "currentIncidents": 0,
  "uniqueVehicles": 0,
  "nearbyActivity": 0.0366,
  "activeNeighbourCount": 1,
  "currentBurstZ": 0,
  "relativeToSameHour": 0,
  "consecutiveActiveHours": 0,
  "roadObstructionEvidence": false,
  "largeVehicleEvidence": false,
  "multiOffenceEvidence": false,
  "disruptionClass": "no_explicit_context",
  "dataConfidence": 0.91,
  "confidenceTier": "high_confidence",
  "verificationRequired": false,
  "hasCurrentIncidentEvidence": false,
  "patrolAction": "preventive_patrol",
  "reasonCodes": ["FORECAST_RECURRENCE_SIGNAL"],
  "evidenceSummary": "Forecast recurrence without current contextual evidence",
  "confidenceNote": "Strong historical observation support",
  "scenarioReduction": {
    "30": 0.2013,
    "60": 0.4025,
    "90": 0.6038
  },
  "dispatchThresholdScore": 0.5886576772,
  "patrolBalanceAlpha": 0.6,
  "coverageRadiusM": 500
}
```

Values above are illustrative of the known latest-hour output. The preprocessing script must use source values, not copy example values.

### Reason codes

Split the source string on `|`.

Known codes include:

- `CURRENT_INCIDENT_ACTIVITY`
- `TEMPORAL_BURST`
- `ABOVE_USUAL_SAME_HOUR`
- `PERSISTENT_RECENT_ACTIVITY`
- `NEARBY_ACTIVITY`
- `ROAD_INTERFACE_EVIDENCE`
- `LARGE_VEHICLE_EVIDENCE`
- `MULTIPLE_OFFENCE_EVIDENCE`
- `ON_SITE_VERIFICATION_REQUIRED`
- `FORECAST_RECURRENCE_SIGNAL`

Unknown future codes should remain displayable through a safe formatter rather than crash the UI.

---

## 4. Schedule source

Expected source fields:

| Field | Meaning |
|---|---|
| target_time | Target hour in IST |
| split_code | Historical split identifier |
| recommended_patrols | Adaptive patrol count |
| maximum_priority_score | Maximum score among selected recommendations |
| mean_selected_confidence | Mean selected confidence |
| deployment_status | `deployment_recommended` or `no_deployment_recommended` |

Generated `schedule.json`:

```json
{
  "timezone": "Asia/Kolkata",
  "entries": [
    {
      "targetTime": "2024-04-08T23:00:00+05:30",
      "recommendedPatrols": 3,
      "maximumPriorityScore": 0.751,
      "meanSelectedConfidence": 0.9087,
      "deploymentStatus": "deployment_recommended",
      "dataFile": "recommendations/2024-04-08.json"
    }
  ]
}
```

For zero-deployment hours, maximum score or mean confidence may be null. The UI must handle null correctly.

---

## 5. Zone GeoJSON

Generated from `zone_lookup_250m.parquet`.

Feature shape:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  },
  "properties": {
    "zoneIndex": 401,
    "zoneGridId": "250_3118_5738",
    "centroid": {
      "latitude": 12.9643,
      "longitude": 77.5769
    }
  }
}
```

Required collection checks:

- `FeatureCollection`
- exactly 1,163 features
- unique `zoneIndex`
- valid closed polygon rings
- WGS84 longitude/latitude order

---

## 6. Evaluation summary

Source fields:

```text
section
metric
system_value
comparator_value
relative_change_percent
comparison
```

Generated file should retain all rows but provide a `headline` section with these exact values:

```json
{
  "pressureCaptureAt25": 0.3993,
  "hotspotRecallAt25": 0.5024,
  "averagePatrolReductionPercent": 44.6985
}
```

Display values:

- `39.93%`
- `50.24%`
- `44.7%`

Do not convert the retained percentages incorrectly. For example, 95.0369 in the source is a percentage retained, not 0.950369 unless intentionally normalized.

---

## 7. Metadata and manifest

### `manifest.json`

```json
{
  "version": 1,
  "generatedAt": "ISO timestamp",
  "recommendationFiles": [
    {
      "date": "2024-04-08",
      "path": "recommendations/2024-04-08.json",
      "hourCount": 24,
      "recommendationCount": 0
    }
  ]
}
```

### `metadata.json`

```json
{
  "product": "PARK-GUARD",
  "timezone": "Asia/Kolkata",
  "historicalSimulation": true,
  "minimumTargetTime": "...",
  "maximumTargetTime": "...",
  "zoneCount": 1163,
  "recommendationCount": 15021,
  "dispatchThresholdScore": 0.5886576771736145,
  "patrolBalanceAlpha": 0.6,
  "coverageRadiusM": 500,
  "peakDemoTargetTime": "...",
  "quietHourTargetTime": "2024-04-08T23:00:00+05:30",
  "limitations": {
    "scenarioIsCausal": false,
    "spatialContextIsPropagation": false,
    "automaticEnforcement": false
  }
}
```

---

## 8. Frontend enums and formatting

### Patrol action

Source values and labels:

| Value | Label |
|---|---|
| `preventive_patrol` | Preventive patrol |
| `verify_before_enforcement` | Verify before enforcement |
| `targeted_obstruction_enforcement` | Targeted obstruction enforcement |
| `active_parking_enforcement` | Active parking enforcement |

### Confidence tier

| Value | Label |
|---|---|
| `low_confidence` | Low confidence |
| `medium_confidence` | Medium confidence |
| `high_confidence` | High confidence |

### Dispatch tier

| Value | Label |
|---|---|
| `highest_priority` | Highest priority |
| `secondary_priority` | Secondary priority |
| `extended_coverage` | Extended coverage |

### Disruption class

| Value | Label |
|---|---|
| `no_explicit_context` | No explicit obstruction context |
| `single_context_signal` | Single context signal |
| `compounded_disruption_evidence` | Compounded disruption evidence |

Do not expose raw snake_case values in the UI.

---

## 9. Runtime validation rules

Before rendering a recommendation:

- target time must parse;
- zone ID must exist;
- latitude must be [-90, 90];
- longitude must be [-180, 180];
- selection order must be 1–25;
- probability and confidence must be [0, 1];
- scenario reductions must be non-negative;
- scenario values should be monotonic: 30 ≤ 60 ≤ 90;
- expected pressure must be non-negative;
- priority score must be at least the packaged threshold;
- coverage radius must be positive.

Invalid records should be skipped with a developer warning and summarized in a controlled data-error state if the selected hour becomes unusable.
