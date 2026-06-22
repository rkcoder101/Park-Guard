#!/usr/bin/env python3
"""Build static PARK-GUARD web data from validated source outputs."""

from __future__ import annotations

import json
import math
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from pyproj import Transformer


ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = ROOT / "input-data"
OUTPUT_DIR = ROOT / "public" / "data"
RECOMMENDATIONS_DIR = OUTPUT_DIR / "recommendations"
TIMEZONE = "Asia/Kolkata"
QUIET_HOUR = pd.Timestamp("2024-04-08 23:00:00+05:30")

EXPECTED_RECOMMENDATION_ROWS = 15021
EXPECTED_ZONE_COUNT = 1163
EXPECTED_LATEST_COUNT = 3
ZONE_SIZE_M = 250.0
ZONE_HALF_SIZE_M = ZONE_SIZE_M / 2.0

SOURCE_FILES = {
    "recommendations": INPUT_DIR / "prototype_dispatch_recommendations.csv",
    "schedule": INPUT_DIR / "prototype_hourly_dispatch_schedule.csv",
    "latest": INPUT_DIR / "latest_dispatch_recommendations.csv",
    "schema": INPUT_DIR / "prototype_schema_manifest.csv",
    "evaluation": INPUT_DIR / "consolidated_evaluation_summary.csv",
    "model_card": INPUT_DIR / "MODEL_CARD.md",
    "zones": INPUT_DIR / "zone_lookup_250m.parquet",
}

RECOMMENDATION_FIELDS = [
    "recommendation_id",
    "target_time",
    "split",
    "selection_order",
    "dispatch_tier",
    "recommended_patrols",
    "deployment_status",
    "zone_index",
    "zone_250m",
    "latitude",
    "longitude",
    "spatial_priority_score",
    "calibrated_pressure",
    "hotspot_probability",
    "hotspot_probability_percent",
    "incident_count",
    "unique_vehicles",
    "distance_neighbour_exposure",
    "active_neighbour_count",
    "current_burst_z",
    "relative_to_same_hour",
    "consecutive_active_hours_before",
    "explicit_road_obstruction",
    "large_vehicle_evidence",
    "multi_offence_evidence",
    "disruption_class",
    "observation_confidence",
    "confidence_tier",
    "verification_required",
    "has_current_incident_evidence",
    "patrol_action",
    "reason_codes",
    "evidence_summary",
    "confidence_note",
    "local_pressure_removed_30pct",
    "local_pressure_removed_60pct",
    "local_pressure_removed_90pct",
    "dispatch_threshold_score",
    "patrol_balance_alpha",
    "coverage_radius_m",
    "scenario_scope",
    "spatial_context_role",
]

SCHEDULE_FIELDS = [
    "target_time",
    "split_code",
    "recommended_patrols",
    "maximum_priority_score",
    "mean_selected_confidence",
    "deployment_status",
]

ZONE_FIELDS = [
    "zone_index",
    "zone_250m",
    "latitude",
    "longitude",
    "centroid_x_m",
    "centroid_y_m",
]

EVALUATION_FIELDS = [
    "section",
    "metric",
    "system_value",
    "comparator_value",
    "relative_change_percent",
    "comparison",
]

FORBIDDEN_OPERATIONAL_FIELDS = {
    "actual_pressure",
    "actual_next_hour_incidents",
    "actual_incident_count",
    "evaluation_label",
    "target_value",
    "future_incidents",
}


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def ensure_required_files() -> None:
    missing = [str(path.relative_to(ROOT)) for path in SOURCE_FILES.values() if not path.exists()]
    if missing:
        fail("missing required source files: " + ", ".join(missing))


def ensure_columns(frame: pd.DataFrame, required: list[str], label: str) -> None:
    missing = [field for field in required if field not in frame.columns]
    if missing:
        fail(f"{label} is missing required columns: {', '.join(missing)}")


