import { useState, useCallback } from "react";

export default function useApi(apiFn) {
  const [state, setState] = useState({ data: null, error: null, loading: false });

  const run = useCallback(
    async (...args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await apiFn(...args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (e) {
        setState((s) => ({ ...s, error: e.message, loading: false }));
      }
    },
    [apiFn]
  );

  return { ...state, run };
}