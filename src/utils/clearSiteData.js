function clearReadableCookies() {
  const parts = location.hostname.split(".");
  // host-only + every parent-domain variant
  const domains = [undefined, ...parts.slice(0, -1).map((_, i) => "." + parts.slice(i).join("."))];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

async function clearIndexedDb() {
  if (!indexedDB.databases) return;
  const dbs = await indexedDB.databases();
  await Promise.all(
    dbs
      .filter((d) => d.name)
      .map(
        (d) =>
          new Promise((resolve) => {
            const req = indexedDB.deleteDatabase(d.name);
            req.onsuccess = req.onerror = req.onblocked = () => resolve();
          })
      )
  );
}

export async function clearSiteData() {
  const tasks = [clearIndexedDb()];

  if ("serviceWorker" in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister())))
    );
  }
  if ("caches" in window) {
    tasks.push(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }

  await Promise.allSettled(tasks);
  try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
  clearReadableCookies();
}