import { useEffect, useState } from "react";
import { Check, X, ArrowRight, RefreshCw } from "lucide-react";
import { fmt } from "../utils/time";

// true  = enforce the reporting window (use this normally)
// false = always open, for testing when your backend runs a simulated clock (utils/clock)
const ENFORCE_ETA_GATE = true;
const CLOSE_AFTER_MIN = 30; // window closes this long after the stop's expected time
// 🧪 TESTING OVERRIDE: Set to "08:22" to test, or null/false for normal production use
// const DEBUG_TIME = "08:22";

const ACTIONS = [
  { status: "arrived", label: "Arrived", Icon: Check, cls: "ok" },
  { status: "not-arrived", label: "Not arrived", Icon: X, cls: "" },
  { status: "departed", label: "Departed", Icon: ArrowRight, cls: "dark" },
];

// expected time at the stop = scheduled time + current delay, in minutes since midnight
const expectedMinutes = (stop) => {
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

export default function ContributePanel({ stop, stops, info, pending, onContribute }) {
  const now = useNow(20000);
  let nowMin = now.getHours() * 60 + now.getMinutes();

  // only for tesing purpose 
  // if (DEBUG_TIME) {
  //   const [h, m] = DEBUG_TIME.split(":").map(Number);
  //   nowMin = h * 60 + m;
  // }


  const expected = expectedMinutes(stop);
  const eta = fmt(stop.default_time, stop.delayed_by);

  // a stop AFTER yours has been verified -> the bus has moved on
  const forwardVerified =
    stops.some((s) => s.stop_order > stop.stop_order && s.today_reached_time) ||
    (info?.verified && info.stop_order > stop.stop_order);
  const expired = nowMin > expected + CLOSE_AFTER_MIN;

  let phase = "open";
  if (ENFORCE_ETA_GATE) {
    if (forwardVerified) phase = "moved";
    else if (nowMin < expected) phase = "early";
    else if (expired) phase = "expired";
  }

  const message = {
    early: `Reporting opens at ${eta}, the bus's expected time.`,
    open: "Tell us what you see. We'll check your location once to confirm you're at the stop.",
    moved: "The bus has moved on from your stop, so reporting is closed.",
    expired: `Reporting closed: it's been more than ${CLOSE_AFTER_MIN} minutes since the expected time (${eta}).`,
  }[phase];

  const closed = phase === "moved" || phase === "expired";

  return (
    <div className="contrib">
      <small>YOUR STOP</small>
      <strong>{stop.stop_name}</strong>
      <p className="muted">{message}</p>

      {!closed && (
        <div className="actions">
          {ACTIONS.map(({ status, label, Icon, cls }) => (
            <button
              key={status}
              className={`act ${cls}`}
              disabled={phase === "early" || !!pending}
              onClick={() => onContribute(status)}
            >
              {pending === status ? <RefreshCw size={14} className="spin" /> : <Icon size={14} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}