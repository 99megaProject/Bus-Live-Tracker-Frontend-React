import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getMe, getEtaData } from "../api/services";
import { fmt } from "../utils/time";

const ROLE_LABEL = { stu: "Student", tea: "Teacher", driv: "Driver" };
const ID_LABEL = { stu: "Roll no", tea: "ID", driv: "ID" };

const initials = (n = "") =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const humanize = (k) => k.replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [route, setRoute] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // refresh details from the server
  useEffect(() => {
    let live = true;
    getMe(user.role)
      .then((p) => live && setProfile((cur) => ({ ...cur, ...p })))
      .catch(() => {});
    return () => { live = false; };
  }, [user.role]);

  // turn bus / stop ids into readable names (best effort)
  useEffect(() => {
    if (!profile?.bus_id) return;
    let live = true;
    getEtaData(profile.bus_id)
      .then((d) => live && setRoute(d.route_info))
      .catch(() => {});
    return () => { live = false; };
  }, [profile?.bus_id]);

  const stop = route?.stops?.find((s) => Number(s.stop_id) === Number(profile.stop_id));
  const metaRows = Object.entries(profile.meta || {})
    .filter(([, v]) => ["string", "number"].includes(typeof v) && v !== "")
    .map(([k, v]) => [humanize(k), String(v)]);

  const rows = [
    [ID_LABEL[profile.role], profile.uni_id],
    ["Email", profile.email],
    ["Phone", profile.phone],
    ["Bus", profile.bus_id],
    ["Route", route?.route_name ?? (profile.route_id ? `Route #${profile.route_id}` : null)],
    ["Your stop", stop?.stop_name ?? (profile.stop_id ? `Stop #${profile.stop_id}` : null)],
    ["Scheduled pickup", stop ? fmt(stop.default_time) : null],
    ...metaRows,
  ].filter(([, v]) => v != null && v !== "");

  const signOut = async () => {
    setLeaving(true);
    await logout(); // RequireAuth redirects to /login once the user is cleared
  };

  return (
    <div className="page profile">
      <h1>Profile</h1>
      <p className="muted">Your account details</p>

      <div className="status-card">
        <div className="avatar">{initials(profile.name)}</div>
        <div className="status-text">
          <small>{ROLE_LABEL[profile.role]}</small>
          <strong>{profile.name}</strong>
        </div>
      </div>

      <dl className="detail profile-detail">
        {rows.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>

      <button className="btn with-icon" onClick={signOut} disabled={leaving}>
        <LogOut size={16} /> {leaving ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}