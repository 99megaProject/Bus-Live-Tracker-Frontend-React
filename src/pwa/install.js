let deferred = null;
let installedNow = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  emit();
});

window.addEventListener("appinstalled", () => {
  deferred = null;
  installedNow = true;
  emit();
});

export const getInstallEvent = () => deferred;
export const justInstalled = () => installedNow;
export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// resolves to "accepted" | "dismissed" | "unavailable"
export async function promptInstall() {
  if (!deferred) return "unavailable";
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null; // the browser allows each prompt event to be used once
  emit();
  return outcome;
}