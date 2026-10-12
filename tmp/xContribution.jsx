import { useEffect, useState } from "react";
import { Check, X, ArrowRight, RefreshCw } from "lucide-react";
import { fmt } from "../utils/time";

// Set to false while testing if your backend runs a simulated clock (utils/clock)
const ENFORCE_ETA_GATE = false;

const ACTIONS = [
  { status: "arrived", label: "Arrived", Icon: Check, cls: "ok" },
  { status: "not-arrived", label: "Not arrived", Icon: X, cls: "" },
  { status: "departed", label: "Departed", Icon: ArrowRight, cls: "dark" },
];

const etaMinutes = (stop) => {
  const [h, m] = stop.default_time.split(":").map(Number);
  return h * 60 + m + Math.round(stop.delayed_by || 0);
};

function useNow(ms) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export default function ContributePanel({ stop, state, pending, onContribute }) {
  const now = useNow(20000);
  const eta = fmt(stop.default_time, stop.delayed_by);

  if (state === "passed") {
    return (
      <div className="contrib">
        <small>YOUR STOP</small>
        <strong>{stop.stop_name}</strong>
        <p className="muted">The bus has already passed your stop.</p>
      </div>
    );
  }

  const due = !ENFORCE_ETA_GATE || now.getHours() * 60 + now.getMinutes() >= etaMinutes(stop);
  // once the bus has reached your stop, the only useful report is "departed"
  const actions = state === "current" ? ACTIONS.filter((a) => a.status === "departed") : ACTIONS;

  return (
    <div className="contrib">
      <small>YOUR STOP</small>
      <strong>{stop.stop_name}</strong>
      <p className="muted">
        {state === "current" ? "The bus has reached your stop. " : ""}
        {due
          ? "Tell us what you see. We'll check your location once to confirm you're at the stop."
          : `Reporting opens at ${eta}, the bus's expected time.`}
      </p>

      <div className="actions">
        {actions.map(({ status, label, Icon, cls }) => (
          <button
            key={status}
            className={`act ${cls}`}
            disabled={!due || !!pending}
            onClick={() => onContribute(status)}
          >
            {pending === status ? <RefreshCw size={14} className="spin" /> : <Icon size={14} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}