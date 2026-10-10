import { useRef, useState } from "react";
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getEtaData, registerUser } from "../api/services";

const ROLES = [
  { type: "student", label: "Student", idLabel: "University roll no", idPh: "e.g. MAUT26PBC001", loginBy: "uni_id" },
  { type: "teacher", label: "Teacher", idLabel: "University / employee ID", idPh: "", loginBy: "phone" },
  { type: "driver", label: "Driver", idLabel: "Employee ID", idPh: "", loginBy: "phone" },
];

const BLANK = { name: "", email: "", uni_id: "", phone: "", password: "" };

const CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
const randomPassword = () =>
  Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => CHARS[n % CHARS.length]).join("");

function Field({ label, className = "", children }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [role, setRole] = useState("student");
  const [person, setPerson] = useState(BLANK);
  const [bus, setBus] = useState("");
  const [lookup, setLookup] = useState({ status: "idle", route: null });
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [metaText, setMetaText] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [added, setAdded] = useState([]);
  const looked = useRef(null);

  const cfg = ROLES.find((r) => r.type === role);
  const stopRequired = role !== "driver";
  const set = (k) => (e) => setPerson((p) => ({ ...p, [k]: e.target.value }));

  const onBusChange = (e) => {
    setBus(e.target.value);
    looked.current = null;
    setLookup({ status: "idle", route: null });
    setRouteId("");
    setStopId("");
  };

  // Try to load the bus's route so stops can be picked by name; otherwise fall back to manual ids
  const lookupBus = async () => {
    const b = bus.trim();
    if (!b || looked.current === b) return;
    looked.current = b;
    setLookup({ status: "loading", route: null });
    try {
      const d = await getEtaData(b);
      const r = d?.route_info;
      if (!r?.stops?.length) throw new Error("no route");
      setRouteId(String(r.route_id));
      setLookup({ status: "ok", route: r });
    } catch {
      setLookup({ status: "manual", route: null });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice(null);

    let meta = {};
    if (metaText.trim()) {
      try {
        meta = JSON.parse(metaText);
      } catch {
        return setError("Meta must be valid JSON");
      }
      if (!meta || typeof meta !== "object" || Array.isArray(meta)) return setError("Meta must be a JSON object");
    }
    if (!bus.trim()) return setError("Bus number is required");
    if (!routeId) return setError("Route is required");
    if (stopRequired && !stopId) return setError("Pick a stop");
    if (person.password.length < 6) return setError("Password must be at least 6 characters");

    const payload = {
      name: person.name.trim(),
      email: person.email.trim(),
      uni_id: person.uni_id.trim(),
      phone: person.phone.trim(),
      password: person.password,
      bus_id: bus.trim(),
      route_id: Number(routeId),
      meta,
      ...(stopId ? { stop_id: Number(stopId) } : {}),
    };

    setLoading(true);
    try {
      const created = await registerUser(role, payload);
      const loginId = cfg.loginBy === "uni_id" ? payload.uni_id : payload.phone;
      setNotice({ name: payload.name, label: cfg.label, loginId, password: payload.password });
      setAdded((a) => [{ id: created?.id ?? payload.uni_id, name: payload.name, role }, ...a].slice(0, 5));
      setPerson(BLANK);
      setMetaText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { status, route } = lookup;

  return (
    <div className="page">
      <div className="admin-head">
        <div>
          <h1>Admin panel</h1>
          <p className="muted">Register a student, teacher or driver{user?.name ? ` · ${user.name}` : ""}</p>
        </div>
        <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut size={18} />
        </button>
      </div>

      <form className="auth-card form-card" onSubmit={submit}>
        <div className="seg" role="tablist">
          {ROLES.map((r) => (
            <button
              key={r.type}
              type="button"
              role="tab"
              aria-selected={role === r.type}
              className={role === r.type ? "on" : ""}
              onClick={() => { setRole(r.type); setError(""); }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}
        {notice && (
          <div className="notice">
            {notice.label} <strong>{notice.name}</strong> registered. Login ID: <strong>{notice.loginId}</strong> · Password:{" "}
            <strong>{notice.password}</strong>
          </div>
        )}

        <div className="form-grid">
          <Field label="Full name">
            <input value={person.name} onChange={set("name")} required />
          </Field>
          <Field label={cfg.idLabel}>
            <input value={person.uni_id} onChange={set("uni_id")} placeholder={cfg.idPh} required />
          </Field>
          <Field label="Email">
            <input type="email" value={person.email} onChange={set("email")} required />
          </Field>
          <Field label="Phone number">
            <input type="tel" inputMode="tel" value={person.phone} onChange={set("phone")} required />
          </Field>

          <Field label="Password" className="span2">
            <div className="pw">
              <input
                type={show ? "text" : "password"}
                value={person.password}
                onChange={set("password")}
                autoComplete="new-password"
                required
              />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="button"
              className="link gen"
              onClick={() => { setPerson((p) => ({ ...p, password: randomPassword() })); setShow(true); }}
            >
              Generate a password
            </button>
          </Field>

          <Field label="Bus number">
            <input value={bus} onChange={onBusChange} onBlur={lookupBus} placeholder="e.g. HR-26-1234" required />
          </Field>

          {status === "loading" && (
            <p className="muted hint"><Loader2 size={14} className="spin" /> Loading route…</p>
          )}

          {status === "ok" && (
            <>
              <Field label="Route">
                <input value={`${route.route_name} (#${route.route_id})`} readOnly />
              </Field>
              <Field label={stopRequired ? "Stop" : "Stop (optional)"} className="span2">
                <select value={stopId} onChange={(e) => setStopId(e.target.value)} required={stopRequired}>
                  <option value="">Select a stop…</option>
                  {route.stops.map((s) => (
                    <option key={s.stop_id} value={s.stop_id}>
                      {String(s.stop_order).padStart(2, "0")} · {s.stop_name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {status === "manual" && (
            <>
              <Field label="Route ID">
                <input type="number" min="1" value={routeId} onChange={(e) => setRouteId(e.target.value)} required />
              </Field>
              <Field label={stopRequired ? "Stop ID" : "Stop ID (optional)"}>
                <input type="number" min="1" value={stopId} onChange={(e) => setStopId(e.target.value)} required={stopRequired} />
              </Field>
              <p className="muted hint span2">Couldn't load this bus's route, so enter the IDs manually.</p>
            </>
          )}

          {status === "idle" && (
            <p className="muted hint">Enter the bus number, then tab out to load its route and stops.</p>
          )}

          <Field label="Meta (JSON, optional)" className="span2">
            <textarea
              rows={3}
              value={metaText}
              onChange={(e) => setMetaText(e.target.value)}
              placeholder='{"class": "10-B"}'
              spellCheck={false}
            />
          </Field>
        </div>

        <button className="btn block" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : `Register ${cfg.label.toLowerCase()}`}
        </button>
      </form>

      {added.length > 0 && (
        <ul className="recent">
          {added.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong>
              <small>{a.role}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}