export function getDataBaseUrl() {
  return (import.meta.env.VITE_DATA_BASE_URL || "/data").replace(/\/$/, "");
}
