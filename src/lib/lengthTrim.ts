import { type Schema, Type } from "@google/genai";
import { MODEL, AnalysisError, generateStructuredJson } from "./geminiClient";
import { str } from "./normalize";
import type { LengthCut, ResumeBullet, TailoredResume, TargetResumeLength } from "./types";

/**
 * Page-length trim — a structurally independent follow-up call, same
 * pattern as traceabilityCheck.ts/actionPlan.ts, run only when the user
 * opts into a target length. gemini.ts's SYSTEM_PROMPT is never touched
 * for this: content selection happens here only, on the already-generated
 * TailoredResume.
 *
 * Design choice, deliberately narrower than "the model returns a trimmed
 * resume": the model's only job is to RANK existing bullets by relevance
 * to the JD (least relevant first) — it never re-emits, rewords, or
 * regenerates any resume text. This code then deterministically removes
 * bullets from the least-relevant end of that ranking until an estimated
 * word-count budget for the target length is met. That means every
 * surviving bullet is guaranteed byte-identical to the original (the
 * model literally cannot reword anything, only rank it), and the cut list
 * is built directly from what was actually removed, not from the model's
 * self-report — the same "construct the risky part in code, don't trust
 * free generation for it" principle already used for resourceUrl.
 *
 * "Page" is approximate by necessity: an LLM has no access to how the
 * final document will actually paginate. The word-count budgets below are
 * a rough estimate for a single-column resume at normal margins/font —
 * good enough for a genuinely useful target, not a pixel-perfect
 * guarantee. Framed as an approximate target in the UI, never as "exactly
 * N pages."
 */

const WORD_BUDGETS: Record<Exclude<TargetResumeLength, "none">, number> = {
  "1-page": 500,
  "2-page": 1000,
};

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function bulletWordCount(b: ResumeBullet): number {
  return wordCount(b.label) + wordCount(b.text);
}

/** Body content only — name/contact aren't part of what gets trimmed, so they're excluded from the budget they're measured against. */
function computeBodyWordCount(resume: TailoredResume): number {
  let total = wordCount(resume.profile) + wordCount(resume.objective);
  for (const b of resume.coreStrengths) total += bulletWordCount(b);
  for (const job of resume.experience) {
    total += wordCount(job.title) + wordCount(job.company);
    for (const b of job.bullets) total += bulletWordCount(b);
  }
  for (const ed of resume.education) total += wordCount(ed.program) + wordCount(ed.institution);
  return total;
}

const SYSTEM_PROMPT = `You are helping fit a tailored resume to a target page length by ranking which existing bullets are safest to remove if needed. You never rewrite, reword, paraphrase, or invent anything — you only rank bullets that already exist, by index.

You are given a tailored resume as JSON (with 0-based indices into its coreStrengths array and into each experience entry's bullets array) and the job description it was tailored for.

List EVERY bullet in coreStrengths and EVERY bullet in every experience entry's bullets array, exactly once each, ordered from LEAST relevant to this specific job description (remove first if trimming is needed) to MOST relevant (keep, remove last if ever). Judge relevance strictly by how directly each bullet supports THIS job description's actual stated requirements — not by how impressive a bullet sounds in general, and not by recency alone.

For each item, give a one-sentence reason for its position in the ranking, specific enough to explain the ordering (e.g. "generic team-coordination bullet with no metric or tool the JD asks for" ranks lower than "directly demonstrates the JD's required SQL reporting skill").

Do not omit any bullet from your ranking — every coreStrengths bullet and every experience bullet must appear exactly once. Do not invent bullets that don't exist. Respond only with the requested JSON.`;

const RANKED_ITEM_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    source: {
      type: Type.STRING,
      enum: ["coreStrength", "experienceBullet"],
    },
    experienceIndex: {
      type: Type.INTEGER,
      description: "0-based index into the experience array. Use -1 if source is 'coreStrength'.",
    },
    bulletIndex: {
      type: Type.INTEGER,
      description:
        "0-based index into coreStrengths (if source is 'coreStrength') or into that experience entry's bullets array (if source is 'experienceBullet').",
    },
    reason: {
      type: Type.STRING,
      description: "One sentence: why this bullet ranks where it does relative to the JD.",
    },
  },
  required: ["source", "experienceIndex", "bulletIndex", "reason"],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rankedForRemoval: {
      type: Type.ARRAY,
      description:
        "Every coreStrengths bullet and every experience bullet, ordered least-relevant-to-the-JD first.",
      items: RANKED_ITEM_SCHEMA,
    },
  },
  required: ["rankedForRemoval"],
};

interface RankedCandidate {
  source: "coreStrength" | "experienceBullet";
  experienceIndex: number;
  bulletIndex: number;
  reason: string;
}

