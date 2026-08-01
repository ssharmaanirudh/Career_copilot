/** Static, hardcoded sample output for the landing page — never wired to real data. */

import { BigScore } from "./BigScore";
import { RequirementRow } from "./RequirementRow";
import { VerdictStamp } from "./VerdictStamp";

const SCORE = 42;

const CHECKLIST = [
  {
    type: "essential",
    status: "met",
    requirement: "3+ years of backend development",
    detail: "5 years building backend services in Node.js and Python",
    isEvidence: true,
  },
  {
    type: "essential",
    status: "not_met",
    requirement: "AWS (EC2, S3, Lambda)",
    detail: "No mention of AWS or any cloud infrastructure work.",
    isEvidence: false,
  },
  {
    type: "essential",
    status: "not_met",
    requirement: "Kubernetes / container orchestration",
    detail: "No mention of Kubernetes or container orchestration.",
    isEvidence: false,
  },
  {
    type: "desirable",
    status: "met",
    requirement: "CI/CD pipeline experience",
    detail: "Built CI/CD pipelines using GitHub Actions",
    isEvidence: true,
  },
] as const;

export function SamplePreview() {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gl-ink-faint">
          What you get back
        </h2>
        <span className="rounded-full bg-gl-ink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gl-ink-faint">
          Sample — not a real result
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-gl-ink/20 bg-gl-paper-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BigScore score={SCORE} size="md" />
            <div className="min-w-[14rem]">
              <h3 className="font-semibold text-gl-ink">Application strength</h3>
              <p className="mt-1 text-sm text-gl-ink-muted">
                Score capped: 2 essential requirements are unmet — AWS and Kubernetes.
              </p>
            </div>
          </div>
          <VerdictStamp label="SCORE CAPPED" tone="crimson" trigger />
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
              flash={item.status === "not_met"}
            />
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gl-ink/10 pt-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gl-ink/10 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gl-ink-faint">
              Quick fix &middot; REST API design
            </p>
            <p className="mt-2 text-sm text-gl-ink-faint line-through decoration-gl-ink/20">
              Worked on backend services
            </p>
            <p className="mt-1.5 text-sm font-medium text-gl-ink">
              Designed and built 6 REST APIs powering the core backend service
            </p>
            <p className="mt-1.5 text-xs text-gl-ink-faint">
              The evidence was already there — it just wasn&apos;t stated in the posting&apos;s
              terms.
            </p>
          </div>

          <div className="rounded-xl border border-gl-ink/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gl-ink">
                Real gap &middot; AWS (EC2, S3, Lambda)
              </p>
              <span className="rounded-full bg-gl-crimson-bg px-2 py-0.5 text-xs font-medium text-gl-crimson">
                High priority
              </span>
            </div>
            <p className="mt-1 text-sm text-gl-ink-muted">
              No cloud infrastructure experience shown anywhere in the resume.
            </p>
            <p className="mt-2 text-xs text-gl-ink-muted">
              Deploy a personal project on AWS free tier and document the architecture, or
              complete AWS Cloud Practitioner and add it to the resume.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
