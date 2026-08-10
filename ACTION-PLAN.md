# GapLens — Action Plan feature spec

Reference alongside CLAUDE.md (product logic/voice) and DESIGN.md
(visual system). This file specifies the "4 actions, time-bounded"
feature discussed as GapLens's convenience/prioritization layer.

## Purpose

Standard GapLens scoring already produces a full requirements checklist
split into Category A (quick fixes — real experience worded poorly) and
Category B (real gaps — skills genuinely absent). Most users don't want
an exhaustive list; they want to know what to do RIGHT NOW, ranked by
impact, given how much time they actually have.

This feature does NOT replace the full checklist — it sits on top of
it as a prioritization layer. The full checklist remains available
("see full breakdown"); the Action Plan is a distilled, ranked view of
the same underlying data.

## Non-negotiable constraint

This feature must never claim or imply "complete these 4 things and
you'll be job-ready" if that isn't true. If the highest-leverage 4
actions still leave essential requirements unmet after completion, the
plan must say so explicitly. "Time-bounded honesty" is the feature's
actual differentiator — competitors imply readiness after any action
plan; GapLens states plainly when a role isn't realistically reachable
in the stated time, and says what to do instead (extend the timeline,
or target a better-fit role).

## Inputs required from the user

1. The standard resume + JD (already collected)
2. **Time budget** — how long until they need to apply/be ready.
   Options: "today," "this week," "2-4 weeks," "1-3 months," "3+ months."
   This directly affects which actions are even feasible to suggest —
   don't suggest "build a deployed ML project" for a "today" budget.

## Step-by-step logic

STEP 1 — Run standard scoring (existing pipeline)
Produces the full requirements checklist, cap tier, Category A/B split,
as already implemented.

STEP 2 — Rank all Category A and B items by leverage
"Leverage" = how much completing this item would move the actual score,
per the existing cap logic:
- Closing an unmet ESSENTIAL requirement that's part of the current
  cap tier = highest leverage (directly raises the score cap)
- Closing an unmet essential that's the "core technical function" cap
  (the hard 15-point floor) = highest possible leverage, but ONLY
  rank this if it's genuinely achievable in the stated time budget —
  see feasibility filter below
- A Category A wording fix on a requirement that's already met but
  weakly evidenced = lower leverage (doesn't change met/unmet status,
  but may improve evidence clarity/confidence)
- Closing an unmet DESIRABLE requirement = lowest leverage (capped
  contribution to score per existing +10 max rule)

STEP 3 — Apply the feasibility filter (this is the key honesty gate)
For each Category B (real gap) item, classify effort required using the
existing effort_estimate field (quick/medium/substantial) and check it
against the user's stated time budget:
- "today" / "this week" budget → only quick-effort items are feasible.
  Medium/substantial-effort Category B items CANNOT be included in the
  4 actions, no matter how high their leverage — flag them separately
  as "not reachable in your timeframe."
- "2-4 weeks" → quick and medium effort items are feasible.
- "1-3 months" or "3+ months" → all effort tiers are feasible.
Category A (wording) fixes are always "quick" and feasible at any
time budget.

STEP 4 — Select the top 4 actions
From the feasibility-filtered, leverage-ranked list, select the top 4.
If fewer than 4 feasible items exist (e.g. someone with a very short
time budget and mostly substantial-effort gaps), return fewer than 4 —
do NOT pad the list with low-value filler to hit exactly 4.

STEP 5 — Compute the honest post-action projection
For each of the 4 selected actions, if completed, determine whether it
would flip that specific requirement from unmet to met. Recompute what
the SCORE CAP would become if all 4 actions were completed (using the
same cap-tier logic as standard scoring — 1 unmet essential caps at 55,
2 at 35, 3+ at 20, core technical unmet caps at 15 regardless).

STEP 6 — Generate the verdict
Compare the projected post-action cap to the JD's core requirements:
- If completing all 4 actions would clear ALL essential requirements →
  verdict: "achievable" — state plainly this role becomes realistic in
  this timeframe if all 4 are completed.
- If completing all 4 actions still leaves ANY essential requirement
  (especially the core technical one) unmet → verdict: "partial" — 
  state plainly that these 4 actions improve the application but do
  NOT make it fully competitive, name exactly which essential 
  requirement(s) remain unmet, and suggest either extending the 
  timeframe or considering a better-fit role.
