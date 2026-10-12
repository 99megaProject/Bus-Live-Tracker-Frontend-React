import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getInstallEvent, isStandalone, justInstalled, promptInstall, subscribe } from "../pwa/install";

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Used when the browser hasn't offered the install prompt: say what's actually wrong
async function explainWhy() {
  if (isIos()) {
    return "On iPhone/iPad: tap the Share button in Safari, then “Add to Home Screen”. iOS has no install pop-up.";
  }
  if (!window.isSecureContext) {
    return `Installing needs HTTPS (or localhost). You're on ${location.origin}.`;
  }
  if (!document.querySelector('link[rel="manifest"]')) {
    return "No app manifest found. This is a dev build. Run “npm run build && npm run preview” (or open the deployed site) and try again.";
  }
  const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
  if (!reg?.active) {
    return "The offline engine isn't active yet. Reload the page once, wait a few seconds, then try again.";
  }
  return "Your browser hasn't offered the install prompt yet. Try the browser menu → “Install app” / “Add to Home screen”. If you dismissed the prompt earlier, Chrome waits a while before offering it again. Some browsers (for example Firefox on desktop) can't install web apps.";
}

export default function InstallApp() {
  const [canPrompt, setCanPrompt] = useState(() => !!getInstallEvent());
  const [installed, setInstalled] = useState(() => isStandalone() || justInstalled());
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      subscribe(() => {
        setCanPrompt(!!getInstallEvent());
        setInstalled(isStandalone() || justInstalled());
      }),
    []
  );

  const onClick = async () => {
    setMsg("");
    setBusy(true);
    try {
      if (getInstallEvent()) {
        const outcome = await promptInstall();
        if (outcome === "dismissed") setMsg("Install cancelled. You can try again any time.");
      } else {
        setMsg(await explainWhy());
      }
    } finally {
      setBusy(false);
    }
  };

  if (installed) {
    return (
      <div className="section">
        <h2 className="h2">Install app</h2>
        <p className="muted">App installed ✓</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="h2">Install app</h2>
      <p className="muted">
        {canPrompt ? "Add Bus Tracker to your home screen for quick access." : "Install it like a normal app."}
      </p>
      <button className="btn with-icon" onClick={onClick} disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Install app
      </button>
      {msg && <p className="muted" style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}