def parse_target_time(series: pd.Series, label: str) -> pd.Series:
    parsed = pd.to_datetime(series, errors="coerce")
    if parsed.isna().any():
        bad_count = int(parsed.isna().sum())
        fail(f"{label} contains {bad_count} unparseable target_time value(s)")
    if parsed.dt.tz is None:
        parsed = parsed.dt.tz_localize(TIMEZONE)
    else:
        parsed = parsed.dt.tz_convert(TIMEZONE)
    return parsed


def iso_time(value: pd.Timestamp) -> str:
    return pd.Timestamp(value).isoformat()


def nullable_float(value) -> float | None:
    if pd.isna(value):
        return None
    return float(value)


def nullable_int(value) -> int | None:
    if pd.isna(value):
        return None
    return int(value)


def parse_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and not pd.isna(value):
        return bool(int(value))
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes"}:
            return True
        if normalized in {"false", "0", "no"}:
            return False
    fail(f"cannot parse boolean value: {value!r}")


def split_reason_codes(value) -> list[str]:
    if pd.isna(value) or not str(value).strip():
        return []
    return [code.strip() for code in str(value).split("|") if code.strip()]


def clean_json(value):
    if isinstance(value, dict):
        return {key: clean_json(item) for key, item in value.items()}
    if isinstance(value, list):
        return [clean_json(item) for item in value]
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(clean_json(payload), handle, indent=2, ensure_ascii=False, allow_nan=False)
        handle.write("\n")


def recommendation_to_json(row: pd.Series) -> dict:
    return {
        "recommendationId": str(row["recommendation_id"]),
        "selectionOrder": int(row["selection_order"]),
        "dispatchTier": str(row["dispatch_tier"]),
        "zoneIndex": int(row["zone_index"]),
        "zoneGridId": str(row["zone_250m"]),
        "latitude": float(row["latitude"]),
        "longitude": float(row["longitude"]),
        "priorityScore": float(row["spatial_priority_score"]),
        "expectedPressure": float(row["calibrated_pressure"]),
        "severeHotspotProbability": float(row["hotspot_probability"]),
        "currentIncidents": int(row["incident_count"]),
        "uniqueVehicles": int(row["unique_vehicles"]),
        "nearbyActivity": float(row["distance_neighbour_exposure"]),
        "activeNeighbourCount": int(row["active_neighbour_count"]),
        "currentBurstZ": float(row["current_burst_z"]),
        "relativeToSameHour": float(row["relative_to_same_hour"]),
        "consecutiveActiveHours": int(row["consecutive_active_hours_before"]),
        "roadObstructionEvidence": parse_bool(row["explicit_road_obstruction"]),
        "largeVehicleEvidence": parse_bool(row["large_vehicle_evidence"]),
        "multiOffenceEvidence": parse_bool(row["multi_offence_evidence"]),
        "disruptionClass": str(row["disruption_class"]),
        "dataConfidence": float(row["observation_confidence"]),
        "confidenceTier": str(row["confidence_tier"]),
        "verificationRequired": parse_bool(row["verification_required"]),
        "hasCurrentIncidentEvidence": parse_bool(row["has_current_incident_evidence"]),
        "patrolAction": str(row["patrol_action"]),
        "reasonCodes": split_reason_codes(row["reason_codes"]),
        "evidenceSummary": str(row["evidence_summary"]),
        "confidenceNote": str(row["confidence_note"]),
        "scenarioReduction": {
            "30": float(row["local_pressure_removed_30pct"]),
            "60": float(row["local_pressure_removed_60pct"]),
            "90": float(row["local_pressure_removed_90pct"]),
        },
        "dispatchThresholdScore": float(row["dispatch_threshold_score"]),
        "patrolBalanceAlpha": float(row["patrol_balance_alpha"]),
        "coverageRadiusM": int(row["coverage_radius_m"]),
    }


