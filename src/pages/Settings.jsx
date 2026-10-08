import { useState } from "react";

const KEY = "busId";
export const getBusId = () => localStorage.getItem(KEY) || "HP12G5301";

export default function Settings() {
  const [busId, setBusId] = useState(getBusId());
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(KEY, busId.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="page">
      <h1>Settings</h1>
      <label className="field">
        <span>Bus ID</span>
        <input value={busId} onChange={(e) => setBusId(e.target.value)} />
      </label>
      <button className="btn" onClick={save}>{saved ? "Saved ✓" : "Save"}</button>
    </div>
  );
}