import { useEffect, useState } from "react";
import { Check, RefreshCw, ChevronDown } from "lucide-react";
import useApi from "../hooks/useApi";
import { getEtaData } from "../api/services";
import { getBusId } from "./Settings";
import GlobalLoader from "../components/loaders/GlobalLoader";
import LocalSpinner from "../components/loaders/LocalSpinner";
import StatusCard from "../components/StatusCard";

// Assumes delayed_by is in MINUTES. Change to `/ 60` if your backend sends seconds.
const DELAY_UNIT_IN_MIN = 1;

function fmt(time, delayedBy = 0) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + Math.round(delayedBy * DELAY_UNIT_IN_MIN);
  const hh = Math.floor(total / 60) % 24;
  const mm = String(total % 60).padStart(2, "0");
  return `${String(hh % 12 || 12).padStart(2, "0")}:${mm} ${hh >= 12 ? "PM" : "AM"}`;
}

const km = (m) => `${(m / 1000).toFixed(1)} km`;

export default function EtaChart() {
  const { data, loading, error, run } = useApi(getEtaData);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    run(getBusId());
  }, [run]);

  const refresh = () => run(getBusId());
  const firstLoad = loading && !data;

  return (
    <div className="page">
      {firstLoad && <GlobalLoader />}
      <h1>ETA Chart</h1>
      {data && <p className="muted">{data.route_info.route_name}</p>}

      {error && (
        <div className="error">
          {error} <button className="link" onClick={refresh}>Retry</button>
        </div>
      )}

      {data && (
        <>
          <StatusCard
            info={data.curr_info}
            action={
              <button className="icon-btn" onClick={refresh} disabled={loading} aria-label="Refresh">
                {loading ? <LocalSpinner /> : <RefreshCw size={18} />}
              </button>
            }
          />

          <ul className="timeline">
            {data.route_info.stops.map((stop, i, all) => {
              const current = data.curr_info.stop_order;
              const state = stop.stop_order < current ? "passed" : stop.stop_order === current ? "current" : "upcoming";
              const open = openId === stop.stop_id;
              const prev = all[i - 1];

              return (
                <li key={stop.stop_id} className={`stop ${state}`}>
                  <div className="dot">{state !== "upcoming" && <Check size={14} />}</div>
                  <div className="card" onClick={() => setOpenId(open ? null : stop.stop_id)}>
                    <div className="card-row">
                      <strong>{stop.stop_name}</strong>
                      <span className="eta">{fmt(stop.default_time, stop.delayed_by)}</span>
                      <ChevronDown size={18} className={open ? "rot" : ""} />
                    </div>

                    {open && (
                      <dl className="detail">
                        <div><dt>Stop</dt><dd>#{String(stop.stop_order).padStart(2, "0")}</dd></div>
                        <div><dt>Status</dt><dd>{state}</dd></div>
                        <div><dt>Scheduled</dt><dd>{fmt(stop.default_time)}</dd></div>
                        <div><dt>Delay</dt><dd>{stop.delayed_by} min</dd></div>
                        <div><dt>From start</dt><dd>{km(stop.dist_from_start_m)}</dd></div>
                        <div><dt>From previous</dt><dd>{prev ? km(stop.dist_from_start_m - prev.dist_from_start_m) : "—"}</dd></div>
                      </dl>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}