def validate_recommendations(recommendations: pd.DataFrame) -> None:
    ensure_columns(recommendations, RECOMMENDATION_FIELDS, "prototype_dispatch_recommendations.csv")
    extra_forbidden = [
        column
        for column in recommendations.columns
        if column in FORBIDDEN_OPERATIONAL_FIELDS or column.startswith("actual")
    ]
    if extra_forbidden:
        fail("recommendations include forbidden operational fields: " + ", ".join(extra_forbidden))
    if len(recommendations) != EXPECTED_RECOMMENDATION_ROWS:
        fail(f"expected {EXPECTED_RECOMMENDATION_ROWS} recommendation rows, found {len(recommendations)}")
    if recommendations["recommendation_id"].duplicated().any():
        fail("duplicate recommendation_id values found")
    if recommendations.duplicated(["target_time", "zone_index"]).any():
        fail("duplicate (target_time, zone_index) recommendation rows found")
    if not recommendations["selection_order"].between(1, 25).all():
        fail("selection_order contains values outside 1-25")
    if not recommendations["latitude"].between(-90, 90).all():
        fail("latitude contains values outside [-90, 90]")
    if not recommendations["longitude"].between(-180, 180).all():
        fail("longitude contains values outside [-180, 180]")
    if not recommendations["hotspot_probability"].between(0, 1).all():
        fail("hotspot_probability contains values outside [0, 1]")
    if not recommendations["observation_confidence"].between(0, 1).all():
        fail("observation_confidence contains values outside [0, 1]")
    if (recommendations["calibrated_pressure"] < 0).any():
        fail("calibrated_pressure contains negative values")
    if (
        (recommendations["local_pressure_removed_30pct"] < 0)
        | (recommendations["local_pressure_removed_60pct"] < 0)
        | (recommendations["local_pressure_removed_90pct"] < 0)
    ).any():
        fail("scenario reduction fields contain negative values")
    if (
        (recommendations["local_pressure_removed_30pct"] > recommendations["local_pressure_removed_60pct"])
        | (recommendations["local_pressure_removed_60pct"] > recommendations["local_pressure_removed_90pct"])
    ).any():
        fail("scenario reduction fields are not monotonic")
    if (recommendations["spatial_priority_score"] < recommendations["dispatch_threshold_score"]).any():
        fail("one or more recommendation scores are below the dispatch threshold")


def validate_schedule(schedule: pd.DataFrame, recommendations: pd.DataFrame) -> None:
    ensure_columns(schedule, SCHEDULE_FIELDS, "prototype_hourly_dispatch_schedule.csv")
    if schedule["target_time"].duplicated().any():
        fail("schedule contains duplicate target_time rows")
    counts = recommendations.groupby("target_time_parsed").size().rename("actual_count")
    merged = schedule.set_index("target_time_parsed").join(counts)
    merged["actual_count"] = merged["actual_count"].fillna(0).astype(int)
    mismatch = merged[merged["recommended_patrols"].astype(int) != merged["actual_count"]]
    if not mismatch.empty:
        fail(f"schedule count disagrees with recommendation rows for {len(mismatch)} hour(s)")


def validate_schema_manifest(schema: pd.DataFrame) -> None:
    ensure_columns(schema, ["field", "dtype", "nullable", "description"], "prototype_schema_manifest.csv")
    if list(schema["field"]) != RECOMMENDATION_FIELDS:
        fail("prototype_schema_manifest.csv field order does not match the recommendation contract")


def validate_latest(latest: pd.DataFrame, recommendations: pd.DataFrame) -> None:
    ensure_columns(latest, RECOMMENDATION_FIELDS, "latest_dispatch_recommendations.csv")
    latest["target_time_parsed"] = parse_target_time(latest["target_time"], "latest_dispatch_recommendations.csv")
    if len(latest) != EXPECTED_LATEST_COUNT:
        fail(f"expected {EXPECTED_LATEST_COUNT} latest recommendation rows, found {len(latest)}")
    quiet_rows = recommendations[recommendations["target_time_parsed"] == QUIET_HOUR]
    if len(quiet_rows) != EXPECTED_LATEST_COUNT:
        fail(f"quiet hour {iso_time(QUIET_HOUR)} should contain {EXPECTED_LATEST_COUNT} rows")
    if sorted(latest["recommendation_id"]) != sorted(quiet_rows["recommendation_id"]):
        fail("latest_dispatch_recommendations.csv does not match the quiet/latest hour")


def validate_evaluation(evaluation: pd.DataFrame) -> None:
    ensure_columns(evaluation, EVALUATION_FIELDS, "consolidated_evaluation_summary.csv")


