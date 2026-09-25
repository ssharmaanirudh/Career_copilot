function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

export type PillTone = "teal" | "crimson" | "neutral";
export type PillIcon = "check" | "x" | "bolt";

const PILL_STYLES: Record<PillTone, string> = {
  teal: "border-gl-teal/30 bg-gl-teal-bg text-gl-teal",
  crimson: "border-gl-crimson/30 bg-gl-crimson-bg text-gl-crimson",
  neutral: "border-gl-ink/15 bg-gl-paper-card text-gl-ink-muted",
};

const PILL_ICONS: Record<PillIcon, React.ReactNode> = {
  check: <CheckIcon />,
  x: <XIcon />,
  bolt: <BoltIcon />,
};

/** Small status pill (verified/gap/quick-fix) — shared by Hero and AuthSidePanel so both use the exact same mark instead of two hand-copied variants. */
export function StatusPill({ tone, icon, label }: { tone: PillTone; icon: PillIcon; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${PILL_STYLES[tone]}`}
    >
      {PILL_ICONS[icon]}
      {label}
    </span>
  );
}
