"use client";

import { useState } from "react";
import { parseJsonResponse } from "@/lib/fetchJson";
import type { ActionPlanAction, ActionPlanResult, AnalysisResult, TimeBudget } from "@/lib/types";

const TIME_BUDGETS: TimeBudget[] = ["today", "this week", "2-4 weeks", "1-3 months", "3+ months"];

interface ActionPlanBoxProps {
  scoringResult: AnalysisResult;
}

const ACTION_TYPE_LABELS: Record<ActionPlanAction["actionType"], string> = {
  wording_fix: "quick fix",
  real_gap_closure: "real gap",
};

const EFFORT_LABELS: Record<ActionPlanAction["effortEstimate"], string> = {
  quick: "quick · days",
  medium: "medium · weeks",
  substantial: "substantial · months+",
};

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

function ActionCard({ action }: { action: ActionPlanAction }) {
  const [open, setOpen] = useState(false);
  const panelId = `action-detail-${action.rank}`;

  return (
    <li className="rounded-lg border border-gl-ink/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-2.5 p-2.5 text-left transition-colors hover:bg-gl-ink/5"
      >
        <span className="mt-0.5 shrink-0 font-mono text-xs text-gl-ink-faint">
          #{action.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gl-ink">{action.requirementAddressed}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
            {ACTION_TYPE_LABELS[action.actionType]}
            <span className="mx-1.5">·</span>
            {EFFORT_LABELS[action.effortEstimate]}
          </p>
          <p className="mt-1 line-clamp-1 text-sm text-gl-ink-muted">{action.description}</p>
        </div>
        <span className="mt-0.5 shrink-0 text-gl-ink-faint">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-gl-ink/10 p-2.5 pt-2">
          <p className="text-sm text-gl-ink-muted">{action.description}</p>
        </div>
      )}
    </li>
  );
}

/**
 * Collects the time budget and calls /api/action-plan. Ranked actions render
 * with the same collapse-by-default pattern as SkillGapList: icon/rank + label
 * line + one-line summary, full detail on expand.
 */
export function ActionPlanBox({ scoringResult }: ActionPlanBoxProps) {
  const [timeBudget, setTimeBudget] = useState<TimeBudget>("2-4 weeks");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ActionPlanResult | null>(null);

  async function handleGeneratePlan() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoringResult, timeBudget }),
      });
      const data = await parseJsonResponse<ActionPlanResult>(
        res,
        "Something went wrong while building your action plan. Please try again.",
      );
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
      <h3 className="font-semibold text-gl-ink">Action plan</h3>
      <p className="mt-1 text-sm text-gl-ink-faint">
        How long until you need to apply or be ready?
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={timeBudget}
          onChange={(e) => setTimeBudget(e.target.value as TimeBudget)}
          className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm"
        >
          {TIME_BUDGETS.map((tb) => (
            <option key={tb} value={tb}>
              {tb}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={busy}
          className="brand-gradient-bg rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Building…" : "Get action plan"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-gl-crimson">{error}</p>}

      {plan && (
        <div className="mt-4 border-t border-gl-ink/10 pt-4 text-sm">
          <p className="font-semibold text-gl-ink">
            Verdict: <span className="uppercase">{plan.verdict}</span> — projected cap{" "}
            {plan.projectedScoreCapAfterActions}/100
          </p>
          <p className="mt-1 text-gl-ink-muted">{plan.honestSummary}</p>

          {plan.actions.length > 0 && (
            <ol className="mt-3 flex flex-col gap-2">
              {plan.actions.map((a) => (
                <ActionCard key={a.rank} action={a} />
              ))}
            </ol>
          )}

          {plan.excludedHighLeverageItems.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-gl-ink-muted">Not reachable in this timeframe:</p>
              <ul className="mt-1 list-disc pl-5 text-gl-ink-faint">
                {plan.excludedHighLeverageItems.map((x) => (
                  <li key={x.requirement}>{x.requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
