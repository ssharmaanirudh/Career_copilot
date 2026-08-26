/**
 * Ambition Mode eval suite (AMBITION-MODE.md). Calls the real
 * runAmbitionMode function directly (bypassing the HTTP route/rate
 * limiter) against two real-world cases:
 *   1. A common, findable role -> expects >=3 real postings retrieved,
 *      a non-empty composite checklist, and a score.
 *   2. A deliberately obscure/niche role -> expects the exact fallback
 *      message from AMBITION-MODE.md, not a synthesized checklist.
 *
 * This makes real Search Grounding + scoring calls (billed), so it's a
 * separate opt-in script rather than part of the main `npm run eval`.
 *
 * Run: npm run eval:ambition
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runAmbitionMode, FALLBACK_MESSAGE } from "../src/lib/ambitionMode";

// ambitionMode.ts's own buildResourceUrl() is the only thing allowed to
// produce this field — the model itself only ever supplies a search term,
// never a URL — so any resourceUrl that doesn't match this exact pattern
// means a raw/model-produced or otherwise fabricated-looking URL slipped
// through. Same check as runSuggestionQualityEval.ts's assessResourceLink,
// applied here since ambitionMode.ts has its own structurally independent
// skillGap-generation path (not covered by that suite).
const SAFE_RESOURCE_URL_PATTERN = /^https:\/\/www\.coursera\.org\/search\?query=[^\s]+$/;

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf-8").trim();
}

interface CaseResult {
  id: string;
  passed: boolean;
  notes: string[];
}

async function runFindableRoleCase(): Promise<CaseResult> {
  const id = "findable-role-composite-checklist";
  const notes: string[] = [];
  const resumeText = loadFixture("anirudh-analytics-resume.txt");

  const result = await runAmbitionMode(resumeText, "Data Analyst", "mid", "");

  if (result.insufficientData) {
    return {
      id,
      passed: false,
      notes: [
        `Expected >=3 postings for a common role, got fallback: "${result.message}" (postingsFound=${result.postingsFound})`,
      ],
    };
  }

  if (result.postings.length < 3) {
    notes.push(`Expected >=3 postings, got ${result.postings.length}`);
  }
  if (result.requirementsChecklist.length === 0) {
    notes.push("Expected a non-empty composite requirements checklist, got 0 items");
  }
  for (const item of result.requirementsChecklist) {
    if (item.sourceTotal !== result.postings.length) {
      notes.push(
        `Requirement "${item.requirement}" has sourceTotal=${item.sourceTotal}, expected ${result.postings.length}`,
      );
    }
    if (item.sourceCount < 1 || item.sourceCount > item.sourceTotal) {
      notes.push(
        `Requirement "${item.requirement}" has out-of-range sourceCount=${item.sourceCount}/${item.sourceTotal}`,
      );
    }
  }
  const coreCount = result.requirementsChecklist.filter((r) => r.isCoreRequirement).length;
  if (coreCount > 1) {
    notes.push(`Expected at most 1 isCoreRequirement, got ${coreCount}`);
  }
  if (!result.score.summary) {
    notes.push("Expected a non-empty score summary");
  }
  if (/would not clear a screen/i.test(result.score.summary)) {
    notes.push(
      "Score summary uses sharp single-JD phrasing ('would not clear a screen') instead of softer composite language",
    );
  }
  for (const gap of result.skillGaps) {
    const url = gap.resourceUrl.trim();
    if (url.length > 0 && !SAFE_RESOURCE_URL_PATTERN.test(url)) {
      notes.push(
        `skillGap "${gap.skill}" has a resourceUrl that doesn't match the verified search-pattern URL — looks like a fabricated/specific link: ${url}`,
      );
    }
  }

  console.log(`  [${id}] postings=${result.postings.length}, sources=${result.sources.length}, ` +
    `checklist=${result.requirementsChecklist.length}, score=${result.score.matchScore}, ` +
    `wordingFixes=${result.wordingFixes.length}, skillGaps=${result.skillGaps.length}`);
  console.log(`  [${id}] summary: "${result.score.summary}"`);

  return { id, passed: notes.length === 0, notes };
}

async function runObscureRoleCase(): Promise<CaseResult> {
  const id = "obscure-role-fallback";
  const notes: string[] = [];
  const resumeText = loadFixture("anirudh-analytics-resume.txt");

  // A deliberately absurd/hyper-niche title unlikely to have 3+ real,
  // currently active postings anywhere.
  const result = await runAmbitionMode(
    resumeText,
    "Left-Handed Antique Sundial Calibration Technician",
    "",
    "",
  );

  console.log(
    `  [${id}] insufficientData=${result.insufficientData}` +
      (result.insufficientData ? `, postingsFound=${result.postingsFound}` : ""),
  );

  if (!result.insufficientData) {
    notes.push(
      `Expected fallback for an obscure role, got a scored result with ${result.postings.length} postings instead`,
    );
    return { id, passed: false, notes };
  }

  if (result.message !== FALLBACK_MESSAGE) {
    notes.push(
      `Fallback message doesn't match AMBITION-MODE.md's exact wording.\n      expected: "${FALLBACK_MESSAGE}"\n      actual:   "${result.message}"`,
    );
  }
  if (result.postingsFound >= 3) {
    notes.push(`Expected postingsFound < 3, got ${result.postingsFound}`);
  }

  return { id, passed: notes.length === 0, notes };
}

// The exact real bug reported: a "Project Manager" search against a
// public-health/programme-management resume pulled real, legitimate
// postings from a completely unrelated field (a university campus
// construction-liaison role requiring a state driver's license) because
// retrieval searched the bare title with no connection to the resume's
// actual domain. These marker terms are stand-ins for "obviously a
// different, unrelated field" — a title-only search commonly surfaces
// construction/facilities-management postings for "Project Manager", none
// of which share any real overlap with programme M&E/public-health work.
const UNRELATED_FIELD_MARKERS =
  /driver'?s?\s+license|construction|campus\s+(facilities|liaison)|general\s+contractor|hvac|osha\b/i;

async function runDomainAwareRetrievalCase(): Promise<CaseResult> {
  const id = "domain-aware-retrieval-project-manager";
  const notes: string[] = [];
  const resumeText = loadFixture("anirudh-mel-resume.txt");

  const result = await runAmbitionMode(resumeText, "Project Manager", "", "");

  if (result.insufficientData) {
    // An acceptable outcome per AMBITION-MODE.md step 6 (fewer than 3
    // genuinely relevant postings after filtering -> fallback rather than
    // padding with irrelevant ones) — not itself a failure, but log it so
    // a human can confirm it's a real "not enough relevant postings"
    // outcome rather than a retrieval/filter bug silently returning zero.
    console.log(
      `  [${id}] insufficientData=true, postingsFound=${result.postingsFound} (acceptable per AMBITION-MODE.md step 6 if filtering genuinely found <3 relevant postings)`,
    );
    return { id, passed: true, notes: [] };
  }

  console.log(
    `  [${id}] inferredDomain="${result.inferredDomain}", postings=${result.postings.length}, ` +
      `score=${result.score.matchScore}`,
  );
  for (const p of result.postings) {
    console.log(`  [${id}]   posting: "${p.title}"${p.company ? ` at ${p.company}` : ""}`);
  }

  if (!result.inferredDomain) {
    notes.push(
      `Expected a non-empty inferredDomain for a generic title like "Project Manager" against a public-health/programme-management resume, got empty string`,
    );
  }

  for (const p of result.postings) {
    const haystack = `${p.title} ${p.company}`;
    if (UNRELATED_FIELD_MARKERS.test(haystack)) {
      notes.push(
        `Posting "${p.title}"${p.company ? ` at ${p.company}` : ""} looks like it's from an unrelated field (construction/facilities) — should have been excluded by the relevance filter`,
      );
    }
  }

  return { id, passed: notes.length === 0, notes };
}

async function main() {
  console.log("Running Ambition Mode eval (3 cases, live Search Grounding + scoring calls)...\n");

  const cases = [runFindableRoleCase, runObscureRoleCase, runDomainAwareRetrievalCase];
  const results: CaseResult[] = [];
  for (const runCase of cases) {
    try {
      results.push(await runCase());
    } catch (err) {
      results.push({
        id: runCase.name,
        passed: false,
        notes: [err instanceof Error ? `${err.name}: ${err.message}` : String(err)],
      });
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("RESULTS");
  console.log("=".repeat(70));
  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`\n✓ PASS  ${r.id}`);
    } else {
      console.log(`\n✗ FAIL  ${r.id}`);
      for (const n of r.notes) console.log(`  - ${n}`);
    }
  }
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${passCount}/${results.length} cases passed`);
  console.log("=".repeat(70));

  if (passCount < results.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Ambition Mode eval crashed:", err);
  process.exitCode = 1;
});
