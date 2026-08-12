/** A second, smaller static sample — different persona/role from SamplePreview — purely to show scoring reads honestly both ways. Never wired to real data. */

import { BigScore } from "./BigScore";
import { RequirementRow } from "./RequirementRow";
import { VerdictStamp } from "./VerdictStamp";
import { SketchArrowMark } from "./DecorativeMarks";

const SCORE = 82;

const CHECKLIST = [
  {
    type: "essential",
    status: "met",
    requirement: "3+ years of B2B content marketing",
    detail: "4 years leading B2B content strategy for a SaaS company",
    isEvidence: true,
  },
  {
    type: "essential",
    status: "met",
    requirement: "Managing a content calendar and editorial team",
    detail: "Managed a 6-person editorial calendar across blog, email, and social",
    isEvidence: true,
  },
  {
    type: "desirable",
    status: "not_met",
    requirement: "Familiarity with marketing automation (e.g. HubSpot)",
    detail: "No mention of HubSpot or any marketing automation platform.",
    isEvidence: false,
  },
] as const;

export function SecondSamplePreview() {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-gl-teal">
        Know your real match
      </p>
      <h2 className="font-serif mt-1 max-w-xl text-2xl font-semibold text-gl-ink sm:text-3xl">
        A different role, the same honest check.
      </h2>
      <p className="mt-2 max-w-xl text-gl-ink-muted">
        We check real-world evidence, not keyword overlap — and cap the score
        whenever an essential requirement is missing.
      </p>

      <div className="relative mt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
            Application strength
          </span>
          <span className="rounded-full bg-gl-ink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gl-ink-faint">
            Sample — not a real result
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-gl-ink/20 bg-gl-paper-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <BigScore score={SCORE} size="md" />
              <div className="min-w-[14rem]">
                <h3 className="font-semibold text-gl-ink">Application strength</h3>
                <p className="mt-1 text-sm text-gl-ink-muted">
                  Both essentials are met with direct evidence — one desirable skill is missing.
                </p>
              </div>
            </div>
            <VerdictStamp label="STRONG MATCH" tone="teal" trigger />
          </div>

          <ul className="mt-5 flex flex-col gap-1 border-t border-gl-ink/10 pt-4">
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
        </div>

        {/*
          Handwriting-style annotation: DESIGN.md restricts the serif to
          h1/h2 only and names Inter/IBM Plex Mono as the only other two
          fonts, so rather than force in a fourth (handwriting) webfont,
          this reuses the existing mono system with a slight rotation to
          read as an informal margin note instead.
        */}
        <div className="pointer-events-none absolute -right-4 -bottom-10 hidden w-40 rotate-2 sm:block lg:-right-16">
          <SketchArrowMark className="h-9 w-9 -rotate-90 text-gl-ink-faint" />
          <p className="mt-1 font-mono text-xs text-gl-ink-faint">
            we quote the exact evidence, every time
          </p>
        </div>
      </div>
    </section>
  );
}
