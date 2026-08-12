/**
 * Bespoke decorative marks for the landing page margins — texture that
 * echoes the document-inspection metaphor (a verified badge, an index
 * card, a highlighter swipe, a pinned note), not stock icons. Always
 * rendered small, rotated, and low-opacity by the parent; colors come
 * from `currentColor`/`fill`, so callers set color via a text-gl-* class
 * and opacity via a Tailwind opacity-* class — never at full strength,
 * per DESIGN.md's rule that teal/crimson only appear to make a status
 * claim. These stay off crimson entirely since they don't represent a
 * real flagged item.
 */

export function CheckBadgeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="19" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 28.5 25 34.5 37 21.5" />
    </svg>
  );
}

export function IndexCardMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 6h34l14 14v30a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M42 6v14h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 28h24M14 36h24M14 44h16" />
    </svg>
  );
}

export function HighlighterMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 28" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 14c0-6 3-10 10-10h62c6 0 10 3 10 9s-3 10-9 11l-64 2c-6 0-9-5-9-12z" />
    </svg>
  );
}

export function PinMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="42" rx="6" ry="2" opacity={0.5} />
      <path strokeLinecap="round" d="M20 8 14 30" />
      <circle cx="23" cy="10" r="7" />
    </svg>
  );
}

/** A small folded-paper dart with a dashed trail — the crease line is drawn in the page color so it reads regardless of the fill color passed in. */
export function PaperAirplaneMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 70" className={className} aria-hidden="true">
      <path
        d="M18 44c-9 5-14 12-14 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="1 6"
        opacity={0.6}
      />
      <path fill="currentColor" d="M20 40 78 12 48 40 78 66 46 48Z" />
      <path d="M48 40 78 12" fill="none" stroke="var(--gl-paper)" strokeWidth={1.25} opacity={0.7} />
    </svg>
  );
}

/** A simple 4-point sparkle — used sparingly as a hand-drawn accent, not a repeated icon-pack motif. */
export function SparkleMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10Z" />
    </svg>
  );
}

/** A hand-sketched arrow for annotation callouts — a wobbled curve with a small open arrowhead, not a straight system-icon arrow. */
export function SketchArrowMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M6 50c10-2 18-10 20-24s10-18 22-20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M40 4l8 2-3 8" />
    </svg>
  );
}
