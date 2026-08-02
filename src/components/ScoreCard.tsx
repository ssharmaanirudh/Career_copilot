"use client";

import { useEffect, useState } from "react";
import type { RequirementCheck, ScoreBreakdown, ScoreResult } from "@/lib/types";
import { BigScore } from "./BigScore";
import { RequirementRow } from "./RequirementRow";
import { VerdictStamp } from "./VerdictStamp";

interface ScoreCardProps {
  original: ScoreResult;
  tailored: ScoreResult;
  requirementsChecklist: RequirementCheck[];
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

const CHECKLIST_PANEL_ID = "requirements-checklist-panel";

function RequirementsChecklist({ items }: { items: RequirementCheck[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const unmet = items.filter((i) => i.status === "not_met").length;

  return (
    <div className="mt-5 border-t border-gl-ink/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={CHECKLIST_PANEL_ID}
        className="flex items-center gap-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:text-gl-teal"
      >
        <ChevronIcon open={open} />
        Why this score? {items.length} requirement{items.length === 1 ? "" : "s"} checked
        {unmet > 0 && <span className="text-gl-ink-faint">({unmet} not met)</span>}
      </button>
      {open && (
        <ul id={CHECKLIST_PANEL_ID} className="mt-3 flex flex-col gap-1">
          {items.map((item, i) => (
            <RequirementRow
              key={i}
              type={item.type}
              status={item.status}
              requirement={item.requirement}
              detail={item.evidence || item.reasoning}
              isEvidence={Boolean(item.evidence)}
              flash={item.status === "not_met"}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  skillsMatch: "Skills match",
  experienceMatch: "Experience match",
  keywordAlignment: "Keyword alignment",
  overallPresentation: "Presentation",
};

function DeltaBadge({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  if (delta === 0) {
    return (
      <span className="rounded-full bg-gl-ink/10 px-2 py-0.5 text-xs font-semibold text-gl-ink-muted">
        ±0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        positive ? "bg-gl-teal-bg text-gl-teal" : "bg-gl-crimson-bg text-gl-crimson"
      }`}
    >
      {positive ? "+" : ""}
      {delta}
    </span>
  );
}

/** Before → after per metric: a dumbbell (one hue, two shades) rather than a status color. */
function DumbbellRow({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const lo = Math.min(before, after);
  const hi = Math.max(before, after);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-gl-ink-faint">{label}</span>
        <span className="tabular-nums">
          <span className="text-gl-ink-faint">{before}</span>
          <span className="mx-1 text-gl-ink/30">→</span>
          <span className="font-semibold text-gl-ink">{after}</span>
        </span>
      </div>
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gl-ink/10" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-blue-600/30"
          style={{ left: `${lo}%`, width: `${hi - lo}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-gl-paper-card bg-blue-600/30"
          style={{ left: `${before}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-gl-paper-card bg-blue-600"
          style={{ left: `${after}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ original, tailored, requirementsChecklist }: ScoreCardProps) {
  const [stampTrigger, setStampTrigger] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStampTrigger(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center opacity-60">
            <span className="text-xl font-semibold tabular-nums text-gl-ink-faint">
              {original.matchScore}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-gl-ink-faint">Before</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 text-gl-ink/30"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
          <BigScore score={tailored.matchScore} />
          <DeltaBadge before={original.matchScore} after={tailored.matchScore} />
        </div>
        <div className="flex min-w-[16rem] flex-1 items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gl-ink">Application strength</h3>
            <p className="mt-1 text-sm text-gl-ink-muted">{tailored.summary}</p>
          </div>
          <VerdictStamp
            label={tailored.wouldClearTechnicalScreen ? "CLEARS SCREEN" : "SCORE CAPPED"}
            tone={tailored.wouldClearTechnicalScreen ? "teal" : "crimson"}
            trigger={stampTrigger}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-gl-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600/30" />
          Before tailoring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
          After tailoring
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) => (
          <DumbbellRow
            key={key}
            label={BREAKDOWN_LABELS[key]}
            before={original.scoreBreakdown[key]}
            after={tailored.scoreBreakdown[key]}
          />
        ))}
      </div>

      <RequirementsChecklist items={requirementsChecklist} />
    </div>
  );
}
