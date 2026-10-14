export const formatPercentage = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
export const formatHours = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(2)} h`;
export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
};
export const formatKm = (v) =>
  v === null || v === undefined ? "—" : `${Number(v).toFixed(1)} km`;
