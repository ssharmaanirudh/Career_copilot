/**
 * Writing-quality eval — a third dimension, separate from runEval.ts's
 * classification checks and runSuggestionQualityEval.ts's Category B
 * (real-gap) suggestion checks. This one is about resume-writing craft on
 * Category A ("quick fix") output specifically: for each WordingFix a
 * fixture produces, is `suggestedLine` actually a strong, professionally
 * written resume bullet — not just "different from currentLine."
 *
 * Four craft criteria, each scored independently:
 *   1. Strong, specific action verbs — not "responsible for" / "helped
 *      with" / "worked on" passive/duty phrasing.
 *   2. Impact quantified wherever the source resume has a number to draw
 *      on — a number present in currentLine or anywhere else in the full
 *      resume shouldn't get lost in the rewrite.
 *   3. Achievement-oriented (what changed because of this person) rather
 *      than duty-oriented (what this person was assigned) — detected via
 *      an outcome/impact signal (a number or an outcome-connector phrase
 *      like "cutting X by Y" / "resulting in").
 *   4. Tight — no corporate filler/padding ("leverage," "utilize," "in
 *      order to," "results-driven," etc.).
 *
 * CRITICAL fifth check, reported separately from the four craft criteria
 * because it isn't a craft nitpick, it's a correctness/honesty check:
 * fabrication detection. Every number that appears in suggestedLine must
 * trace back to something literally present somewhere in the full source
 * resume text. A number in suggestedLine that appears nowhere in the
 * resume is flagged as a likely invented metric — the single worst
 * failure mode this eval can catch, worse than any craft weakness, since
 * CLAUDE.md's entire premise is refusing to inflate/fabricate.
 *
 * Bullets where currentLine and the broader resume both lack any number
 * or outcome signal, and suggestedLine correctly stayed unquantified
 * rather than inventing one, are reported as thinSource: true — not a
 * failure. That's the model doing the right thing (declining to fabricate
 * a number that isn't there); it's flagged separately so a human reviewer
 * can tell "the model wrote a weak bullet" apart from "the source material
 * genuinely doesn't support a stronger bullet without making something
 * up," per the task's explicit instruction not to quietly pad thin source
 * content.
 *
 * Automated heuristics are a first pass, same caveat as the suggestion-
 * quality eval: read the raw currentLine/suggestedLine pairs printed
 * below, don't just trust the PASS/FLAG labels — verb strength,
 * achievement framing, and "is this actually tight" are judgment calls.
 *
 * This eval does not touch gemini.ts. Per the task that introduced it:
 * establish the current baseline first, then decide what (if anything)
 * to change in the tailoring prompt. If a prompt change follows later,
 * re-run this alongside `npm run eval` and `npm run eval:suggestions` —
 * this repo has twice confirmed that editing one part of the mega-prompt
 * can shift output elsewhere in it (see runSuggestionQualityEval.ts's
 * 2026-08-07 note), so a change aimed at wordingFixes needs the other two
 * suites re-checked for regressions, not just this one.
 *
 * Run: npm run eval:writing
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { analyzeResumeAgainstJob } from "../src/lib/gemini";
import { loadFixtures } from "./fixtures";
import type { WordingFix } from "../src/lib/types";

const CONCURRENCY = 2;

const STRONG_VERB_PATTERN =
  /^(built|led|drove|cut|reduced|increased|automated|delivered|designed|implemented|negotiated|spearheaded|established|optimized|streamlined|migrated|scaled|mentored|orchestrated|engineered|architected|accelerated|doubled|tripled|halved|saved|generated|secured|resolved|executed|shipped|deployed|coordinated|transformed|achieved|decreased|improved|created|produced|initiated|pioneered|revamped|overhauled|consolidated|launched|grew|slashed|boosted|expanded|redesigned|rebuilt|authored|analyzed|developed|managed|directed|trained|onboarded|closed|won|earned|raised|cut|standardized|simplified|debugged|refactored|audited)\b/i;

const WEAK_PHRASE_PATTERNS: RegExp[] = [
  /\bresponsible for\b/i,
  /\bhelped (with|to)?\b/i,
  /\bworked on\b/i,
  /\bassisted (with|in)?\b/i,
  /\binvolved in\b/i,
  /\bparticipated in\b/i,
  /\bduties included\b/i,
  /\btasked with\b/i,
  /\bin charge of\b/i,
  /\bwas part of\b/i,
  /\bcontributed to\b/i,
  /\bcharged with\b/i,
];

const OUTCOME_CONNECTOR_PATTERN =
  /\b(resulting in|which (led|resulted)|enabling|leading to|so that|cutting|reducing|increasing|saving|improving|driving|boosting|accelerating|eliminating|preventing|unlocking|generating|growing|doubling|tripling|halving)\b/i;

const FILLER_PATTERNS: RegExp[] = [
  /\bin order to\b/i,
  /\ba variety of\b/i,
  /\bvarious\b/i,
  /\butiliz(e|ed|ing)\b/i,
  /\bleverage(d|s)?\b/i,
  /\bsynerg\w*/i,
  /\bdynamic\b/i,
  /\bdetail.oriented\b/i,
  /\bteam player\b/i,
  /\bresults.driven\b/i,
  /\bself.starter\b/i,
  /\bgo.getter\b/i,
  /\bhard worker\b/i,
  /\bproven track record\b/i,
  /\bwide range of\b/i,
  /\bsuccessfully\b/i,
  /\beffectively\b/i,
  /\bin a timely manner\b/i,
  /\bseamless(ly)?\b/i,
  /\bempower(ed|ing|s)?\b/i,
  /\bunlock(ed|ing|s)?\b/i,
];

