const timePart = (t) => (t.includes("T") ? t.split("T")[1] : t);

// "08:19:00" (+ delay in minutes) -> "08:23 AM". Also accepts ISO strings.
export function fmt(time, delayedBy = 0) {
  if (!time) return "—";
  const [h, m] = timePart(time).split(":").map(Number);
  const total = h * 60 + m + Math.round(delayedBy || 0);
  const mins = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(mins / 60);
  const mm = String(mins % 60).padStart(2, "0");
  return `${String(hh % 12 || 12).padStart(2, "0")}:${mm} ${hh >= 12 ? "PM" : "AM"}`;
}

export const km = (m) => `${(m / 1000).toFixed(1)} km`;

export const delayLabel = (d = 0) =>
  d > 0 ? `${d} min late` : d < 0 ? `${-d} min early` : "On time";