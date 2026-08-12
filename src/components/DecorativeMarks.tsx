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
