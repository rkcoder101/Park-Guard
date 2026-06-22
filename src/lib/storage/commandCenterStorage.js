const STORAGE_KEY = "park_guard_ui_state_v1";

const persistedKeys = [
  "mode",
  "selectedTargetTime",
  "playbackSpeed",
  "capacity",
  "filters",
  "visibleMetric",
  "showAllZones",
  "scenario",
  "selectedZoneId",
];

export function loadPersistedCommandState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Unable to read PARK-GUARD UI state", error);
    return null;
  }
}

export function persistCommandState(state) {
  try {
    const payload = {};
    for (const key of persistedKeys) {
      payload[key] = state[key];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Unable to persist PARK-GUARD UI state", error);
  }
}