def validate_zones(zones: pd.DataFrame, recommendations: pd.DataFrame) -> None:
    ensure_columns(zones, ZONE_FIELDS, "zone_lookup_250m.parquet")
    if len(zones) != EXPECTED_ZONE_COUNT:
        fail(f"expected {EXPECTED_ZONE_COUNT} zones, found {len(zones)}")
    if zones["zone_index"].duplicated().any():
        fail("zone lookup contains duplicate zone_index values")
    if not zones["latitude"].between(-90, 90).all():
        fail("zone lookup latitude contains values outside [-90, 90]")
    if not zones["longitude"].between(-180, 180).all():
        fail("zone lookup longitude contains values outside [-180, 180]")
    missing_zones = sorted(set(recommendations["zone_index"]) - set(zones["zone_index"]))
    if missing_zones:
        fail("zone lookup is missing referenced zone_index values: " + ", ".join(map(str, missing_zones[:20])))


def compute_peak_demo(recommendations: pd.DataFrame) -> pd.Timestamp:
    peak = (
        recommendations.groupby("target_time_parsed")
        .agg(
            recommended_patrols=("recommended_patrols", "max"),
            score_sum=("spatial_priority_score", "sum"),
        )
        .reset_index()
        .sort_values(
            ["recommended_patrols", "score_sum", "target_time_parsed"],
            ascending=[False, False, True],
        )
        .iloc[0]
    )
    return pd.Timestamp(peak["target_time_parsed"])


def build_daily_recommendations(schedule: pd.DataFrame, recommendations: pd.DataFrame) -> list[dict]:
    if RECOMMENDATIONS_DIR.exists():
        shutil.rmtree(RECOMMENDATIONS_DIR)
    RECOMMENDATIONS_DIR.mkdir(parents=True, exist_ok=True)

    recommendation_files = []
    recommendations_by_time = {
        target_time: group.sort_values("selection_order")
        for target_time, group in recommendations.groupby("target_time_parsed")
    }

    schedule = schedule.sort_values("target_time_parsed").copy()
    schedule["target_date"] = schedule["target_time_parsed"].dt.strftime("%Y-%m-%d")

    for date, day_schedule in schedule.groupby("target_date", sort=True):
        hours = []
        recommendation_count = 0
        for _, schedule_row in day_schedule.iterrows():
            target_time = schedule_row["target_time_parsed"]
            selected = recommendations_by_time.get(target_time)
            recs = []
            if selected is not None:
                recs = [recommendation_to_json(row) for _, row in selected.iterrows()]
                recommendation_count += len(recs)
            hours.append(
                {
                    "targetTime": iso_time(target_time),
                    "recommendedPatrols": int(schedule_row["recommended_patrols"]),
                    "deploymentStatus": str(schedule_row["deployment_status"]),
                    "recommendations": recs,
                }
            )

        path = f"recommendations/{date}.json"
        write_json(
            OUTPUT_DIR / path,
            {
                "date": date,
                "timezone": TIMEZONE,
                "hours": hours,
            },
        )
        recommendation_files.append(
            {
                "date": date,
                "path": path,
                "hourCount": int(len(day_schedule)),
                "recommendationCount": int(recommendation_count),
            }
        )

    return recommendation_files


def build_schedule(schedule: pd.DataFrame) -> dict:
    entries = []
    for _, row in schedule.sort_values("target_time_parsed").iterrows():
        date = row["target_time_parsed"].strftime("%Y-%m-%d")
        entries.append(
            {
                "targetTime": iso_time(row["target_time_parsed"]),
                "recommendedPatrols": int(row["recommended_patrols"]),
                "maximumPriorityScore": nullable_float(row["maximum_priority_score"]),
                "meanSelectedConfidence": nullable_float(row["mean_selected_confidence"]),
                "deploymentStatus": str(row["deployment_status"]),
                "dataFile": f"recommendations/{date}.json",
            }
        )
    return {"timezone": TIMEZONE, "entries": entries}