const NUMBER_TOKEN_PATTERN = /\$?\d[\d,]*\.?\d*\s*(%|x|k|m|b)?\b/gi;

function extractNumberTokens(text: string): string[] {
  const matches = text.match(NUMBER_TOKEN_PATTERN) ?? [];
  return matches
    .map((m) => m.replace(/[\s,]/g, "").toLowerCase())
    .filter((m) => /\d/.test(m));
}

// Catches spelled-out quantities ("a week," "two days," "a dozen") that
// extractNumberTokens' digit-only regex misses — real resume bullets quantify
// time savings this way at least as often as with digits ("cut onboarding
// from two weeks to three days"). Deliberately NOT used for fabrication
// cross-checking: "about a week" vs. "one week" are semantically equivalent
// but don't match as identical tokens, so token-level drop/fabrication
// comparison stays digit-only (exact-match there is the safer failure mode —
// a missed word-number fabrication is better than false-flagging paraphrase
// as invention). This only feeds the softer achievement/quantification
// craft signals, where a coarser "is there a quantified outcome at all"
// check is what's actually needed.
const WORD_NUMBER_PATTERN =
  /\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|couple|few|half)\s+(second|minute|hour|day|week|month|quarter|year)s?\b/i;

function hasQuantifiedOutcome(text: string): boolean {
  return extractNumberTokens(text).length > 0 || WORD_NUMBER_PATTERN.test(text);
}

interface CriterionResult {
  verdict: "pass" | "flag";
  notes: string[];
}

interface FabricationResult {
  fabricatedNumbers: string[];
  droppedNumbers: string[];
}

interface WordingFixAssessment {
  fixtureId: string;
  fix: WordingFix;
  actionVerb: CriterionResult;
  quantified: CriterionResult;
  achievementOriented: CriterionResult;
  tight: CriterionResult;
  fabrication: FabricationResult;
  thinSource: boolean;
}

function assessActionVerb(suggestedLine: string): CriterionResult {
  const notes: string[] = [];
  const weakHit = WEAK_PHRASE_PATTERNS.find((p) => p.test(suggestedLine));
  const firstWord = suggestedLine.trim().split(/\s+/)[0] ?? "";
  const strongStart = STRONG_VERB_PATTERN.test(firstWord);

  if (weakHit) notes.push(`weak/duty phrasing found: matches ${weakHit}`);
  if (!strongStart) notes.push(`does not open with a recognized strong action verb (opens with "${firstWord}")`);
  if (!weakHit && strongStart) notes.push(`opens with a strong action verb ("${firstWord}")`);

  return { verdict: !weakHit && strongStart ? "pass" : "flag", notes };
}

function assessAchievementOriented(suggestedLine: string): CriterionResult {
  const hasNumber = hasQuantifiedOutcome(suggestedLine);
  const hasOutcomeConnector = OUTCOME_CONNECTOR_PATTERN.test(suggestedLine);
  if (hasNumber || hasOutcomeConnector) {
    return {
      verdict: "pass",
      notes: [
        hasNumber
          ? "carries a quantified outcome"
          : "carries an outcome-connector phrase describing what changed",
      ],
    };
  }
  return {
    verdict: "flag",
    notes: ["no quantified outcome or outcome-connector phrase — reads as a duty/assignment, not a result"],
  };
}

