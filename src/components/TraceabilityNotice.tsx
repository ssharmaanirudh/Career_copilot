import type { TraceabilityIssue, TraceabilitySection } from "@/lib/types";

const SECTION_LABELS: Record<TraceabilitySection, string> = {
  profile: "Profile",
  objective: "Objective",
  coreStrengths: "Core strengths",
  experience: "Experience",
  coverLetter: "Cover letter",
};

/**
 * Surfaces every traceability-check finding — corrected or not — so a fix
 * or an unresolved overstatement is never silent either way, matching how
 * every other change this product makes is disclosed (keyChanges, flags).
 * Renders nothing when the tailored output checked out clean.
 */
export function TraceabilityNotice({ issues }: { issues: TraceabilityIssue[] }) {
  if (issues.length === 0) return null;

  const rewritten = issues.filter((i) => i.resolution === "rewritten");
  const flagged = issues.filter((i) => i.resolution === "flagged");

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
      <h4 className="text-sm font-semibold text-gl-ink-muted">Traceability check</h4>
      <p className="mt-1 text-xs text-gl-ink-faint">
        Every claim in your tailored resume and cover letter is checked against your original
        resume.{" "}
        {rewritten.length > 0 &&
          `${rewritten.length} line${rewritten.length === 1 ? "" : "s"} corrected to stay within what your resume actually supports`}
        {rewritten.length > 0 && flagged.length > 0 && "; "}
        {flagged.length > 0 &&
          `${flagged.length} flagged below for your review — we couldn't rewrite ${flagged.length === 1 ? "it" : "them"} without more information from you`}
        .
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {issues.map((issue, i) => (
          <li
            key={i}
            className={`rounded-xl border p-3 text-sm ${
              issue.resolution === "flagged"
                ? "border-gl-crimson/25 bg-gl-crimson-bg/40"
                : "border-gl-ink/10"
            }`}
          >
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
              <span>{SECTION_LABELS[issue.section]}</span>
              <span aria-hidden="true">·</span>
              <span className={issue.resolution === "flagged" ? "text-gl-crimson" : ""}>
                {issue.resolution === "flagged" ? "flagged, left as written" : "corrected"}
              </span>
            </p>
            <p className="mt-1 text-gl-ink-muted">&ldquo;{issue.claim}&rdquo;</p>
            <p className="mt-1 text-xs text-gl-ink-faint">{issue.issue}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
