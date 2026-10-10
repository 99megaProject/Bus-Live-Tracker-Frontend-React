import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, ArrowRight, RefreshCw, ChevronDown } from "lucide-react";
import { getEtaData, getCurrInfo, sendContribution } from "../api/services";
import { getBusId } from "./Settings";
import { useAuth } from "../auth/AuthContext";
import useContributionSync from "../hooks/useContributionSync";
import { fmt, km, delayLabel } from "../utils/time";
import GlobalLoader from "../components/loaders/GlobalLoader";
import LocalSpinner from "../components/loaders/LocalSpinner";
import StatusCard from "../components/StatusCard";
import EmptyState from "../components/EmptyState";

// ASSUMED status values sent to /contribution
const ACTIONS = [
  { status: "ARRIVED", label: "Arrived", Icon: Check, cls: "ok" },
  { status: "NOT_REACHED", label: "Not arrived", Icon: X, cls: "" },
  { status: "DEPARTED", label: "Departed", Icon: ArrowRight, cls: "dark" },
];

// If any of these change in curr-info, forward ETAs are re-fetched
const LIVE_KEYS = ["stop_order", "phase", "delayed_by", "next_stop_delayed"];

const EMPTY_RE = /not found|no (route|bus|chart|eta|trip)/i;

// Keep static stop fields (name, geom, distances) untouched; update only what changes.
function mergeDynamic(prev, next) {
  if (!prev || prev.route_info?.route_id !== next.route_info?.route_id) return next;
  const fresh = new Map(next.route_info.stops.map((s) => [s.stop_id, s]));
  const stops = prev.route_info.stops.map((s) => {
    const n = fresh.get(s.stop_id);
    if (!n || (n.delayed_by === s.delayed_by && n.today_reached_time === s.today_reached_time)) return s;
    return { ...s, delayed_by: n.delayed_by, today_reached_time: n.today_reached_time };
  });
  return { curr_info: next.curr_info, route_info: { ...prev.route_info, stops } };
}

