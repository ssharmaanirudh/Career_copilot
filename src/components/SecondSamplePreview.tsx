/** A second, smaller static sample — different persona/role from SamplePreview — purely to show scoring reads honestly both ways. Never wired to real data. */

import { BigScore } from "./BigScore";
import { RequirementRow } from "./RequirementRow";
import { VerdictStamp } from "./VerdictStamp";

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
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
          A different fit
        </h2>
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
    </section>
  );
}
