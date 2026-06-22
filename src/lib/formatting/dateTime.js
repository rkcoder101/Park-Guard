export function getDatePart(targetTime) {
  return targetTime.slice(0, 10);
}

export function getHourLabel(targetTime) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(new Date(targetTime));
}

export function formatTargetTime(targetTime) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(new Date(targetTime));
}

export function formatPercent(value, digits = 1) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

export function formatScore(value, digits = 2) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(digits);
}
