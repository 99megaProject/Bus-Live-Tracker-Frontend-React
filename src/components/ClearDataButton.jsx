import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { logout as apiLogout } from "../api/services";
import { clearSiteData } from "../utils/clearSiteData";

export default function ClearDataButton() {
  const { user } = useAuth();
  const [step, setStep] = useState("idle"); // idle | confirm | working

  const run = async () => {
    setStep("working");
    try {
      if (user?.role) await apiLogout(user.role); // server clears the httpOnly auth cookie + session
    } catch { /* offline or already logged out: continue */ }
    await clearSiteData();
    window.location.replace("/login"); // hard reload = fresh app state
  };

  return (
    <div className="section">
      <h2 className="h2">Clear all app data</h2>
      <p className="muted">
        Signs you out and removes everything saved on this device: login, selected bus, offline cache and app data.
      </p>

      {step === "idle" && (
        <button className="btn danger with-icon" onClick={() => setStep("confirm")}>
          <Trash2 size={16} /> Clear all data
        </button>
      )}

      {step === "confirm" && (
        <div className="confirm-row">
          <button className="btn danger with-icon" onClick={run}>Yes, clear everything</button>
          <button className="btn with-icon" onClick={() => setStep("idle")}>Cancel</button>
        </div>
      )}

      {step === "working" && (
        <button className="btn danger with-icon" disabled>
          <Loader2 size={16} className="spin" /> Clearing…
        </button>
      )}
    </div>
  );
}