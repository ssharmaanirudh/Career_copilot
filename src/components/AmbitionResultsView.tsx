"use client";

import { useEffect, useState } from "react";
import type { AmbitionModeResult } from "@/lib/types";
import { BigScore } from "./BigScore";
import { VerdictStamp } from "./VerdictStamp";
import { RequirementRow } from "./RequirementRow";
import { WordingFixList } from "./WordingFixList";
import { SkillGapList } from "./SkillGapList";

function sourceLabel(count: number, total: number, type: "essential" | "desirable"): string {
  return `${type} · appears in ${count}/${total} postings`;
}

/**
 * AMBITION-MODE.md UI requirements are explicitly "critical, not cosmetic":
 * a persistent composite-picture banner, per-requirement source-count tags
 * (in place of a single evidence-style citation), and a visible source
 * list — kept together in this one view so the composite framing can never
 * be scrolled past or missed, the way it could if split across tabs like
 * the single-JD ResultsView.
 */
export function AmbitionResultsView({
  result,
  onAdjustDomain,
}: {
  result: AmbitionModeResult;
  /** Re-runs the whole search/score flow with a corrected domain when the user says the inferred one is wrong. Omit to hide the adjust control. */
  onAdjustDomain?: (domain: string) => void;
}) {
  const [stampTrigger, setStampTrigger] = useState(false);
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainDraft, setDomainDraft] = useState(result.inferredDomain);

  useEffect(() => {
    const timer = setTimeout(() => setStampTrigger(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const postingCount = result.postings.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Domain-aware retrieval (AMBITION-MODE.md): keeps the inferred search
          domain visible and correctable, rather than a hidden step — a
          generic role title alone can pull real postings from a completely
          unrelated field, so this is the honesty mechanism for retrieval
          itself, not just for the score. */}
      {onAdjustDomain && (
        <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-4 text-sm shadow-sm shadow-black/5">
          {editingDomain ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="shrink-0 text-gl-ink-muted">Searching as: {result.targetRole},</span>
              <input
                type="text"
                value={domainDraft}
                onChange={(e) => setDomainDraft(e.target.value)}
                placeholder="e.g. public health / development sector"
                className="w-full rounded-xl border border-gl-ink/15 p-2 text-sm shadow-inner shadow-black/5 focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
              />
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDomain(false);
                    onAdjustDomain(domainDraft);
                  }}
                  className="rounded-xl bg-gl-teal px-3 py-2 text-xs font-semibold text-white"
                >
                  Re-search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDomainDraft(result.inferredDomain);
                    setEditingDomain(false);
                  }}
                  className="rounded-xl border border-gl-ink/15 px-3 py-2 text-xs font-medium text-gl-ink-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gl-ink-muted">
              Searching as:{" "}
              <span className="font-medium text-gl-ink">
                {result.targetRole}
                {result.inferredDomain ? `, ${result.inferredDomain}` : ""}
              </span>{" "}
              <button
                type="button"
                onClick={() => setEditingDomain(true)}
                className="text-gl-teal hover:underline"
              >
                not quite right? adjust
              </button>
            </p>
          )}
        </div>
      )}

      {/* Persistent composite-picture banner — must stay visible throughout this view, not just on first load. */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm shadow-amber-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="mt-0.5 h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-8.99 3.98v.02"
          />
        </svg>
        <p>
          <span className="font-semibold">
            Composite picture from {postingCount} real postings
          </span>{" "}
          for &ldquo;{result.targetRole}&rdquo; — not a single employer&apos;s actual requirements.
          This shows how you&apos;d typically stack up, not whether you&apos;d clear one specific
          company&apos;s bar.
        </p>
      </div>

      {result.flags.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm shadow-amber-100">
          <p className="font-semibold">Flagged during review</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
        <div className="flex flex-wrap items-center gap-6">
          <BigScore score={result.score.matchScore} />
          <div className="flex min-w-[16rem] flex-1 items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gl-ink">Typical fit for this role</h3>
              <p className="mt-1 text-sm text-gl-ink-muted">{result.score.summary}</p>
            </div>
            <VerdictStamp
              label={result.score.wouldClearTechnicalScreen ? "LOOKS COMPETITIVE" : "LIKELY STRUGGLE"}
              tone={result.score.wouldClearTechnicalScreen ? "teal" : "crimson"}
              trigger={stampTrigger}
            />
          </div>
        </div>

        <div className="mt-6 border-t border-gl-ink/10 pt-4">
          <h4 className="text-sm font-semibold text-gl-ink-muted">
            Composite requirements checklist
          </h4>
          <ul className="mt-3 flex flex-col gap-1">
            {result.requirementsChecklist.map((item, i) => (
              <RequirementRow
                key={i}
                type={item.type}
                status={item.status}
                requirement={item.requirement}
                detail={sourceLabel(item.sourceCount, item.sourceTotal, item.type)}
                isEvidence={false}
                flash={item.status === "not_met"}
              />
            ))}
          </ul>
        </div>
      </div>

      {result.honestSummary && (
        <div className="flex gap-3 rounded-2xl border border-gl-ink/10 bg-gl-ink/5 p-4 shadow-sm shadow-black/5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gl-ink/10 text-gl-ink-muted">
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
                d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gl-ink-muted">The honest take</p>
            <p className="mt-1.5 text-sm text-gl-ink-muted">{result.honestSummary}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
        <h4 className="text-sm font-semibold text-gl-ink-muted">
          Sources used for this composite ({postingCount})
        </h4>
        <p className="mt-1 text-xs text-gl-ink-faint">
          Real postings retrieved via search, used to build the checklist above — so you can
          verify this isn&apos;t invented.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {result.postings.map((p, i) => (
            <li key={i} className="rounded-xl border border-gl-ink/10 p-3 text-sm">
              <p className="font-medium text-gl-ink">{p.title}</p>
              <p className="mt-0.5 text-gl-ink-faint">
                {[p.company, p.postingDate].filter(Boolean).join(" · ") || "Details not stated"}
              </p>
            </li>
          ))}
        </ul>
        {result.sources.length > 0 && (
          <div className="mt-4 border-t border-gl-ink/10 pt-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
              Search sources consulted
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {result.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gl-teal hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
        <h4 className="text-sm font-semibold text-gl-ink-muted">Quick fixes and real gaps</h4>
        <div className="mt-3">
          <SkillGapList skillGaps={result.skillGaps} />
        </div>
        <WordingFixList fixes={result.wordingFixes} />
      </div>
    </div>
  );
}
