import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const ROLES = [
  { type: "stu", label: "Student", field: "University roll no", placeholder: "e.g. MAUT26PBC001", mode: "text" },
  { type: "tea", label: "Teacher", field: "Phone number", placeholder: "10-digit phone", mode: "tel" },
  { type: "driv", label: "Driver", field: "Phone number", placeholder: "10-digit phone", mode: "tel" },
  { type: "admin", label: "Admin", field: "Phone number", placeholder: "10-digit phone", mode: "tel" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState("stu");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const role = ROLES.find((r) => r.type === type);
  const to = location.state?.from?.pathname || "/";

  if (user) return <Navigate to={to} replace />;

  const pick = (t) => {
    setType(t);
    setId("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ type, id: id.trim(), password });
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to track your bus</p>

        <div className="seg" role="tablist">
          {ROLES.map((r) => (
            <button
              key={r.type}
              type="button"
              role="tab"
              aria-selected={type === r.type}
              className={type === r.type ? "on" : ""}
              onClick={() => pick(r.type)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        <label className="field">
          <span>{role.field}</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={role.placeholder}
            inputMode={role.mode}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="pw">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button className="btn block" disabled={loading || !id || !password}>
          {loading ? <Loader2 size={18} className="spin" /> : "Sign in"}
        </button>
      </form>
    </div>
  );
}