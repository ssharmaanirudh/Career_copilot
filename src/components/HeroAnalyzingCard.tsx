import { GaugeRing } from "./GaugeRing";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h4l2-7 4 14 2-9 2 4h6" />
    </svg>
  );
}

function StepRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gl-teal text-white">
          <CheckIcon />
        </span>
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gl-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-gl-teal motion-safe:animate-pulse" />
        </span>
      )}
      <span className="text-sm text-gl-ink">{label}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "teal" | "crimson" }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">{label}</p>
      <p className={`text-lg font-bold ${tone === "teal" ? "text-gl-teal" : "text-gl-crimson"}`}>{value}</p>
    </div>
  );
}

/**
 * Decorative "analyzing your match" dashboard mockup for the landing-page
 * hero — a one-off exception to DESIGN.md's no-gauge rule (see
 * GaugeRing.tsx), approved for this specific composition only. Static
 * mock content, never wired to a real analysis.
 */
export function HeroAnalyzingCard() {
  return (
    <div
      className="rounded-xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-lg shadow-black/5"
      style={{ borderRadius: 10 }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-teal">
          <PulseIcon />
          Analyzing your match
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gl-teal/15">
        <div className="h-full w-2/3 rounded-full bg-gl-teal" />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <StepRow label="Resume uploaded" done />
        <StepRow label="Job description" done />
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gl-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-gl-teal motion-safe:animate-pulse" />
          </span>
          <span className="text-sm text-gl-ink">
            AI analysis <span className="text-gl-ink-faint">— scanning evidence…</span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-gl-ink/10 pt-5">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
          <GaugeRing score={82} size={128} strokeWidth={10} />
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-gl-teal">82</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">/ 100</span>
            <span className="mt-0.5 text-[10px] text-gl-ink-muted">Application strength</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <Stat label="Verified" value={12} tone="teal" />
          <Stat label="Gaps" value={3} tone="crimson" />
          <Stat label="Quick fixes" value={5} tone="teal" />
        </div>
      </div>
    </div>
  );
}
