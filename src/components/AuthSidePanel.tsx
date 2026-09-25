import { BigScore } from "./BigScore";
import { RequirementRow } from "./RequirementRow";
import { StatusPill } from "./StatusPill";
import { SparkleMark, PaperAirplaneMark, SketchArrowMark } from "./DecorativeMarks";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
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

const SCORE = 82;

const CHECKLIST = [
  {
    type: "essential",
    status: "met",
    requirement: "5+ years building dashboards",
    detail: "5+ years building dashboards in Power BI and writing SQL for ad-hoc reporting.",
    isEvidence: true,
  },
  {
    type: "essential",
    status: "met",
    requirement: "Cross-functional stakeholder rollout",
    detail: "Led cross-functional rollout across 12 regional teams.",
    isEvidence: true,
  },
  {
    type: "desirable",
    status: "not_met",
    requirement: "Familiarity with dbt or similar transformation tools",
    detail: "No mention of dbt or a comparable transformation tool.",
    isEvidence: false,
  },
] as const;

/**
 * Illustrative "what you'll see" panel for the sign-in/sign-up pages —
 * same card chrome as HeroAnalyzingCard (and the same Stat/StatusPill
 * pieces), but showing the completed state with BigScore + RequirementRow
 * instead of a gauge/donut, per DESIGN.md's ban on that chart type — a
 * deliberate, confirmed departure from the reference this was designed
 * against. Static mock content, honestly labeled, never wired to a real
 * analysis.
 */
export function AuthSidePanel() {
  return (
    <div className="relative hidden lg:block">
      <SparkleMark className="pointer-events-none absolute -top-5 left-6 h-4 w-4 text-gl-teal opacity-70" />
      <PaperAirplaneMark className="pointer-events-none absolute -top-7 right-2 h-9 w-14 -rotate-[8deg] text-gl-ink-faint opacity-60" />

      {/*
        Handwriting-style annotation: DESIGN.md restricts the serif to
        h1/h2 only and names Inter/IBM Plex Mono as the only other two
        fonts, so — same precedent as SecondSamplePreview.tsx — this
        reuses the mono system with a slight rotation instead of adding a
        fourth (handwriting) webfont.
      */}
      <div className="pointer-events-none absolute -top-11 right-6 w-40 -rotate-2">
        <p className="font-mono text-xs text-gl-teal">
          Your career analysis,
          <br />
          one step away
        </p>
        <SketchArrowMark className="mt-1 h-8 w-8 rotate-[100deg] text-gl-teal" />
      </div>

      <div className="rounded-xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-lg shadow-black/5 sm:rotate-1">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-teal">
            <CheckIcon />
            Analysis complete
          </p>
          <span className="rounded-full bg-gl-ink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gl-ink-faint">
            Sample — not a real result
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-b border-gl-ink/10 pb-4">
          <div className="flex items-center gap-4">
            <BigScore score={SCORE} size="md" />
            <div>
              <h3 className="font-semibold text-gl-ink">Application strength</h3>
              <p className="mt-1 text-sm text-gl-ink-muted">
                Both essentials met — one desirable skill missing.
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 flex-col gap-2 sm:flex">
            <Stat label="Verified" value={2} tone="teal" />
            <Stat label="Gaps" value={1} tone="crimson" />
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          {CHECKLIST.map((item) => (
            <RequirementRow
              key={item.requirement}
              type={item.type}
              status={item.status}
              requirement={item.requirement}
              detail={item.detail}
              isEvidence={item.isEvidence}
            />
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-gl-ink/10 pt-4">
          <StatusPill tone="teal" icon="check" label="Verified" />
          <StatusPill tone="teal" icon="check" label="Verified" />
          <StatusPill tone="crimson" icon="x" label="Gap" />
          <StatusPill tone="neutral" icon="bolt" label="Quick fix" />
        </div>
      </div>
    </div>
  );
}
