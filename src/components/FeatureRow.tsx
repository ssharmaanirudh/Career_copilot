function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path strokeLinecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

const FEATURES = [
  { icon: <ShieldIcon />, label: "Evidence-based analysis", tone: "teal" },
  { icon: <TargetIcon />, label: "Role-specific matching", tone: "teal" },
  { icon: <LockIcon />, label: "Private & secure", tone: "ink" },
  { icon: <BoltIcon />, label: "Instant results", tone: "amber" },
] as const;

const ICON_TONE_STYLES: Record<(typeof FEATURES)[number]["tone"], string> = {
  teal: "bg-gl-teal-bg text-gl-teal",
  ink: "bg-gl-ink text-white",
  amber: "bg-gl-amber/25 text-gl-amber",
};

export function FeatureRow() {
  return (
    <div className="flex flex-col divide-y divide-gl-ink/10 rounded-2xl border border-gl-ink/10 bg-gl-paper-card sm:flex-row sm:divide-x sm:divide-y-0">
      {FEATURES.map((f) => (
        <div key={f.label} className="flex flex-1 items-center gap-2.5 px-5 py-4">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ICON_TONE_STYLES[f.tone]}`}>
            {f.icon}
          </span>
          <span className="text-sm font-medium text-gl-ink">{f.label}</span>
        </div>
      ))}
    </div>
  );
}
