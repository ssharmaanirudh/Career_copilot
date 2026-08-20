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
  {
    icon: <ShieldIcon />,
    label: "Evidence-based analysis",
    body: "Every requirement is checked against a real line in your resume, not just whether the words appear somewhere.",
    tone: "teal",
  },
  {
    icon: <TargetIcon />,
    label: "Role-specific matching",
    body: "Scored against the job you're actually applying for, not a generic template of what a good resume looks like.",
    tone: "teal",
  },
  {
    icon: <LockIcon />,
    label: "Private & secure",
    body: "Your resume and job description are processed once for this check and never stored.",
    tone: "ink",
  },
  {
    icon: <BoltIcon />,
    label: "Instant results",
    body: "See your score, exactly what's missing, and a tailored resume in under a minute.",
    tone: "amber",
  },
] as const;

const ICON_TONE_STYLES: Record<(typeof FEATURES)[number]["tone"], string> = {
  teal: "bg-gl-teal-bg text-gl-teal",
  ink: "bg-gl-ink text-white",
  amber: "bg-gl-amber/25 text-gl-amber",
};

export function FeatureRow() {
  return (
    <section>
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gl-ink/15" aria-hidden="true" />
        <h2 className="font-serif text-xl font-semibold text-gl-ink">Why GapLens</h2>
        <span className="h-px w-8 bg-gl-ink/15" aria-hidden="true" />
      </div>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-gl-ink-muted">
        Not another score that only goes up. Here&apos;s what makes the check real.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONE_STYLES[f.tone]}`}
            >
              {f.icon}
            </span>
            <p className="mt-3 font-medium text-gl-ink">{f.label}</p>
            <p className="mt-1.5 text-sm text-gl-ink-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
