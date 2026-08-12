const STEPS = [
  {
    n: "01",
    tag: "upload",
    title: "Upload your resume",
    body: "PDF, DOCX, or plain text — read once for this check, never stored.",
  },
  {
    n: "02",
    tag: "paste",
    title: "Paste the job description",
    body: "The real posting you're applying to, not a general idea of the role.",
  },
  {
    n: "03",
    tag: "review",
    title: "Get your gap report",
    body: "An honest score, a tailored resume and cover letter, and a plan for any real gaps.",
  },
] as const;

/** DESIGN.md's "pinned evidence card" process pattern, reused as-is from VerificationProcess for a 3-step flow instead of 4. */
export function SimpleSteps() {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
        3 simple steps
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

        <ol className="relative grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
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
