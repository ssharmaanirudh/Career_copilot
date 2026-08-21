function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path strokeLinecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0Zm14 0-3 6a3 3 0 0 0 6 0ZM5 7h14M5 7 8 3M19 7l-3-4" />
    </svg>
  );
}

/**
 * Closing honesty/privacy band — deliberately not a testimonial/rating bar
 * (CLAUDE.md: GapLens has no real users yet, and fabricating a rating would
 * violate the product's own core positioning). Borrows the reference
 * layout's two-column icon+claim band, filled with true claims instead.
 */
export function TrustBand() {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5 sm:grid-cols-2 sm:divide-x sm:divide-gl-ink/10">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gl-ink text-white">
          <LockIcon />
        </span>
        <div>
          <p className="font-medium text-gl-ink">Private by default</p>
          <p className="mt-1 text-sm text-gl-ink-muted">
            Your resume and job description are processed once, for this check, and never
            stored.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 sm:pl-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gl-teal-bg text-gl-teal">
          <ScaleIcon />
        </span>
        <div>
          <p className="font-medium text-gl-ink">No inflated scores</p>
          <p className="mt-1 text-sm text-gl-ink-muted">
            A high score always means the essentials are actually met — never rounded up for
            good writing.
          </p>
        </div>
      </div>
    </div>
  );
}
