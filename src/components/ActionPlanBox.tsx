"use client";

import { useState } from "react";
import type { ActionPlanResult, AnalysisResult, TimeBudget } from "@/lib/types";

const TIME_BUDGETS: TimeBudget[] = ["today", "this week", "2-4 weeks", "1-3 months", "3+ months"];

interface ActionPlanBoxProps {
  scoringResult: AnalysisResult;
}

/**
 * Functional plumbing only — collects the time budget and calls /api/action-plan.
 * Deliberately minimal, unstyled rendering of the result; Phase B replaces this
 * with the actual DESIGN.md-styled results view (verdict stamp, ranked action
 * cards, link back to the full checklist).
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setPlan(data as ActionPlanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
      <h3 className="font-semibold text-gl-ink">Action plan (dev preview)</h3>
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
                <li key={a.rank} className="rounded-lg border border-gl-ink/10 p-2">
                  <p className="font-medium text-gl-ink">
                    #{a.rank} · {a.requirementAddressed} ({a.effortEstimate})
                  </p>
                  <p className="text-gl-ink-muted">{a.description}</p>
                </li>
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
