import { useCallback, useEffect, useRef, useState } from "react";
import { contributionNext } from "../api/services";

const INTERVAL_MS = 15000;
const MAX_ERRORS = 4;
const MAX_RUN_MS = 30 * 60 * 1000;
// Edit to match the flag your backend sends (checked on body and body.data)
const TERMINATION_KEYS = ["terminate", "terminated", "done", "completed", "finished", "stop"];

const isTerminated = (res) =>
  [res, res?.data].some((o) => o && TERMINATION_KEYS.some((k) => o[k] === true));

export default function useContributionSync() {
  const [syncing, setSyncing] = useState(false);
  const token = useRef(0);
  const timer = useRef(null);

  const stop = useCallback(() => {
    token.current += 1;
    clearTimeout(timer.current);
    setSyncing(false);
  }, []);

  const start = useCallback(
    (payload, onUpdate) => {
      stop(); // a new contribution replaces the previous loop
      const mine = token.current;
      const began = Date.now();
      let errors = 0;
      setSyncing(true);

      const tick = async () => {
        try {
          const res = await contributionNext(payload);
          if (mine !== token.current) return;
          errors = 0;
          onUpdate?.(res);
          if (isTerminated(res)) return stop();
        } catch (e) {
          if (mine !== token.current) return;
          if (e.status === 401 || ++errors >= MAX_ERRORS) return stop();
        }
        if (Date.now() - began > MAX_RUN_MS) return stop();
        timer.current = setTimeout(tick, INTERVAL_MS);
      };

      timer.current = setTimeout(tick, INTERVAL_MS);
    },
    [stop]
  );

  useEffect(() => stop, [stop]); // cleanup on unmount

  return { syncing, start, stop };
}