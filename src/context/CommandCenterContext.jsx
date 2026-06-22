import { useEffect, useMemo, useReducer } from "react";
import { CommandCenterContext } from "./commandCenterContextObject.js";
import {
  loadCommandCenterBootstrap,
  loadDailyRecommendations,
} from "../lib/data/dataApi.js";
import { getDatePart } from "../lib/formatting/dateTime.js";
import {
  loadPersistedCommandState,
  persistCommandState,
} from "../lib/storage/commandCenterStorage.js";

const playbackIntervals = {
  0.5: 4000,
  1: 2400,
  2: 1200,
};

const initialState = {
  bootstrapStatus: "loading",
  dailyStatus: "idle",
  error: null,
  dailyError: null,
  manifest: null,
  metadata: null,
  schedule: null,
  zones: null,
  dailyFiles: {},
  mode: "simulated-live",
  selectedTargetTime: null,
  playbackSpeed: 1,
  isPlaying: false,
  capacity: 5,
  selectedZoneId: null,
  searchQuery: "",
  filters: {
    confidenceTier: "all",
    patrolAction: "all",
    disruptionClass: "all",
    verificationRequired: "all",
    currentIncidentEvidence: "all",
  },
  visibleMetric: "priority",
  showAllZones: false,
  scenario: 60,
};

function hasScheduleTime(schedule, targetTime) {
  return Boolean(schedule?.entries?.some((entry) => entry.targetTime === targetTime));
}

function getScheduleIndex(schedule, targetTime) {
  return schedule?.entries?.findIndex((entry) => entry.targetTime === targetTime) ?? -1;
}

function getDefaultTargetTime(metadata, schedule, persisted) {
  if (persisted?.selectedTargetTime && hasScheduleTime(schedule, persisted.selectedTargetTime)) {
    return persisted.selectedTargetTime;
  }
  if (metadata?.peakDemoTargetTime && hasScheduleTime(schedule, metadata.peakDemoTargetTime)) {
    return metadata.peakDemoTargetTime;
  }
  return schedule.entries[0]?.targetTime ?? null;
}

function reducer(state, action) {
  switch (action.type) {
    case "BOOTSTRAP_SUCCESS": {
      const { manifest, metadata, schedule, zones, persisted } = action.payload;
      const selectedTargetTime = getDefaultTargetTime(metadata, schedule, persisted);
      return {
        ...state,
        ...sanitizePersistedState(persisted),
        bootstrapStatus: "ready",
        error: null,
        manifest,
        metadata,
        schedule,
        zones,
        selectedTargetTime,
      };
    }
    case "BOOTSTRAP_ERROR":
      return {
        ...state,
        bootstrapStatus: "error",
        error: action.error,
      };
    case "DAILY_LOAD_START":
      return {
        ...state,
        dailyStatus: "loading",
        dailyError: null,
      };
    case "DAILY_LOAD_SUCCESS":
      return {
        ...state,
        dailyStatus: "ready",
        dailyError: null,
        dailyFiles: {
          ...state.dailyFiles,
          [action.payload.date]: action.payload.data,
        },
      };
    case "DAILY_LOAD_ERROR":
      return {
        ...state,
        dailyStatus: "error",
        dailyError: action.error,
      };
    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        selectedTargetTime:
          action.mode === "simulated-live"
            ? state.metadata?.peakDemoTargetTime ?? state.selectedTargetTime
            : state.selectedTargetTime,
        isPlaying: false,
      };
    case "SET_TARGET_TIME":
      return {
        ...state,
        selectedTargetTime: action.targetTime,
        selectedZoneId: null,
      };
    case "STEP_TIME": {
      const currentIndex = getScheduleIndex(state.schedule, state.selectedTargetTime);
      if (currentIndex < 0) {
        return state;
      }
      const nextIndex = currentIndex + action.delta;
      if (nextIndex < 0 || nextIndex >= state.schedule.entries.length) {
        return { ...state, isPlaying: false };
      }
      return {
        ...state,
        selectedTargetTime: state.schedule.entries[nextIndex].targetTime,
        selectedZoneId: null,
      };
    }
    case "SET_PLAYING":
      return {
        ...state,
        isPlaying: action.isPlaying,
      };
    case "SET_PLAYBACK_SPEED":
      return {
        ...state,
        playbackSpeed: action.speed,
      };
    case "SET_CAPACITY":
      return {
        ...state,
        capacity: action.capacity,
      };
    case "SET_SELECTED_ZONE":
      return {
        ...state,
        selectedZoneId: action.zoneId,
      };
    case "SET_DATE": {
      const firstHour = state.schedule.entries.find((entry) =>
        entry.targetTime.startsWith(action.date),
      );
      return firstHour
        ? { ...state, selectedTargetTime: firstHour.targetTime, selectedZoneId: null }
        : state;
    }
    case "SET_SHOW_ALL_ZONES":
      return {
        ...state,
        showAllZones: action.showAllZones,
      };
    case "SET_VISIBLE_METRIC":
      return {
        ...state,
        visibleMetric: action.visibleMetric,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.searchQuery,
      };
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.name]: action.value,
        },
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        searchQuery: "",
        filters: initialState.filters,
      };
    case "SET_SCENARIO":
      return {
        ...state,
        scenario: action.scenario,
      };
    default:
      return state;
  }
}