def build_zones_geojson(zones: pd.DataFrame) -> dict:
    transformer = Transformer.from_crs("EPSG:32643", "EPSG:4326", always_xy=True)
    features = []
    for _, row in zones.sort_values("zone_index").iterrows():
        center_x = float(row["centroid_x_m"])
        center_y = float(row["centroid_y_m"])
        corners = [
            (center_x - ZONE_HALF_SIZE_M, center_y - ZONE_HALF_SIZE_M),
            (center_x + ZONE_HALF_SIZE_M, center_y - ZONE_HALF_SIZE_M),
            (center_x + ZONE_HALF_SIZE_M, center_y + ZONE_HALF_SIZE_M),
            (center_x - ZONE_HALF_SIZE_M, center_y + ZONE_HALF_SIZE_M),
            (center_x - ZONE_HALF_SIZE_M, center_y - ZONE_HALF_SIZE_M),
        ]
        ring = []
        for x, y in corners:
            lon, lat = transformer.transform(x, y)
            ring.append([float(lon), float(lat)])
        if ring[0] != ring[-1]:
            fail(f"generated polygon for zone {row['zone_index']} is not closed")
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ring],
                },
                "properties": {
                    "zoneIndex": int(row["zone_index"]),
                    "zoneGridId": str(row["zone_250m"]),
                    "centroid": {
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                    },
                },
            }
        )
    if len(features) != EXPECTED_ZONE_COUNT:
        fail(f"generated {len(features)} zone features, expected {EXPECTED_ZONE_COUNT}")
    return {"type": "FeatureCollection", "features": features}


def build_evaluation_summary(evaluation: pd.DataFrame) -> dict:
    pressure = evaluation.loc[
        (evaluation["section"] == "Frozen forecast")
        & (evaluation["metric"] == "Pressure capture at K=25"),
        "system_value",
    ].iloc[0]
    hotspot = evaluation.loc[
        (evaluation["section"] == "Frozen forecast")
        & (evaluation["metric"] == "Hotspot recall at K=25 and threshold=8"),
        "system_value",
    ].iloc[0]
    patrol_reduction = evaluation.loc[
        (evaluation["section"] == "Adaptive dispatch")
        & (evaluation["metric"] == "Mean patrols deployed at capacity 25"),
        "relative_change_percent",
    ].iloc[0]
    return {
        "headline": {
            "pressureCaptureAt25": round(float(pressure), 4),
            "hotspotRecallAt25": round(float(hotspot), 4),
            "averagePatrolReductionPercent": round(abs(float(patrol_reduction)), 4),
        },
        "display": {
            "pressureCaptureAt25": "39.93%",
            "hotspotRecallAt25": "50.24%",
            "averagePatrolReductionPercent": "44.7%",
            "caption": "Evaluated on the held-out historical test period.",
        },
        "rows": evaluation[EVALUATION_FIELDS].to_dict(orient="records"),
    }


def build_metadata(
    schedule: pd.DataFrame,
    recommendations: pd.DataFrame,
    zones: pd.DataFrame,
    peak_demo: pd.Timestamp,
) -> dict:
    schedule_sorted = schedule.sort_values("target_time_parsed")
    return {
        "product": "PARK-GUARD",
        "timezone": TIMEZONE,
        "historicalSimulation": True,
        "minimumTargetTime": iso_time(schedule_sorted["target_time_parsed"].iloc[0]),
        "maximumTargetTime": iso_time(schedule_sorted["target_time_parsed"].iloc[-1]),
        "availableDates": sorted(schedule_sorted["target_time_parsed"].dt.strftime("%Y-%m-%d").unique()),
        "zoneCount": int(len(zones)),
        "recommendationCount": int(len(recommendations)),
        "latestHistoricalHour": iso_time(schedule_sorted["target_time_parsed"].iloc[-1]),
        "dispatchThresholdScore": float(recommendations["dispatch_threshold_score"].iloc[0]),
        "patrolBalanceAlpha": float(recommendations["patrol_balance_alpha"].iloc[0]),
        "coverageRadiusM": int(recommendations["coverage_radius_m"].iloc[0]),
        "peakDemoTargetTime": iso_time(peak_demo),
        "quietHourTargetTime": iso_time(QUIET_HOUR),
        "limitations": {
            "scenarioIsCausal": False,
            "spatialContextIsPropagation": False,
            "automaticEnforcement": False,
        },
    }