function assessTight(currentLine: string, suggestedLine: string): CriterionResult {
  const notes: string[] = [];
  const fillerHits = FILLER_PATTERNS.filter((p) => p.test(suggestedLine));
  if (fillerHits.length > 0) {
    notes.push(`filler/corporate-padding phrasing found (${fillerHits.length} match(es))`);
  }
  const lengthRatio = suggestedLine.length / Math.max(currentLine.length, 1);
  if (lengthRatio > 1.6) {
    notes.push(
      `suggestedLine is ${lengthRatio.toFixed(1)}x the length of currentLine — check it tightened rather than padded`,
    );
  }
  if (notes.length === 0) notes.push("no filler patterns detected, length is reasonable relative to currentLine");
  return { verdict: fillerHits.length === 0 ? "pass" : "flag", notes };
}

function assessQuantification(currentLine: string, suggestedLine: string, resumeText: string): CriterionResult {
  const currentNumbers = extractNumberTokens(currentLine);
  const suggestedNumbers = extractNumberTokens(suggestedLine);
  const dropped = currentNumbers.filter((n) => !suggestedNumbers.includes(n));

  if (dropped.length > 0) {
    return {
      verdict: "flag",
      notes: [`currentLine had ${dropped.join(", ")} but suggestedLine dropped it instead of preserving it`],
    };
  }
  if (currentNumbers.length > 0) {
    return { verdict: "pass", notes: ["number(s) from currentLine were preserved in suggestedLine"] };
  }
  if (suggestedNumbers.length > 0) {
    return { verdict: "pass", notes: ["suggestedLine surfaces a number not in currentLine — verify it's traceable below"] };
  }
  // No digit-based number in either line — check for a spelled-out quantity
  // ("a week," "two days") before falling through to a flag. Not doing
  // drop-detection at this level (see hasQuantifiedOutcome's comment) — this
  // is just "is there a quantified outcome here at all."
  if (hasQuantifiedOutcome(suggestedLine) || hasQuantifiedOutcome(currentLine)) {
    return { verdict: "pass", notes: ["quantified via a spelled-out figure rather than a digit (e.g. \"a week,\" \"two days\")"] };
  }
  const resumeHasNumbersAtAll = extractNumberTokens(resumeText).length > 0 || hasQuantifiedOutcome(resumeText);
  return {
    verdict: "flag",
    notes: [
      resumeHasNumbersAtAll
        ? "no number in currentLine or suggestedLine — check whether a relevant number exists elsewhere in the resume that should have been pulled in"
        : "no number anywhere — see thinSource flag",
    ],
  };
}

function assessFabrication(currentLine: string, suggestedLine: string, resumeText: string): FabricationResult {
  const resumeNumbers = new Set(extractNumberTokens(resumeText));
  const currentNumbers = new Set(extractNumberTokens(currentLine));
  const suggestedNumbers = extractNumberTokens(suggestedLine);

  const fabricatedNumbers = suggestedNumbers.filter((n) => !resumeNumbers.has(n));
  const droppedNumbers = [...currentNumbers].filter((n) => !suggestedNumbers.includes(n));

  return { fabricatedNumbers, droppedNumbers };
}

function isThinSource(currentLine: string, suggestedLine: string): boolean {
  const noQuantifiedOutcome = !hasQuantifiedOutcome(currentLine) && !hasQuantifiedOutcome(suggestedLine);
  const noOutcomeConnector = !OUTCOME_CONNECTOR_PATTERN.test(suggestedLine);
  return noQuantifiedOutcome && noOutcomeConnector;
}

function assessWordingFix(fixtureId: string, fix: WordingFix, resumeText: string): WordingFixAssessment {
  return {
    fixtureId,
    fix,
    actionVerb: assessActionVerb(fix.suggestedLine),
    quantified: assessQuantification(fix.currentLine, fix.suggestedLine, resumeText),
    achievementOriented: assessAchievementOriented(fix.suggestedLine),
    tight: assessTight(fix.currentLine, fix.suggestedLine),
    fabrication: assessFabrication(fix.currentLine, fix.suggestedLine, resumeText),
    thinSource: isThinSource(fix.currentLine, fix.suggestedLine),
  };
}

