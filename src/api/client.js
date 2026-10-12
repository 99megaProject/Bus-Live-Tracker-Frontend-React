const BASE_URL = import.meta.env.VITE_API_URL || "/api"; // proxied by Vite
// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// full = true returns the whole body (needed for flags that live outside `data`)
export async function request(path, options = {}, full = false) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include", // send/receive auth cookies
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach server. Check your connection.");
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || (body && body.success === false)) {
    const err = new Error(body?.message || `Request failed (${res.status})`);
    err.status = res.status;
    // session expired -> let AuthProvider log the user out
    // if (res.status === 401 && !path.startsWith("/auth/login")) {
    //   window.dispatchEvent(new Event("auth:unauthorized"));
    // }
    if (res.status === 401 && !path.endsWith("/login")) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw err;
  }
  return full ? body : (body?.data ?? body);
}
