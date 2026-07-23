import { type Schema, Type } from "@google/genai";
import { MODEL, generateStructuredJson, AnalysisError } from "./geminiClient";
import { clampScore, str, bool } from "./normalize";
import type {
  AnalysisResult,
  ActionPlanResult,
  ActionPlanAction,
  ExcludedActionItem,
  TimeBudget,
  ActionType,
  ActionPlanVerdict,
  EffortEstimate,
} from "./types";

/**
 * Generates a prioritized, time-bounded action plan from an ALREADY-COMPLETED
 * scoring result (ACTION-PLAN.md). This never re-scores or re-derives
 * met/not_met/isCoreRequirement — it only ranks and filters what standard
 * scoring already decided, against a stated time budget.
 */
const SYSTEM_PROMPT = `You are generating a prioritized action plan from a completed GapLens scoring result. Do not re-score the resume — you are ranking and filtering the existing requirements checklist by leverage and feasibility within a stated time budget. Every fact you use (which requirements are unmet, which is the core requirement, which have thin evidence) comes from the scoring result you are given; never re-derive or second-guess those judgments.

RULES

1. Rank every not_met requirement (essential and desirable) and every "met" requirement with evidenceStrength "thin" by leverage:
   - An unmet essential requirement that is part of the current cap tier: highest leverage.
   - The unmet essential requirement marked isCoreRequirement true (the hard 15-point-cap driver): highest possible leverage, but ONLY include it in the ranking if it is genuinely achievable within TIME_BUDGET per the feasibility rule below — if it is not feasible, it must NOT appear in actions at all; it goes in excludedHighLeverageItems instead, regardless of how high its leverage would otherwise be.
   - A "met" requirement with evidenceStrength "thin": medium-low leverage — this is a wording/evidence-clarity action (actionType "wording_fix"), not a gap-closure action, since the requirement is already met.
   - An unmet desirable requirement: lowest leverage.

2. Feasibility filter by TIME_BUDGET — every not_met item has an effort estimate (from the scoring result's wordingFixes/skillGaps data). Filter using that estimate:
   - "today" or "this week": only quick-effort items are eligible.
   - "2-4 weeks": quick and medium-effort items are eligible.
   - "1-3 months" or "3+ months": all effort tiers are eligible.
   - Wording-fix actions (Category A closures, and "met but thin evidence" clarifications) are always quick and always eligible, regardless of TIME_BUDGET.
   - Any high-leverage item excluded solely by this filter (not by rank) belongs in excludedHighLeverageItems with reason "not reachable in stated timeframe".

3. Select the top actions by leverage from the feasibility-filtered list, up to 4. If fewer than 4 eligible items exist, return fewer — never pad with low-value filler just to reach 4.

4. For each selected action, state: rank (1 = highest leverage), which requirement it addresses (requirementAddressed, matching the scoring result's exact requirement text), actionType ("wording_fix" for Category A closures and "met but thin" clarifications, "real_gap_closure" for Category B), a specific and actionable description (the exact rewrite for a wording fix; a concrete way to build real evidence for a gap closure — never generic advice), flipsRequirementToMet (true only if completing this specific action would flip that requirement from not_met to met — a "met but thin" clarification action is false, since the requirement is already met), and effortEstimate.

5. Compute projectedScoreCapAfterActions: assume every selected action with flipsRequirementToMet true succeeds, using the exact same cap-tier algorithm as standard scoring:
   - Start from the requirements that would remain unmet after applying those flips.
   - 1 unmet essential remaining -> cap at 55.
   - 2 unmet -> cap at 35.
   - 3+ unmet -> cap at 20.
   - If the isCoreRequirement item is STILL unmet after the actions (either it wasn't selected, or it was excluded as infeasible) -> cap at 15 regardless of how many other requirements would be met.
   - 0 unmet essentials remaining -> no cap from this rule (score can reach its normal ceiling).

6. Determine the verdict:
   - "achievable": completing all selected actions would leave zero essential requirements unmet.
   - "partial": completing all selected actions still leaves at least one essential requirement unmet (name it/them in unmetEssentialsAfterActions) — state plainly in honestSummary that these actions improve the application but do not make it fully competitive, and suggest either extending the timeframe or targeting a better-fit role.
   - "not_reachable": the time budget doesn't support any meaningful action on the unmet essentials at all (this is about progress on essentials specifically — the actions array may still contain a couple of wording-fix/desirable-requirement actions even here; "not_reachable" is never manufactured away by padding the list with those).

Never imply full job-readiness or a guaranteed interview/offer, ever — even when verdict is "achievable," phrase it as "this application becomes competitive," never "you will get this job." If verdict is "partial" or "not_reachable," say so as plainly and bluntly as a not_met requirement in standard scoring — no softening, no silver-lining language.

Respond only with the requested JSON, matching the schema exactly.`;

const ACTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rank: { type: Type.INTEGER, description: "1 = highest leverage." },
    requirementAddressed: {
      type: Type.STRING,
      description: "Must match a requirement's exact text from the scoring result.",
    },
    actionType: { type: Type.STRING, enum: ["wording_fix", "real_gap_closure"] },
    description: {
      type: Type.STRING,
      description: "Specific and actionable — never generic advice.",
    },
    flipsRequirementToMet: { type: Type.BOOLEAN },
    effortEstimate: { type: Type.STRING, enum: ["quick", "medium", "substantial"] },
  },
  required: [
    "rank",
    "requirementAddressed",
    "actionType",
    "description",
    "flipsRequirementToMet",
    "effortEstimate",
  ],
};

const EXCLUDED_ITEM_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    requirement: { type: Type.STRING },
    reason: { type: Type.STRING, description: "e.g. 'not reachable in stated timeframe'." },
  },
  required: ["requirement", "reason"],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    timeBudget: {
      type: Type.STRING,
      enum: ["today", "this week", "2-4 weeks", "1-3 months", "3+ months"],
    },
    actions: {
      type: Type.ARRAY,
      items: ACTION_SCHEMA,
      description: "Up to 4, ranked by leverage. Never padded to reach 4.",
    },
    excludedHighLeverageItems: { type: Type.ARRAY, items: EXCLUDED_ITEM_SCHEMA },
    projectedScoreCapAfterActions: { type: Type.INTEGER },
    verdict: { type: Type.STRING, enum: ["achievable", "partial", "not_reachable"] },
    unmetEssentialsAfterActions: { type: Type.ARRAY, items: { type: Type.STRING } },
    honestSummary: { type: Type.STRING },
  },
  required: [
    "timeBudget",
    "actions",
    "excludedHighLeverageItems",
    "projectedScoreCapAfterActions",
    "verdict",
    "unmetEssentialsAfterActions",
    "honestSummary",
  ],
};

function normalizeAction(raw: unknown): ActionPlanAction {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const actionType: ActionType = obj.actionType === "real_gap_closure" ? "real_gap_closure" : "wording_fix";
  const effortEstimate: EffortEstimate =
    obj.effortEstimate === "medium" || obj.effortEstimate === "substantial"
      ? obj.effortEstimate
      : "quick";
  return {
    rank: Math.max(1, Math.round(Number(obj.rank) || 1)),
    requirementAddressed: str(obj.requirementAddressed),
    actionType,
    description: str(obj.description),
    flipsRequirementToMet: bool(obj.flipsRequirementToMet),
    effortEstimate,
  };
}

function normalizeExcludedItem(raw: unknown): ExcludedActionItem {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return { requirement: str(obj.requirement), reason: str(obj.reason) };
}

function normalizeActionPlanResult(raw: Record<string, unknown>, timeBudget: TimeBudget): ActionPlanResult {
  const actions = Array.isArray(raw.actions) ? raw.actions : [];
  const excluded = Array.isArray(raw.excludedHighLeverageItems) ? raw.excludedHighLeverageItems : [];
  const unmetEssentials = Array.isArray(raw.unmetEssentialsAfterActions)
    ? raw.unmetEssentialsAfterActions
    : [];
  const verdict: ActionPlanVerdict =
    raw.verdict === "achievable" || raw.verdict === "not_reachable" ? raw.verdict : "partial";

  return {
    timeBudget,
    actions: actions
      .slice(0, 4)
      .map(normalizeAction)
      .sort((a, b) => a.rank - b.rank),
    excludedHighLeverageItems: excluded.map(normalizeExcludedItem),
    projectedScoreCapAfterActions: clampScore(raw.projectedScoreCapAfterActions),
    verdict,
    unmetEssentialsAfterActions: unmetEssentials.filter((s): s is string => typeof s === "string"),
    honestSummary: str(raw.honestSummary),
  };
}

export async function generateActionPlan(
  scoringResult: AnalysisResult,
  timeBudget: TimeBudget,
): Promise<ActionPlanResult> {
  // Only the checklist-derived data Action Plan actually ranks/filters — never the
  // resume/cover letter text, since this feature must not re-derive or touch those.
  const scoringInput = {
    requirementsChecklist: scoringResult.requirementsChecklist,
    wordingFixes: scoringResult.wordingFixes,
    skillGaps: scoringResult.skillGaps,
    unmetEssentialCount: scoringResult.originalScore.unmetEssentialCount,
  };

  const userMessage = `SCORING_RESULT:\n${JSON.stringify(scoringInput, null, 2)}\n\nTIME_BUDGET: "${timeBudget}"`;

  const responseText = await generateStructuredJson({
    model: process.env.GEMINI_MODEL || MODEL,
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AnalysisError("The AI response wasn't valid JSON. Please try again.");
  }

  return normalizeActionPlanResult(parsed as Record<string, unknown>, timeBudget);
}