async function main() {
  const fixtures = loadFixtures().filter((f) => !f.expectInputError);

  console.log(`Running ${fixtures.length} fixtures for writing-quality assessment (concurrency ${CONCURRENCY})...\n`);

  const results: { fixtureId: string; wordingFixes: WordingFix[]; resumeText: string }[] = new Array(fixtures.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= fixtures.length) return;
      const f = fixtures[i];
      process.stdout.write(`  running: ${f.id}...\n`);
      const result = await analyzeResumeAgainstJob(f.resumeText, f.jobDescription, []);
      results[i] = { fixtureId: f.id, wordingFixes: result.wordingFixes, resumeText: f.resumeText };
      process.stdout.write(`  done: ${f.id} (${result.wordingFixes.length} wording fix(es))\n`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const assessments: WordingFixAssessment[] = [];
  for (const r of results) {
    for (const fix of r.wordingFixes) {
      assessments.push(assessWordingFix(r.fixtureId, fix, r.resumeText));
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("WRITING QUALITY — Category A (quick fix) tailored bullets");
  console.log("(separate dimension — not part of runEval.ts's pass/fail count)");
  console.log("=".repeat(70));

  for (const r of results) {
    if (r.wordingFixes.length === 0) {
      console.log(`\n${r.fixtureId}: no wordingFixes returned — nothing to assess`);
    }
  }

  if (assessments.length === 0) {
    console.log("\nNo wordingFixes were produced by any fixture in this run — nothing to report.");
    return;
  }

  let fabricationCount = 0;
  let cleanCraftCount = 0;
  let thinSourceCount = 0;

  for (const a of assessments) {
    const hasFabrication = a.fabrication.fabricatedNumbers.length > 0;
    if (hasFabrication) fabricationCount++;
    if (a.thinSource) thinSourceCount++;

    const craftFlags = [a.actionVerb, a.quantified, a.achievementOriented, a.tight].filter(
      (c) => c.verdict === "flag",
    ).length;
    const allCraftPass = craftFlags === 0;
    if (allCraftPass && !hasFabrication) cleanCraftCount++;

    const headerMark = hasFabrication ? "🚨" : allCraftPass ? "✓" : "⚠";
    console.log(`\n${headerMark} ${a.fixtureId} — requirement: "${a.fix.requirement}"`);
    console.log(`  currentLine:   "${a.fix.currentLine}"`);
    console.log(`  suggestedLine: "${a.fix.suggestedLine}"`);
    console.log(`  whyItHelps:    ${a.fix.whyItHelps}`);

    if (hasFabrication) {
      console.log(
        `  🚨 FABRICATION: number(s) in suggestedLine not found anywhere in the source resume: ${a.fabrication.fabricatedNumbers.join(", ")}`,
      );
    }
    if (a.fabrication.droppedNumbers.length > 0) {
      console.log(`  ⚠ dropped from currentLine: ${a.fabrication.droppedNumbers.join(", ")}`);
    }
    if (a.thinSource) {
      console.log(
        `  ℹ thinSource: true — no number or outcome-connector anywhere in this bullet's before/after; the source material may be too thin to strengthen further without inventing scope or impact`,
      );
    }

    console.log(`  [1] strong action verb:     ${a.actionVerb.verdict.toUpperCase()} — ${a.actionVerb.notes.join("; ")}`);
    console.log(`  [2] impact quantified:      ${a.quantified.verdict.toUpperCase()} — ${a.quantified.notes.join("; ")}`);
    console.log(
      `  [3] achievement-oriented:   ${a.achievementOriented.verdict.toUpperCase()} — ${a.achievementOriented.notes.join("; ")}`,
    );
    console.log(`  [4] tight / no filler:      ${a.tight.verdict.toUpperCase()} — ${a.tight.notes.join("; ")}`);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`${assessments.length} tailored bullet(s) assessed across ${results.length} fixtures`);
  console.log(`${cleanCraftCount}/${assessments.length} passed all 4 craft criteria with no fabrication`);
  console.log(`${thinSourceCount}/${assessments.length} flagged as thinSource (source material too thin to quantify without inventing something)`);
  if (fabricationCount > 0) {
    console.log(
      `\n🚨 ${fabricationCount}/${assessments.length} bullet(s) contain a number not traceable to the source resume — this is a correctness/honesty failure, not a craft nitpick. Investigate before any craft-focused prompt changes.`,
    );
  } else {
    console.log(`\nNo fabricated numbers detected across ${assessments.length} tailored bullet(s).`);
  }
  console.log("(automated checks are a first pass — read the raw lines above for the real judgment call)");
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Writing quality eval crashed:", err);
  process.exitCode = 1;
});