export default function EtaChart() {
  const { user } = useAuth();
  const busId = getBusId();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState(null);
  const sync = useContributionSync();

  const dataRef = useRef(null);
  dataRef.current = data;

  const load = useCallback(async () => {
    if (!busId) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await getEtaData(busId);
      setData((prev) => mergeDynamic(prev, fresh));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [busId]);

  useEffect(() => {
    setData(null);
    sync.stop();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // Refresh icon: cheap curr-info call; forward ETAs are re-fetched only if something changed
  const refreshLive = async () => {
    const prev = dataRef.current?.curr_info;
    if (!prev) return load();
    setLiveLoading(true);
    setError(null);
    try {
      const live = await getCurrInfo(busId);
      if (LIVE_KEYS.some((k) => live[k] !== prev[k])) {
        const fresh = await getEtaData(busId);
        setData((p) => mergeDynamic(p, fresh));
      } else {
        setData((p) => ({ ...p, curr_info: live }));
      }
    } catch (e) {
      setError(e);
    } finally {
      setLiveLoading(false);
    }
  };

  const applyUpdate = (res) => {
    const d = res?.data ?? res;
    if (d?.curr_info && d?.route_info) setData((p) => mergeDynamic(p, d));
  };

  const contribute = async (stop, status) => {
    setPending(`${stop.stop_id}:${status}`);
    setNotice(null);
    try {
      const payload = { bus_number: busId, stop_id: stop.stop_id, status };
      const res = await sendContribution(payload);
      applyUpdate(res);
      setNotice({ ok: true, text: "Thanks! Your report was recorded." });
      sync.start(payload, applyUpdate); // background contribution-next until termination flag
    } catch (e) {
      setNotice({ ok: false, text: e.message });
    } finally {
      setPending(null);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const stops = data?.route_info?.stops ?? [];
  const firstLoad = loading && !data;
  const noChart =
    !busId ||
    (!data && error && (error.status === 404 || EMPTY_RE.test(error.message))) ||
    (data && stops.length === 0);

  return (
    <div className="page">
      {firstLoad && <GlobalLoader />}
      <h1>ETA Chart</h1>
      {data && stops.length > 0 && <p className="muted">{data.route_info.route_name}</p>}

      {noChart ? (
        <EmptyState
          title={busId ? "No bus on this route" : "No bus selected"}
          text={
            busId
              ? "There's no ETA chart for this bus right now. It may not be running today."
              : "Pick your bus in Settings to see its ETA chart."
          }
          action={busId && <button className="btn" onClick={load}>Try again</button>}
        />
      ) : (
        <>
          {error && (
            <div className="error">
              {error.message}{" "}
              <button className="link" onClick={data ? refreshLive : load}>Retry</button>
            </div>
          )}

          {data && (
            <>
              <StatusCard
                info={data.curr_info}
                action={
                  <button className="icon-btn" onClick={refreshLive} disabled={liveLoading || loading} aria-label="Refresh live info">
                    {liveLoading ? <LocalSpinner /> : <RefreshCw size={18} />}
                  </button>
                }
              />

              {notice && <div className={notice.ok ? "notice" : "error"}>{notice.text}</div>}
              {sync.syncing && (
                <p className="muted sync"><RefreshCw size={12} className="spin" /> Syncing your report in the background…</p>
              )}

              <ul className="timeline">
                {stops.map((stop, i) => {
                  const current = data.curr_info.stop_order;
                  const state = stop.stop_order < current ? "passed" : stop.stop_order === current ? "current" : "upcoming";
                  const stateLabel =
                    state === "current" ? (data.curr_info.phase === "at_stop" ? "At this stop" : "Last stop reached") : state;
                  const open = openId === stop.stop_id;
                  const prev = stops[i - 1];
                  const shown = stop.today_reached_time ? fmt(stop.today_reached_time) : fmt(stop.default_time, stop.delayed_by);

                  return (
                    <li key={stop.stop_id} className={`stop ${state}`}>
                      <div className="dot">{state !== "upcoming" && <Check size={14} />}</div>
                      <div className="card" onClick={() => setOpenId(open ? null : stop.stop_id)}>
                        <div className="card-row">
                          <strong>
                            {stop.stop_name}
                            {user?.stop_id === stop.stop_id && <small className="tag">YOUR STOP</small>}
                          </strong>
                          <span className="eta">{shown}</span>
                          <ChevronDown size={18} className={open ? "rot" : ""} />
                        </div>

                        {open && (
                          <>
                            <dl className="detail">
                              <div><dt>Status</dt><dd>{stateLabel}</dd></div>
                              <div><dt>Delay</dt><dd>{delayLabel(stop.delayed_by)}</dd></div>
                              <div><dt>Scheduled</dt><dd>{fmt(stop.default_time)}</dd></div>
                              <div><dt>Expected</dt><dd>{fmt(stop.default_time, stop.delayed_by)}</dd></div>
                              {stop.today_reached_time && (
                                <div><dt>Reached at</dt><dd>{fmt(stop.today_reached_time)}</dd></div>
                              )}
                              <div><dt>From start</dt><dd>{km(stop.dist_from_start_m)}</dd></div>
                              <div>
                                <dt>From previous</dt>
                                <dd>{prev ? km(stop.dist_from_start_m - prev.dist_from_start_m) : "—"}</dd>
                              </div>
                              {stop.in_btw_dist != null && (
                                <div><dt>To next stop</dt><dd>{km(stop.in_btw_dist)} · {stop.in_btw_time} min</dd></div>
                              )}
                            </dl>

                            {state !== "passed" && (
                              <div className="actions" onClick={(e) => e.stopPropagation()}>
                                {ACTIONS.map(({ status, label, Icon, cls }) => (
                                  <button
                                    key={status}
                                    className={`act ${cls}`}
                                    disabled={!!pending}
                                    onClick={() => contribute(stop, status)}
                                  >
                                    {pending === `${stop.stop_id}:${status}` ? <RefreshCw size={14} className="spin" /> : <Icon size={14} />}
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}