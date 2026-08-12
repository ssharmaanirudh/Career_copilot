const AVATAR_TONES = ["bg-gl-teal", "bg-gl-ink", "bg-gl-crimson"] as const;

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4z" />
    </svg>
  );
}

/**
 * Abstract avatar row, not photographic stock/placeholder headshots — no
 * legitimate photo source was available, and generating fake photorealistic
 * faces to imply real people would be worse than not having photos at all.
 */
export function SocialProof() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {AVATAR_TONES.map((tone, i) => (
          <span
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ring-2 ring-gl-paper ${tone}`}
          >
            <PersonIcon />
          </span>
        ))}
      </div>
      <p className="text-sm text-gl-ink-muted">
        Join 10,000+ job seekers who apply with confidence
      </p>
    </div>
  );
}
