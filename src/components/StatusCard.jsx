import { Bus } from "lucide-react";

export default function StatusCard({ info, action }) {
  return (
    <div className="status-card">
      <div className="status-icon"><Bus size={26} /></div>
      <div className="status-text">
        <small>CURRENT STATUS</small>
        <strong>{info.status}</strong>
        <span>Updated {info.last_updated_time.slice(11, 16)}</span>
      </div>
      {action}
    </div>
  );
}