function normalizeRanked(raw: unknown): RankedCandidate[] {
  if (!Array.isArray(raw)) return [];
  const out: RankedCandidate[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const source = obj.source === "coreStrength" || obj.source === "experienceBullet" ? obj.source : null;
    if (!source) continue;
    const experienceIndex = Math.round(Number(obj.experienceIndex));
    const bulletIndex = Math.round(Number(obj.bulletIndex));
    if (!Number.isFinite(experienceIndex) || !Number.isFinite(bulletIndex)) continue;
    out.push({ source, experienceIndex, bulletIndex, reason: str(obj.reason) });
  }
  return out;
}

export interface LengthTrimResult {
  trimmedResume: TailoredResume;
  cuts: LengthCut[];
}

/**
 * Deterministically applies the model's ranking: removes candidates from
 * the least-relevant end until the word budget is met, or until the "keep
 * at least one bullet per experience entry" floor stops further removal
 * from that entry — so a job header is never left with zero bullets under
 * it. Every actual removal is recorded in cuts, built from the removed
 * bullet's own text, not from anything the model claims separately.
 */
function applyTrim(
  resume: TailoredResume,
  ranked: RankedCandidate[],
  wordBudget: number,
): LengthTrimResult {
  const removedCoreStrengths = new Set<number>();
  const removedBullets = new Map<number, Set<number>>();
  const cuts: LengthCut[] = [];
  let currentWords = computeBodyWordCount(resume);

  for (const item of ranked) {
    if (currentWords <= wordBudget) break;

    if (item.source === "coreStrength") {
      const idx = item.bulletIndex;
      if (idx < 0 || idx >= resume.coreStrengths.length) continue;
      if (removedCoreStrengths.has(idx)) continue;
      const bullet = resume.coreStrengths[idx];
      removedCoreStrengths.add(idx);
      currentWords -= bulletWordCount(bullet);
      cuts.push({
        section: "Core Strengths",
        description: bullet.label ? `"${bullet.label}: ${bullet.text}"` : `"${bullet.text}"`,
        reason: item.reason || "Ranked lowest relevance to the target job description.",
      });
    } else {
      const expIdx = item.experienceIndex;
      if (expIdx < 0 || expIdx >= resume.experience.length) continue;
      const job = resume.experience[expIdx];
      const bIdx = item.bulletIndex;
      if (bIdx < 0 || bIdx >= job.bullets.length) continue;
      const removedSet = removedBullets.get(expIdx) ?? new Set<number>();
      if (removedSet.has(bIdx)) continue;
      const remainingCount = job.bullets.length - removedSet.size;
      if (remainingCount <= 1) continue; // floor: never remove a job entry's last bullet
      const bullet = job.bullets[bIdx];
      removedSet.add(bIdx);
      removedBullets.set(expIdx, removedSet);
      currentWords -= bulletWordCount(bullet);
      const jobLabel = [job.title, job.company].filter(Boolean).join(" · ") || `Experience entry ${expIdx + 1}`;
      cuts.push({
        section: jobLabel,
        description: bullet.label ? `"${bullet.label}: ${bullet.text}"` : `"${bullet.text}"`,
        reason: item.reason || "Ranked lowest relevance to the target job description.",
      });
    }
  }

  const trimmedResume: TailoredResume = {
    ...resume,
    coreStrengths: resume.coreStrengths.filter((_, i) => !removedCoreStrengths.has(i)),
    experience: resume.experience.map((job, i) => {
      const removedSet = removedBullets.get(i);
      if (!removedSet || removedSet.size === 0) return job;
      return { ...job, bullets: job.bullets.filter((_, j) => !removedSet.has(j)) };
    }),
  };

  return { trimmedResume, cuts };
}

/**
 * Entry point. "none" (or content already under budget) short-circuits
 * before making any Gemini call at all — no trimming means literally
 * nothing runs, not an empty-cuts result from a call that had nothing to
 * do.
 */
export async function trimResumeToLength(
  resume: TailoredResume,
  jobDescription: string,
  targetLength: TargetResumeLength,
): Promise<LengthTrimResult> {
  if (targetLength === "none") {
    return { trimmedResume: resume, cuts: [] };
  }

  const wordBudget = WORD_BUDGETS[targetLength];
  if (computeBodyWordCount(resume) <= wordBudget) {
    return { trimmedResume: resume, cuts: [] };
  }

  const userMessage = `TAILORED RESUME (JSON, with the indices your ranking must reference):\n"""\n${JSON.stringify(
    { coreStrengths: resume.coreStrengths, experience: resume.experience },
    null,
    2,
  )}\n"""\n\nJOB DESCRIPTION IT WAS TAILORED FOR:\n"""\n${jobDescription}\n"""`;

  const responseText = await generateStructuredJson({
    model: process.env.GEMINI_MODEL || MODEL,
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AnalysisError("The length-trim response wasn't valid JSON. Please try again.");
  }

  const obj = parsed as Record<string, unknown>;
  const ranked = normalizeRanked(obj.rankedForRemoval);

  return applyTrim(resume, ranked, wordBudget);
}
