/**
 * Suggestion-quality eval — a separate dimension from runEval.ts's
 * classification checks (essential/desirable, met/not_met, score
 * ranges). A fixture can classify a gap perfectly correctly and still
 * hand back a useless suggestion for closing it. This suite runs the
 * real pipeline against fixtures known to produce genuine Category B
 * gaps and checks each returned skillGap against three criteria:
 *
 *   1. Specific and actionable — names a concrete project, tool, or
 *      certification, not vague advice ("learn more about X").
 *   2. Practical given its own effortEstimate tag — a "quick" tag
 *      shouldn't sit on something that actually takes weeks/months.
 *   3. Not generic boilerplate — checked by comparing every returned
 *      suggestion's text against every other one collected in the same
 *      run; near-identical phrasing across unrelated skills/fixtures is
 *      exactly what boilerplate looks like.
 *
 * Automated heuristics do a first pass on all three; report this
 * alongside the raw suggestion text so a human reviewer can confirm or
 * override the automated read (heuristics are aids here, not a
 * substitute for actually reading the output — genericness and
 * practicality are judgment calls, not string-matching problems).
 *
 * KNOWN WATCH-ITEM (not a failure, just something to keep an eye on as
 * more fixtures get added): on the first real run of this suite, the
 * large majority of skillGaps opened their first howToBuildEvidence
 * bullet with the same shape — "Complete an online course/certification
 * in <skill>." Each instance did name the specific skill, so it didn't
 * trip the boilerplate check (criterion 3 is about topic-agnostic
 * vagueness, and this wasn't that) or fail review, but it's a real
 * structural homogeneity across ~18 of 23 suggestions in that run. The
 * cross-fixture Jaccard check underweights this pattern because
 * stripping the skill name before comparing dilutes the overlap score
 * below its threshold. If this gets more templated over time (e.g. the
 * SECOND and THIRD bullets start converging too, not just the first),
 * that's worth a dedicated prompt pass — it isn't yet.
 *
 * DO NOT fix suggestion-quality issues by editing Step 8's prompt text
 * in gemini.ts without re-running BOTH `npm run eval` and
 * `npm run eval:suggestions` afterward, and re-checking classification
 * stability with a multi-run consistency check, not just a single pass.
 * Confirmed twice on 2026-08-07: editing only Step 8 (gap-suggestion
 * wording, textually unrelated to Step 1's JD-structure classification)
 * caused un-jd-narrative-bug-fixed to regress from 6/6 clean to 4/4 and
 * then 3/5 failing, even with a small, self-contained edit. The whole
 * system prompt is one generation — the model conditions on all of it
 * before emitting the first output token, so a change anywhere can
 * shift earlier fields' output distribution, not just the section it's
 * textually inside. Both attempts were reverted; the MLOps suggestion
 * fix from that investigation was abandoned rather than shipped with
 * degraded classification reliability. If this needs fixing again,
 * consider a separate follow-up call for suggestion polishing (like the
 * Action Plan feature already does) instead of another mega-prompt edit.
 *
 * Run: npm run eval:suggestions
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { analyzeResumeAgainstJob } from "../src/lib/gemini";
import { loadFixtures } from "./fixtures";
import { SUGGESTION_QUALITY_CASES } from "./suggestionQualityFixtures";
import type { SkillGap } from "../src/lib/types";

const CONCURRENCY = 2;

const VAGUE_PATTERNS = [
  /\blearn (more )?about\b/i,
  /\bfamiliaris?e (yourself )?with\b/i,
  /\bgain (some )?(exposure|experience|familiarity)\b/i,
  /\bget (some )?experience (in|with)\b/i,
  /\bstudy (up on)?\b/i,
  /\bread (up )?about\b/i,
  /\bwork on your\b/i,
  /\bimprove your\b/i,
  /\bbecome (more )?familiar\b/i,
  /\bbrush up on\b/i,
];

const CONCRETE_SIGNAL =
  /\b(certification|certificate|bootcamp|course|capstone|portfolio|deploy|contribute|github|repo|dataset|dashboard|api|pipeline)\b/i;
// A rough proper-noun-ish detector: a capitalized word (not sentence-initial-only) or a
// known acronym/tool-name shape, e.g. "AWS", "Tableau Public", "freeCodeCamp".
const NAMED_ENTITY = /\b[A-Z][a-zA-Z0-9]{1,}(?:\s[A-Z][a-zA-Z0-9]*){0,3}\b/;

const EFFORT_RED_FLAGS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bcertificat(ion|e)\b/i, reason: "certifications realistically take weeks, not \"quick\"" },
  { pattern: /\bbootcamp\b/i, reason: "bootcamps take weeks to months" },
  { pattern: /\bbuild\s+(and\s+)?deploy\b/i, reason: "building and deploying a project is rarely quick" },
  { pattern: /\bcontribute\b.*\bopen.source\b/i, reason: "meaningful open-source contribution takes real time" },
  { pattern: /\bmonths?\b/i, reason: "explicitly describes a multi-month effort" },
  { pattern: /\bend.to.end\b/i, reason: "\"end-to-end\" projects are rarely quick" },
];

interface CriterionResult {
  automatedVerdict: "pass" | "flag";
  notes: string[];
}

interface SuggestionAssessment {
  caseLabel: string;
  fixtureId: string;
  gap: SkillGap | null;
  specific: CriterionResult;
  practical: CriterionResult;
  boilerplateSimilarTo: string[]; // other case labels this suggestion closely resembles
}

function assessSpecific(gap: SkillGap): CriterionResult {
  const notes: string[] = [];
  const items = gap.howToBuildEvidence;
  if (items.length === 0) {
    return { automatedVerdict: "flag", notes: ["howToBuildEvidence is empty"] };
  }
  let anyVague = false;
  let anyConcrete = false;
  for (const item of items) {
    if (VAGUE_PATTERNS.some((p) => p.test(item))) {
      anyVague = true;
      notes.push(`vague phrasing: "${item}"`);
    }
    if (CONCRETE_SIGNAL.test(item) || NAMED_ENTITY.test(item)) {
      anyConcrete = true;
    }
  }
  if (gap.resourceLabel.trim().length > 0) anyConcrete = true;

  if (!anyConcrete) notes.push("no concrete tool/project/certification/named resource detected");
  const verdict = !anyVague && anyConcrete ? "pass" : "flag";
  if (verdict === "pass") notes.push("looks concrete: names a specific action or resource");
  return { automatedVerdict: verdict, notes };
}

function assessPractical(gap: SkillGap): CriterionResult {
  const notes: string[] = [];
  const text = gap.howToBuildEvidence.join(" ");
  if (gap.effortEstimate === "quick") {
    const hit = EFFORT_RED_FLAGS.find((f) => f.pattern.test(text));
    if (hit) {
      return {
        automatedVerdict: "flag",
        notes: [`tagged "quick" but suggestion text implies otherwise: ${hit.reason}`],
      };
    }
  }
  notes.push(`effortEstimate "${gap.effortEstimate}" has no obvious contradiction in the suggestion text`);
  return { automatedVerdict: "pass", notes };
}

function normalizeForComparison(gap: SkillGap): Set<string> {
  const text = `${gap.whatsMissing} ${gap.howToBuildEvidence.join(" ")}`.toLowerCase();
  const skillWords = new Set(gap.skill.toLowerCase().split(/\W+/).filter(Boolean));
  return new Set(
    text
      .split(/\W+/)
      .filter((w) => w.length > 3 && !skillWords.has(w)), // drop the skill name itself so we're comparing structure, not topic
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

async function main() {
  const allFixtures = loadFixtures();
  const cases = SUGGESTION_QUALITY_CASES.map((c) => {
    const fixture = allFixtures.find((f) => f.id === c.fixtureId);
    if (!fixture) throw new Error(`suggestionQualityFixtures references unknown fixture id "${c.fixtureId}"`);
    return { ...c, fixture };
  });

  console.log(`Running ${cases.length} suggestion-quality cases (concurrency ${CONCURRENCY})...\n`);

  const results: { caseLabel: string; fixtureId: string; skillGaps: SkillGap[] }[] = new Array(cases.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= cases.length) return;
      const c = cases[i];
      process.stdout.write(`  running: ${c.fixtureId}...\n`);
      const result = await analyzeResumeAgainstJob(c.fixture.resumeText, c.fixture.jobDescription, []);
      results[i] = { caseLabel: c.expectedGapLabel, fixtureId: c.fixtureId, skillGaps: result.skillGaps };
      process.stdout.write(`  done: ${c.fixtureId} (${result.skillGaps.length} skill gap(s))\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Flatten to one assessment per skillGap, tagged with which fixture/case it came from.
  const flat: { caseLabel: string; fixtureId: string; gap: SkillGap }[] = [];
  for (const r of results) {
    for (const gap of r.skillGaps) {
      flat.push({ caseLabel: r.caseLabel, fixtureId: r.fixtureId, gap });
    }
  }

  const normalized = flat.map((f) => normalizeForComparison(f.gap));
  const assessments: SuggestionAssessment[] = flat.map((f, i) => {
    const boilerplateSimilarTo: string[] = [];
    for (let j = 0; j < flat.length; j++) {
      if (i === j) continue;
      if (flat[j].fixtureId === f.fixtureId) continue; // only cross-fixture similarity counts as boilerplate
      const sim = jaccardSimilarity(normalized[i], normalized[j]);
      if (sim >= 0.6) {
        boilerplateSimilarTo.push(`${flat[j].fixtureId}/${flat[j].gap.skill} (similarity ${(sim * 100).toFixed(0)}%)`);
      }
    }
    return {
      caseLabel: f.caseLabel,
      fixtureId: f.fixtureId,
      gap: f.gap,
      specific: assessSpecific(f.gap),
      practical: assessPractical(f.gap),
      boilerplateSimilarTo,
    };
  });

  console.log(`\n${"=".repeat(70)}`);
  console.log("SUGGESTION QUALITY (separate dimension — not part of the classification pass/fail count)");
  console.log("=".repeat(70));

  for (const r of results) {
    if (r.skillGaps.length === 0) {
      console.log(`\n${r.fixtureId} (${r.caseLabel}): no skillGaps returned — nothing to assess`);
    }
  }

  let flaggedCount = 0;
  for (const a of assessments) {
    const anyFlag =
      a.specific.automatedVerdict === "flag" ||
      a.practical.automatedVerdict === "flag" ||
      a.boilerplateSimilarTo.length > 0;
    if (anyFlag) flaggedCount++;

    console.log(`\n${anyFlag ? "⚠" : "✓"} ${a.fixtureId} — skill: "${a.gap!.skill}" (expected: ${a.caseLabel})`);
    console.log(`  whatsMissing: ${a.gap!.whatsMissing}`);
    console.log(`  howToBuildEvidence:`);
    for (const item of a.gap!.howToBuildEvidence) console.log(`    - ${item}`);
    console.log(`  effortEstimate: ${a.gap!.effortEstimate} | priority: ${a.gap!.priority}`);
    console.log(`  resource: ${a.gap!.resourceLabel || "(none)"}`);
    console.log(
      `  [1] specific/actionable: ${a.specific.automatedVerdict.toUpperCase()} — ${a.specific.notes.join("; ")}`,
    );
    console.log(
      `  [2] practical for effort tier: ${a.practical.automatedVerdict.toUpperCase()} — ${a.practical.notes.join("; ")}`,
    );
    console.log(
      `  [3] not boilerplate: ${a.boilerplateSimilarTo.length === 0 ? "PASS" : "FLAG"}${
        a.boilerplateSimilarTo.length > 0 ? ` — resembles: ${a.boilerplateSimilarTo.join(", ")}` : ""
      }`,
    );
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`${flat.length - flaggedCount}/${flat.length} suggestions passed all automated checks`);
  console.log("(automated checks are a first pass — read the raw text above for the real judgment call)");
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Suggestion quality eval crashed:", err);
  process.exitCode = 1;
});
