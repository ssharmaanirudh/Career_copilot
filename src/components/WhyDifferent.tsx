const POINTS = [
  {
    title: "Grounded in evidence, not vocabulary",
    body: "Every requirement gets checked against what your resume actually shows — not just word overlap with the posting.",
  },
  {
    title: "A real cap, not a vibe",
    body: "Missing a core requirement caps your score, and we name exactly which requirement caused it.",
  },
  {
    title: "Real gaps stay real gaps",
    body: "Wording fixes and skills you'd need to build are kept separate — a gap never gets dressed up as a typo.",
  },
];

export function WhyDifferent() {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
        Why GapLens is different
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {POINTS.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border border-gl-ink/10 bg-gl-paper-card p-4"
          >
            <p className="text-sm font-semibold text-gl-ink">{point.title}</p>
            <p className="mt-1.5 text-sm text-gl-ink-muted">{point.body}</p>
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