- If the user's time budget cannot support ANY meaningful action on 
  the unmet essentials (e.g. "today" budget with only substantial-effort 
  gaps) → verdict: "not reachable in this timeframe" — say so plainly, 
  do not manufacture 4 items from low-value wording tweaks to avoid 
  saying this.

## LLM prompt

```
You are generating a prioritized action plan from a completed GapLens 
scoring result. Do not re-score the resume — you are ranking and 
filtering the existing requirements checklist by leverage and 
feasibility within a stated time budget.

INPUT
SCORING_RESULT: <full JSON checklist from standard scoring>
TIME_BUDGET: "today" | "this week" | "2-4 weeks" | "1-3 months" | "3+ months"

RULES
1. Rank every not_met (essential and desirable) and weakly-evidenced 
   met requirement by leverage per the tiering rules below:
   - unmet essential contributing to current cap tier: highest leverage
   - unmet essential = core technical function (hard 15-cap driver): 
     highest leverage IF feasible in time budget, otherwise excluded 
     from ranking entirely regardless of leverage
   - weakly-evidenced met requirement (wording improvement only): 
     medium-low leverage
   - unmet desirable requirement: lowest leverage

2. Filter by TIME_BUDGET:
   - "today" / "this week": only quick-effort items eligible
   - "2-4 weeks": quick and medium-effort items eligible
   - "1-3 months" / "3+ months": all effort tiers eligible
   Category A wording fixes are always quick/eligible regardless of 
   budget.

3. Select the top 4 eligible items by leverage. If fewer than 4 
   eligible items exist, return fewer — do not pad with low-value 
   filler to force a count of 4.

4. For each selected action, state:
   - what it is specifically (a wording fix with the exact rewrite, or 
     a real-gap action with a concrete way to build evidence)
   - which requirement it addresses
   - whether completing it would flip that requirement from not_met to 
     met (boolean)

5. Compute the projected score cap assuming all 4 actions are 
   completed and their target requirements become met, using the same 
   cap-tier rules as standard scoring.

6. Determine the verdict:
   - "achievable": all essential requirements would be met after 
     completing all 4 actions
   - "partial": some essential requirements remain unmet after all 4 
     actions — name them explicitly
   - "not_reachable": the time budget doesn't support any meaningful 
     action on the unmet essentials

Never imply full job-readiness unless verdict is "achievable." Never 
inflate action count or leverage to make the plan look more complete 
than it is. If verdict is "partial" or "not_reachable," say so as 
plainly as a "not_met" requirement in standard scoring — no softening.

OUTPUT (valid JSON only)
{
  "time_budget": "string",
  "actions": [
    {
      "rank": integer,
      "requirement_addressed": "string",
      "action_type": "wording_fix" | "real_gap_closure",
      "description": "string — specific, actionable",
      "flips_requirement_to_met": boolean,
      "effort_estimate": "quick" | "medium" | "substantial"
    }
  ],
  "excluded_high_leverage_items": [
    {"requirement": "string", "reason": "not reachable in stated timeframe"}
  ],
  "projected_score_cap_after_actions": integer,
  "verdict": "achievable" | "partial" | "not_reachable",
  "unmet_essentials_after_actions": ["string"],
  "honest_summary": "one or two sentences stating plainly what these 4 
    actions do and do not achieve, and what to do about any remaining 
    gap (extend timeframe / consider a different role)"
}
```

## UI/UX notes

- Present as "your 4 actions" or similar, ranked, with the effort 
  estimate visible per action (so a user immediately sees which are 
  quick vs. substantial).
- The verdict banner sits above the action list, using the same 
  verdict-stamp visual pattern from DESIGN.md — "achievable" uses 
  --gl-teal, "partial"/"not_reachable" use --gl-crimson.
  "achievable" should NOT feel like a guarantee of a job offer — copy 
  should say "this application becomes competitive," not "you will get 
  this job."
- Always provide a link/expand to the full requirements checklist 
  underneath — the 4 actions are a view on top of the full data, never 
  a replacement for it.
- If verdict is "not_reachable," do not hide this behind the 4 
  actions — show it prominently, first, before any action items, with 
  a clear next step (suggest extending timeframe, or offer to check 
  fit against a different, more realistic role).
