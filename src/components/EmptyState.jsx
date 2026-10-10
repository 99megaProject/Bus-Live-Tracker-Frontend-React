export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 260 170" width="260" height="170" role="img" aria-label="No bus or route available">
        {/* road */}
        <line x1="10" y1="136" x2="250" y2="136" stroke="#d1d5db" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
        {/* broken route */}
        <path d="M24 150 H70" stroke="#d1d5db" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        {/* bus shadow + body */}
        <rect x="64" y="70" width="120" height="58" rx="14" fill="#111827" />
        <rect x="58" y="64" width="120" height="58" rx="14" fill="#ff6b4a" stroke="#111827" strokeWidth="3" />
        {/* windows */}
        <rect x="68" y="76" width="26" height="22" rx="5" fill="#fff" stroke="#111827" strokeWidth="2.5" />
        <rect x="100" y="76" width="26" height="22" rx="5" fill="#fff" stroke="#111827" strokeWidth="2.5" />
        <rect x="132" y="76" width="36" height="22" rx="5" fill="#fff" stroke="#111827" strokeWidth="2.5" />
        {/* sleepy eyes on the windows */}
        <path d="M74 88 q7 5 14 0" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
        <path d="M106 88 q7 5 14 0" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="108" x2="178" y2="108" stroke="#111827" strokeWidth="2.5" />
        {/* wheels */}
        <circle cx="88" cy="124" r="11" fill="#111827" />
        <circle cx="88" cy="124" r="4" fill="#fff" />
        <circle cx="148" cy="124" r="11" fill="#111827" />
        <circle cx="148" cy="124" r="4" fill="#fff" />
        {/* zzz */}
        <g fontFamily="Space Mono, monospace" fontWeight="700" fill="#6b7280">
          <text x="186" y="52" fontSize="20">Z</text>
          <text x="204" y="36" fontSize="15">z</text>
          <text x="217" y="24" fontSize="11">z</text>
        </g>
        {/* missing stop pin */}
        <circle cx="222" cy="112" r="16" fill="#fff" stroke="#111827" strokeWidth="3" strokeDasharray="5 4" />
        <text x="222" y="119" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="20" fill="#111827">?</text>
      </svg>
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {action}
    </div>
  );
}