function sanitizePersistedState(persisted) {
  if (!persisted) {
    return {};
  }
  return {
    mode: ["simulated-live", "historical"].includes(persisted.mode)
      ? persisted.mode
      : initialState.mode,
    playbackSpeed: [0.5, 1, 2].includes(Number(persisted.playbackSpeed))
      ? Number(persisted.playbackSpeed)
      : initialState.playbackSpeed,
    capacity: [5, 10, "all"].includes(persisted.capacity)
      ? persisted.capacity
      : initialState.capacity,
    filters:
      persisted.filters && typeof persisted.filters === "object"
        ? { ...initialState.filters, ...persisted.filters }
        : initialState.filters,
    visibleMetric: persisted.visibleMetric || initialState.visibleMetric,
    showAllZones: Boolean(persisted.showAllZones),
    scenario: [30, 60, 90].includes(Number(persisted.scenario))
      ? Number(persisted.scenario)
      : initialState.scenario,
    selectedZoneId: persisted.selectedZoneId ?? null,
  };
}

export function CommandCenterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let isActive = true;
    const persisted = loadPersistedCommandState();

    loadCommandCenterBootstrap()
      .then((payload) => {
        if (isActive) {
          dispatch({
            type: "BOOTSTRAP_SUCCESS",
            payload: { ...payload, persisted },
          });
        }
      })
      .catch((error) => {
        if (isActive) {
          dispatch({ type: "BOOTSTRAP_ERROR", error });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectedScheduleEntry = useMemo(() => {
    return state.schedule?.entries?.find(
      (entry) => entry.targetTime === state.selectedTargetTime,
    );
  }, [state.schedule, state.selectedTargetTime]);

  useEffect(() => {
    if (!selectedScheduleEntry) {
      return;
    }

    const date = getDatePart(selectedScheduleEntry.targetTime);
    if (state.dailyFiles[date]) {
      return;
    }

    let isActive = true;
    dispatch({ type: "DAILY_LOAD_START" });
    loadDailyRecommendations(selectedScheduleEntry.dataFile)
      .then((data) => {
        if (isActive) {
          dispatch({ type: "DAILY_LOAD_SUCCESS", payload: { date, data } });
        }
      })
      .catch((error) => {
        if (isActive) {
          dispatch({ type: "DAILY_LOAD_ERROR", error });
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedScheduleEntry, state.dailyFiles]);

  useEffect(() => {
    if (state.bootstrapStatus === "ready") {
      persistCommandState(state);
    }
  }, [state]);

  useEffect(() => {
    if (!state.isPlaying || state.bootstrapStatus !== "ready") {
      return;
    }

    const timer = window.setInterval(() => {
      dispatch({ type: "STEP_TIME", delta: 1 });
    }, playbackIntervals[state.playbackSpeed] ?? playbackIntervals[1]);

    return () => {
      window.clearInterval(timer);
    };
  }, [state.bootstrapStatus, state.isPlaying, state.playbackSpeed]);

  const selectedDailyFile = useMemo(() => {
    if (!state.selectedTargetTime) {
      return null;
    }
    return state.dailyFiles[getDatePart(state.selectedTargetTime)] ?? null;
  }, [state.dailyFiles, state.selectedTargetTime]);

  const selectedHour = useMemo(() => {
    return (
      selectedDailyFile?.hours?.find(
        (hour) => hour.targetTime === state.selectedTargetTime,
      ) ?? null
    );
  }, [selectedDailyFile, state.selectedTargetTime]);

  const recommendations = useMemo(
    () => selectedHour?.recommendations ?? [],
    [selectedHour],
  );
  const capacityRecommendations = useMemo(() => {
    if (state.capacity === "all") {
      return recommendations;
    }
    return recommendations.slice(0, state.capacity);
  }, [recommendations, state.capacity]);
  const visibleRecommendations = useMemo(() => {
    return capacityRecommendations.filter((recommendation) =>
      recommendationMatchesFilters(recommendation, state.searchQuery, state.filters),
    );
  }, [capacityRecommendations, state.filters, state.searchQuery]);
  const selectedRecommendation = useMemo(() => {
    return (
      recommendations.find(
        (recommendation) => recommendation.zoneIndex === state.selectedZoneId,
      ) ?? null
    );
  }, [recommendations, state.selectedZoneId]);

  const availableDates = useMemo(
    () => state.metadata?.availableDates ?? [],
    [state.metadata],
  );
  const availableHoursForSelectedDate = useMemo(() => {
    if (!state.schedule || !state.selectedTargetTime) {
      return [];
    }
    const selectedDate = getDatePart(state.selectedTargetTime);
    return state.schedule.entries.filter((entry) =>
      entry.targetTime.startsWith(selectedDate),
    );
  }, [state.schedule, state.selectedTargetTime]);

  const currentIndex = getScheduleIndex(state.schedule, state.selectedTargetTime);
  const canGoPrevious = currentIndex > 0;
  const canGoNext =
    state.schedule?.entries && currentIndex >= 0
      ? currentIndex < state.schedule.entries.length - 1
      : false;

  const actions = useMemo(
    () => ({
      goToPeakDemo: () => {
        dispatch({
          type: "SET_TARGET_TIME",
          targetTime: state.metadata?.peakDemoTargetTime,
        });
      },
      goToQuietHour: () => {
        dispatch({
          type: "SET_TARGET_TIME",
          targetTime: state.metadata?.quietHourTargetTime,
        });
      },
      nextHour: () => dispatch({ type: "STEP_TIME", delta: 1 }),
      previousHour: () => dispatch({ type: "STEP_TIME", delta: -1 }),
      setCapacity: (capacity) => dispatch({ type: "SET_CAPACITY", capacity }),
      setDate: (date) => dispatch({ type: "SET_DATE", date }),
      setMode: (mode) => dispatch({ type: "SET_MODE", mode }),
      setPlaybackSpeed: (speed) =>
        dispatch({ type: "SET_PLAYBACK_SPEED", speed }),
      setPlaying: (isPlaying) => dispatch({ type: "SET_PLAYING", isPlaying }),
      setSelectedTargetTime: (targetTime) =>
        dispatch({ type: "SET_TARGET_TIME", targetTime }),
      setSelectedZoneId: (zoneId) =>
        dispatch({ type: "SET_SELECTED_ZONE", zoneId }),
      setShowAllZones: (showAllZones) =>
        dispatch({ type: "SET_SHOW_ALL_ZONES", showAllZones }),
      setVisibleMetric: (visibleMetric) =>
        dispatch({ type: "SET_VISIBLE_METRIC", visibleMetric }),
      setSearchQuery: (searchQuery) =>
        dispatch({ type: "SET_SEARCH_QUERY", searchQuery }),
      setFilter: (name, value) => dispatch({ type: "SET_FILTER", name, value }),
      clearFilters: () => dispatch({ type: "CLEAR_FILTERS" }),
      setScenario: (scenario) => dispatch({ type: "SET_SCENARIO", scenario }),
    }),
    [state.metadata],
  );

  const value = useMemo(
    () => ({
      ...state,
      actions,
      availableDates,
      availableHoursForSelectedDate,
      canGoNext,
      canGoPrevious,
      currentIndex,
      capacityRecommendations,
      recommendations,
      selectedHour,
      selectedRecommendation,
      selectedScheduleEntry,
      visibleRecommendations,
    }),
    [
      actions,
      availableDates,
      availableHoursForSelectedDate,
      canGoNext,
      canGoPrevious,
      capacityRecommendations,
      currentIndex,
      recommendations,
      selectedHour,
      selectedRecommendation,
      selectedScheduleEntry,
      state,
      visibleRecommendations,
    ],
  );

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
}

function recommendationMatchesFilters(recommendation, searchQuery, filters) {
  const query = searchQuery.trim().toLowerCase();
  if (
    query &&
    !String(recommendation.zoneIndex).includes(query) &&
    !String(recommendation.zoneGridId).toLowerCase().includes(query)
  ) {
    return false;
  }

  if (
    filters.confidenceTier !== "all" &&
    recommendation.confidenceTier !== filters.confidenceTier
  ) {
    return false;
  }
  if (
    filters.patrolAction !== "all" &&
    recommendation.patrolAction !== filters.patrolAction
  ) {
    return false;
  }
  if (
    filters.disruptionClass !== "all" &&
    recommendation.disruptionClass !== filters.disruptionClass
  ) {
    return false;
  }
  if (
    filters.verificationRequired !== "all" &&
    String(recommendation.verificationRequired) !== filters.verificationRequired
  ) {
    return false;
  }
  if (
    filters.currentIncidentEvidence !== "all" &&
    String(recommendation.hasCurrentIncidentEvidence) !==
      filters.currentIncidentEvidence
  ) {
    return false;
  }

  return true;
}