def output_size_summary() -> tuple[int, int]:
    files = [path for path in OUTPUT_DIR.rglob("*") if path.is_file()]
    return len(files), sum(path.stat().st_size for path in files)


def main() -> None:
    ensure_required_files()

    recommendations = pd.read_csv(SOURCE_FILES["recommendations"])
    schedule = pd.read_csv(SOURCE_FILES["schedule"])
    latest = pd.read_csv(SOURCE_FILES["latest"])
    schema = pd.read_csv(SOURCE_FILES["schema"])
    evaluation = pd.read_csv(SOURCE_FILES["evaluation"])
    zones = pd.read_parquet(SOURCE_FILES["zones"])

    recommendations["target_time_parsed"] = parse_target_time(
        recommendations["target_time"], "prototype_dispatch_recommendations.csv"
    )
    schedule["target_time_parsed"] = parse_target_time(
        schedule["target_time"], "prototype_hourly_dispatch_schedule.csv"
    )

    validate_recommendations(recommendations)
    validate_schedule(schedule, recommendations)
    validate_schema_manifest(schema)
    validate_latest(latest, recommendations)
    validate_evaluation(evaluation)
    validate_zones(zones, recommendations)

    peak_demo = compute_peak_demo(recommendations)
    if QUIET_HOUR != schedule["target_time_parsed"].max():
        fail(f"quiet hour {iso_time(QUIET_HOUR)} is not the latest historical hour")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    recommendation_files = build_daily_recommendations(schedule, recommendations)

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    write_json(
        OUTPUT_DIR / "manifest.json",
        {
            "version": 1,
            "generatedAt": generated_at,
            "recommendationFiles": recommendation_files,
        },
    )
    write_json(
        OUTPUT_DIR / "metadata.json",
        build_metadata(schedule, recommendations, zones, peak_demo),
    )
    write_json(OUTPUT_DIR / "schedule.json", build_schedule(schedule))
    latest_rows = recommendations[recommendations["target_time_parsed"] == QUIET_HOUR].sort_values(
        "selection_order"
    )
    write_json(
        OUTPUT_DIR / "latest-recommendations.json",
        {
            "timezone": TIMEZONE,
            "targetTime": iso_time(QUIET_HOUR),
            "recommendedPatrols": int(latest_rows["recommended_patrols"].iloc[0]),
            "deploymentStatus": str(latest_rows["deployment_status"].iloc[0]),
            "recommendations": [
                recommendation_to_json(row) for _, row in latest_rows.iterrows()
            ],
        },
    )
    write_json(OUTPUT_DIR / "evaluation-summary.json", build_evaluation_summary(evaluation))
    write_json(OUTPUT_DIR / "zones.geojson", build_zones_geojson(zones))

    file_count, byte_count = output_size_summary()
    zero_hours = int((schedule["recommended_patrols"] == 0).sum())
    deployed_hours = int(schedule["target_time_parsed"].nunique() - zero_hours)
    print("PARK-GUARD data build complete")
    print(f"Recommendations: {len(recommendations):,} rows across {deployed_hours:,} deployed hours")
    print(f"Schedule: {len(schedule):,} hours ({zero_hours:,} zero-deployment hours)")
    print(f"Zones: {len(zones):,} generated 250 m polygons")
    print(
        "Date range: "
        f"{schedule['target_time_parsed'].min().strftime('%Y-%m-%d %H:%M %Z')} to "
        f"{schedule['target_time_parsed'].max().strftime('%Y-%m-%d %H:%M %Z')}"
    )
    print(f"Peak Demo: {iso_time(peak_demo)}")
    print(f"Quiet Hour: {iso_time(QUIET_HOUR)} ({len(latest_rows)} recommendations)")
    print(f"Output: {OUTPUT_DIR.relative_to(ROOT)} ({file_count} files, {byte_count:,} bytes)")


if __name__ == "__main__":
    main()
