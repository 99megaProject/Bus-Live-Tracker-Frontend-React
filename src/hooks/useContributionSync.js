import { useCallback, useEffect, useRef, useState } from "react";
import { contributionNext } from "../api/services";
import { getPosition } from "../utils/geo";

const INTERVAL_MS = 15000;
const MAX_ERRORS = 4;
const MAX_RUN_MS = 30 * 60 * 1000;

const isTerminated = (res) => res?.data?.terminate === true || res?.terminate === true;

export default function useContributionSync() {
  const [syncing, setSyncing] = useState(false);
  const token = useRef(0);
  const timer = useRef(null);

  const stop = useCallback(() => {
    token.current += 1;
    clearTimeout(timer.current);
    setSyncing(false);
  }, []);

  // base = { bus_number, stop_id }; location is read fresh on every tick
  const start = useCallback(
    (base, onTick) => {
      stop(); // a new report replaces the previous loop
      const mine = token.current;
      const began = Date.now();
      let errors = 0;
      setSyncing(true);

      const tick = async () => {
        try {
          const pos = await getPosition();
          if (mine !== token.current) return;
          const res = await contributionNext({ ...base, lat: pos.lat, lon: pos.lon });
          if (mine !== token.current) return;
          errors = 0;
          onTick?.(res);
          if (isTerminated(res)) return stop();
        } catch (e) {
          if (mine !== token.current) return;
          // 401 = session gone, code 1 = location permission denied -> no point retrying
          if (e.status === 401 || e.code === 1 || ++errors >= MAX_ERRORS) return stop();
        }
        if (Date.now() - began > MAX_RUN_MS) return stop();
        timer.current = setTimeout(tick, INTERVAL_MS);
      };

      timer.current = setTimeout(tick, INTERVAL_MS);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { syncing, start, stop };
}