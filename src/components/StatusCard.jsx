import { Bus } from "lucide-react";
import { fmt, delayLabel } from "../utils/time";

export default function StatusCard({ info, action }) {
  if (!info) return null;
  const badge = [
    (info.phase || "").replace(/_/g, " "),
    info.verified ? `verified${info.verified_by ? ` by ${info.verified_by}` : ""}` : "",
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  return (
    <div className="status-card">
      <div className="status-icon"><Bus size={22} /></div>
      <div className="status-text">
        <small>{badge}</small>
        <strong>{info.status}</strong>
        {info.next_stop_name && (
          <span>
            Next: {info.next_stop_name} · {fmt(info.next_stop_eta)} ({delayLabel(info.next_stop_delayed)})
          </span>
        )}
        {info.last_updated_time && <span>Updated {fmt(info.last_updated_time)}</span>}
      </div>
      {action}
    </div>
  );
}