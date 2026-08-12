"use client";

import { useEffect, useState } from "react";
import { VerdictStamp } from "./VerdictStamp";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type MarkKind = "verified" | "gap";

interface Mark {
  kind: MarkKind;
  note: string;
}

const MARKS: Mark[] = [
  { kind: "verified", note: "verified — named tools, hands-on use" },
  { kind: "verified", note: "verified — specific, quantified" },
  { kind: "gap", note: "gap — familiarity isn't hands-on evidence" },
];

const STAGE_DELAY_MS = 400;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function MarginNote({ mark, revealed }: { mark: Mark; revealed: boolean }) {
  const color = mark.kind === "verified" ? "text-gl-teal" : "text-gl-crimson";
  return (
    <div
      className={`flex items-start gap-1.5 font-mono text-xs ${color} transition-all duration-500 motion-reduce:transition-none`}
      style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateX(0)" : "translateX(6px)" }}
    >
      {mark.kind === "verified" ? <CheckIcon /> : <XIcon />}
      <span>{mark.note}</span>
    </div>
  );
}

/** Underline (verified) or pill-circle (gap) reveal around a phrase, drawn in as if marked up live. */
function MarkedPhrase({ mark, revealed, children }: { mark: Mark; revealed: boolean; children: React.ReactNode }) {
  if (mark.kind === "verified") {
    return (
      <span className="relative inline-block">
        {children}
        <span
          className="absolute inset-x-0 bottom-[-2px] h-[2px] origin-left bg-gl-teal transition-transform duration-500 motion-reduce:transition-none"
          style={{ transform: revealed ? "scaleX(1)" : "scaleX(0)" }}
          aria-hidden="true"
        />
      </span>
    );
  }
  return (
    <span
      className="rounded-full transition-all duration-500 motion-reduce:transition-none"
      style={{
        border: "2px solid var(--gl-crimson)",
        padding: "0 6px",
        marginInline: "-2px",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "scale(1)" : "scale(0.85)",
      }}
    >
      {children}
    </span>
  );
}

interface DocumentMarkupDemoProps {
  /** Hides the margin-notes column and stamp, leaving just the card — used when this is layered behind another card in a denser composition where the full two-column layout doesn't fit. The pills row shown alongside it in that case carries the same verified/gap summary. */
  compact?: boolean;
}

/**
 * DESIGN.md's signature "live document markup" element. Sample/mock data
 * only, clearly labeled — never wired to real scoring output. One trigger
 * per page (the hero); Phase 4 reuses VerdictStamp but not this whole demo.
 */
export function DocumentMarkupDemo({ compact = false }: DocumentMarkupDemoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState(0); // 0 = nothing, 1..3 = marks, 4 = stamp

  useEffect(() => {
    if (reducedMotion) return; // nothing to stage — effectiveStage below jumps straight to the end state
    const timers = [1, 2, 3, 4].map((s) =>
      setTimeout(() => setStage(s), s * STAGE_DELAY_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const effectiveStage = reducedMotion ? 4 : stage;

  return (
    <div className={compact ? "" : "grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-start"}>
      <div className="relative">
        {/* Two rotated paper layers behind the real card, matching its box exactly since they're inset-0 within this wrapper. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rotate-[1.5deg] rounded"
          style={{ background: "var(--gl-paper-card)", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rotate-[-2deg] rounded"
          style={{ background: "var(--gl-paper-card)", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}
        />

        <div
          className="relative rounded"
          style={{
            background: "var(--gl-paper-card)",
            borderRadius: "4px",
            padding: "1.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
            Sample resume excerpt — illustrative only
          </p>
          <p className="font-semibold text-gl-ink">Priya Nair — Product Analyst</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm text-gl-ink-muted">
            <li>
              5+ years building dashboards in{" "}
              <MarkedPhrase mark={MARKS[0]} revealed={effectiveStage >= 1}>
                Power BI and writing SQL
              </MarkedPhrase>{" "}
              for ad-hoc reporting.
            </li>
            <li>
              Led{" "}
              <MarkedPhrase mark={MARKS[1]} revealed={effectiveStage >= 2}>
                cross-functional rollout across 12 regional teams
              </MarkedPhrase>
              .
            </li>
            <li>
              <MarkedPhrase mark={MARKS[2]} revealed={effectiveStage >= 3}>
                Familiar with AWS services
              </MarkedPhrase>{" "}
              for data pipelines.
            </li>
          </ul>

          {/* Floating callout — the same gap MarginNote[2] already announces to screen readers, so this is aria-hidden. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -bottom-5 hidden max-w-[12.5rem] rounded-lg p-3 shadow-lg transition-all duration-500 ease-out motion-reduce:transition-none sm:block"
            style={{
              background: "var(--gl-ink)",
              opacity: effectiveStage >= 3 ? 1 : 0,
              transform:
                effectiveStage >= 3
                  ? "translateY(0) rotate(-2deg) scale(1)"
                  : "translateY(6px) rotate(-2deg) scale(0.95)",
            }}
          >
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-crimson">
              <XIcon />
              Gap detected
            </p>
            <p className="mt-1 text-xs text-white/90">Familiarity isn&apos;t hands-on evidence.</p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-3 sm:w-48 sm:pt-10">
          <MarginNote mark={MARKS[0]} revealed={effectiveStage >= 1} />
          <MarginNote mark={MARKS[1]} revealed={effectiveStage >= 2} />
          <MarginNote mark={MARKS[2]} revealed={effectiveStage >= 3} />
          <div className="mt-1">
            <VerdictStamp label="SCORE CAPPED" tone="crimson" trigger={effectiveStage >= 4} />
          </div>
        </div>
      )}
    </div>
  );
}
