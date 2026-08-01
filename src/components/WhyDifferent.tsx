const POINTS = [
  {
    tag: "evidence",
    body: "Every requirement gets checked against what your resume actually shows — not just word overlap with the posting.",
  },
  {
    tag: "hard caps",
    body: "Missing a core requirement caps your score, and we name exactly which requirement caused it.",
  },
  {
    tag: "real gaps",
    body: "Wording fixes and skills you'd need to build are kept separate — a gap never gets dressed up as a typo.",
  },
];

export function WhyDifferent() {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
        Why GapLens is different
      </h2>
      <div className="mt-3 flex flex-col divide-y divide-gl-ink/10 border-t border-gl-ink/10">
        {POINTS.map((point) => (
          <div
            key={point.tag}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-wide text-gl-ink-faint">
              {point.tag}
            </span>
            <p className="text-sm text-gl-ink-muted">{point.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-gl-ink-faint">
        Works against any job posting from any employer — no marketplace, no partner list, no
        signup wall just to check a single role.
      </p>
    </section>
  );
}
