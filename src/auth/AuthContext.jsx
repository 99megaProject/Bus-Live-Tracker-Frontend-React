// import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import * as api from "../api/services";

// const KEY = "auth_user";
// const AuthCtx = createContext(null);

// const read = () => {
//   try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
// };

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(read);

//   const clear = useCallback(() => {
//     localStorage.removeItem(KEY);
//     setUser(null);
//   }, []);

//   // client.js fires this on any 401
//   useEffect(() => {
//     window.addEventListener("auth:unauthorized", clear);
//     return () => window.removeEventListener("auth:unauthorized", clear);
//   }, [clear]);

//   const login = useCallback(async ({ type, id, password }) => {
//     const data = await api.login({ type, id, password });
//     const profile = Object.values(data)[0]; // { teacher: {...} } / { student: {...} } / { driver: {...} }
//     const u = { ...profile, role: type };
//     localStorage.setItem(KEY, JSON.stringify(u));
//     setUser(u);
//     return u;
//   }, []);

//   const logout = useCallback(async () => {
//     try { await api.logout(); } catch { /* clear locally anyway */ }
//     clear();
//   }, [clear]);

//   const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }

// export const useAuth = () => useContext(AuthCtx);


import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api/services";

const KEY = "auth_user";
const AuthCtx = createContext(null);

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read);
  const [checking, setChecking] = useState(() => !!read());

  const save = useCallback((u) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", clear);
    return () => window.removeEventListener("auth:unauthorized", clear);
  }, [clear]);

  // Validate the stored session against the cookie once on startup
  useEffect(() => {
    const stored = read();
    if (!stored) return;
    api
      .getMe(stored.role)
      .then((profile) => save({ ...stored, ...profile, role: stored.role }))
      .catch(() => {}) // 401 is handled by the unauthorized event; network errors keep the session
      .finally(() => setChecking(false));
  }, [save]);

 const login = useCallback(
  async ({ type, id, password }) => {
    const data = await api.login({ type, id, password });
    const first = Object.values(data ?? {})[0]; // { student: {...} } / { teacher: {...} } / { admin: {...} }
    const profile = first && typeof first === "object" ? first : data ?? {};
    const u = { ...profile, role: type };
    save(u);
    return u;
  },
  [save]
);

  const logout = useCallback(async () => {
    const role = read()?.role;
    try { if (role) await api.logout(role); } catch { /* clear locally anyway */ }
    clear();
  }, [clear]);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);