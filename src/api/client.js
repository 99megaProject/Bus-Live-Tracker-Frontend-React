const BASE_URL = import.meta.env.VITE_API_URL || "http://10.133.200.19:5000/api";
// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
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
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return body?.data ?? body;
}