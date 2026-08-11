"use client";

import { useState } from "react";
import type { SkillGap } from "@/lib/types";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

/** High priority is the one tier that earns crimson — a genuine "needs attention" claim, not decoration. Medium/low stay neutral ink shades. */
const PRIORITY_TEXT_STYLES: Record<SkillGap["priority"], string> = {
  high: "text-gl-crimson",
  medium: "text-gl-ink-muted",
  low: "text-gl-ink-faint",
};

const EFFORT_LABELS: Record<SkillGap["effortEstimate"], string> = {
  quick: "quick · days",
  medium: "medium · weeks",
  substantial: "substantial · months+",
};

function GapCard({ gap }: { gap: SkillGap }) {
  const [open, setOpen] = useState(false);
  const panelId = `skill-gap-detail-${gap.skill.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <li className="rounded-xl border border-gl-ink/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-2.5 p-3 text-left transition-colors hover:bg-gl-ink/5"
      >
        <span className="mt-0.5 shrink-0 text-gl-crimson">
          <XIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gl-ink">{gap.skill}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide">
            <span className={PRIORITY_TEXT_STYLES[gap.priority]}>{gap.priority} priority</span>
            <span className="mx-1.5 text-gl-ink-faint">·</span>
            <span className="text-gl-ink-faint">{EFFORT_LABELS[gap.effortEstimate]}</span>
          </p>
          <p className="mt-1 line-clamp-1 text-sm text-gl-ink-muted">{gap.whatsMissing}</p>
        </div>
        <span className="mt-1 shrink-0 text-gl-ink-faint">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-gl-ink/10 p-3 pt-2.5">
          <p className="text-sm text-gl-ink-muted">{gap.whatsMissing}</p>
          {gap.howToBuildEvidence.length > 0 && (
            <div className="mt-2 text-sm text-gl-ink-muted">
              <span className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
                How to build real evidence
              </span>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {gap.howToBuildEvidence.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {gap.resourceUrl && (
            <a
              href={gap.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gl-teal hover:underline"
            >
              {gap.resourceLabel || gap.resourceUrl}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          )}
        </div>
      )}
    </li>
  );
}

export function SkillGapList({ skillGaps }: { skillGaps: SkillGap[] }) {
  if (skillGaps.length === 0) {
    return (
      <p className="text-sm text-gl-ink-faint">
        No genuine gaps found — your background lines up well with this role.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {skillGaps.map((gap, i) => (
        <GapCard key={i} gap={gap} />
      ))}
    </ul>
  );
}
