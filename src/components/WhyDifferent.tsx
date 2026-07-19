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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Why GapLens is different
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {POINTS.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {point.title}
            </p>
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
