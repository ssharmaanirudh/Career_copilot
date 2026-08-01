const STEPS = [
  {
    n: "01",
    tag: "extract",
    title: "Read the posting structurally",
    body: "Every requirement gets pulled into a checklist — a bulleted must-have list carries real weight; a single mention in a background paragraph doesn't.",
  },
  {
    n: "02",
    tag: "verify",
    title: "Check each claim for evidence",
    body: "Your resume is checked line by line against every requirement — a named tool, a project, a number, not just matching vocabulary.",
  },
  {
    n: "03",
    tag: "flag",
    title: "Catch keyword-stuffing",
    body: "Phrasing that echoes the posting's exact wording with nothing real behind it gets penalized, not rewarded.",
  },
  {
    n: "04",
    tag: "score",
    title: "Score, capped honestly",
    body: "A fixed formula scores the match — and caps it hard if a core requirement is missing, no matter how polished the rest reads.",
  },
] as const;

/** DESIGN.md's "pinned evidence card" process pattern — rotated cards on a dashed thread, mono numbering. */
export function VerificationProcess() {
  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
        How the check works
      </h2>

      <div className="relative mt-8">
        {/* Thread: horizontal on sm+, vertical on mobile — both dashed crimson, sit behind the pins/cards. */}
        <div
          className="pointer-events-none absolute top-[13px] right-6 left-6 hidden border-t-2 border-dashed sm:block"
          style={{ borderColor: "color-mix(in srgb, var(--gl-crimson) 45%, transparent)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-4 bottom-4 left-[13px] border-l-2 border-dashed sm:hidden"
          style={{ borderColor: "color-mix(in srgb, var(--gl-crimson) 45%, transparent)" }}
          aria-hidden="true"
        />

        <ol className="relative grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.n} className="flex flex-col items-start gap-3">
              <span
                className="relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-gl-paper font-mono text-[11px] font-medium text-gl-crimson"
                style={{ border: "2px solid var(--gl-crimson)" }}
              >
                {step.n}
              </span>
              <div
                className={`rounded ${i % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"}`}
                style={{
                  background: "var(--gl-paper-card)",
                  borderRadius: "4px",
                  padding: "1rem 1.1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
                  {step.tag}
                </p>
                <p className="mt-1 text-sm font-medium text-gl-ink">{step.title}</p>
                <p className="mt-1.5 text-xs text-gl-ink-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
