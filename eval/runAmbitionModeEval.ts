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

async function main() {
  console.log("Running Ambition Mode eval (2 cases, live Search Grounding + scoring calls)...\n");

  const cases = [runFindableRoleCase, runObscureRoleCase];
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
