/**
 * Scoring pipeline eval suite. Calls the real analyzeResumeAgainstJob
 * function directly (bypassing the HTTP route and its rate limiter, which
 * exists to protect the shared Gemini free-tier quota from public traffic,
 * not from our own dev testing) against a fixed set of hand-scored
 * fixtures, and reports pass/fail with a diff for anything that doesn't
 * match.
 *
 * Run: npm run eval
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { analyzeResumeAgainstJob, InvalidInputError } from "../src/lib/gemini";
import { loadFixtures, type LoadedFixture, type RequirementExpectation } from "./fixtures";
import type { AnalysisResult, RequirementCheck } from "../src/lib/types";

// Gemini free tier allows ~10 req/min. Each scored fixture can trigger more
// than one call to Gemini in flight (retries), so keep this well under the
// naive 10/concurrency math to leave headroom for the app's own retry logic.
const CONCURRENCY = 2;

interface CheckFailure {
  label: string;
  expected: string;
  actual: string;
}

interface FixtureResult {
  fixture: LoadedFixture;
  passed: boolean;
  failures: CheckFailure[];
  errorThrown?: string;
  raw?: AnalysisResult;
}

function findRequirement(
  checklist: RequirementCheck[],
  expectation: RequirementExpectation,
): RequirementCheck | undefined {
  return checklist.find((r) => expectation.match.test(r.requirement));
}

function evaluateFixture(fixture: LoadedFixture, result: AnalysisResult): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const score = result.originalScore;

  if (fixture.expectedScoreRange) {
    const [lo, hi] = fixture.expectedScoreRange;
    if (score.matchScore < lo || score.matchScore > hi) {
      failures.push({
        label: "originalScore.matchScore",
        expected: `between ${lo} and ${hi}`,
        actual: String(score.matchScore),
      });
    }
  }

  if (fixture.expectedWouldClearScreen !== undefined) {
    if (score.wouldClearTechnicalScreen !== fixture.expectedWouldClearScreen) {
      failures.push({
        label: "wouldClearTechnicalScreen",
        expected: String(fixture.expectedWouldClearScreen),
        actual: String(score.wouldClearTechnicalScreen),
      });
    }
  }

  if (fixture.expectedUnmetEssentialRange) {
    const [lo, hi] = fixture.expectedUnmetEssentialRange;
    if (score.unmetEssentialCount < lo || score.unmetEssentialCount > hi) {
      failures.push({
        label: "unmetEssentialCount",
        expected: `between ${lo} and ${hi}`,
        actual: String(score.unmetEssentialCount),
      });
    }
  }

  if (fixture.expectedMinFlags !== undefined) {
    if (result.flags.length < fixture.expectedMinFlags) {
      failures.push({
        label: "flags.length",
        expected: `>= ${fixture.expectedMinFlags}`,
        actual: String(result.flags.length),
      });
    }
  }

  for (const expectation of fixture.requirementExpectations ?? []) {
    const found = findRequirement(result.requirementsChecklist, expectation);
    if (!found) {
      failures.push({
        label: `requirement "${expectation.label}"`,
        expected: "present in requirementsChecklist",
        actual: "not found (no requirement text matched the expected pattern)",
      });
      continue;
    }
    if (found.type !== expectation.expectedType) {
      failures.push({
        label: `requirement "${expectation.label}" -> type`,
        expected: expectation.expectedType,
        actual: `${found.type} (matched requirement: "${found.requirement}")`,
      });
    }
    if (expectation.expectedStatus && found.status !== expectation.expectedStatus) {
      failures.push({
        label: `requirement "${expectation.label}" -> status`,
        expected: expectation.expectedStatus,
        actual: `${found.status} (evidence: "${found.evidence}")`,
      });
    }
    if (expectation.expectNonEmptyEvidence && found.evidence.trim().length === 0) {
      failures.push({
        label: `requirement "${expectation.label}" -> evidence`,
        expected: "non-empty (some evidence found)",
        actual: "empty",
      });
    }
  }

  return failures;
}

async function runOne(fixture: LoadedFixture): Promise<FixtureResult> {
  try {
    const result = await analyzeResumeAgainstJob(fixture.resumeText, fixture.jobDescription, []);

    if (fixture.expectInputError) {
      return {
        fixture,
        passed: false,
        failures: [
          {
            label: "expected rejection",
            expected: "InvalidInputError thrown",
            actual: "pipeline scored the input instead of rejecting it",
          },
        ],
        raw: result,
      };
    }

    const failures = evaluateFixture(fixture, result);
    return { fixture, passed: failures.length === 0, failures, raw: result };
  } catch (err) {
    if (err instanceof InvalidInputError) {
      if (fixture.expectInputError) {
        return { fixture, passed: true, failures: [] };
      }
      return {
        fixture,
        passed: false,
        failures: [
          {
            label: "unexpected rejection",
            expected: "a scored result",
            actual: `InvalidInputError: ${err.message}`,
          },
        ],
      };
    }
    return {
      fixture,
      passed: false,
      failures: [],
      errorThrown: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    };
  }
}

async function runWithConcurrency(fixtures: LoadedFixture[]): Promise<FixtureResult[]> {
  const results: FixtureResult[] = new Array(fixtures.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= fixtures.length) return;
      process.stdout.write(`  running: ${fixtures[i].id}...\n`);
      results[i] = await runOne(fixtures[i]);
      process.stdout.write(
        `  ${results[i].passed ? "PASS" : "FAIL"}: ${fixtures[i].id}\n`,
      );
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

async function main() {
  const fixtures = loadFixtures();
  console.log(`Running ${fixtures.length} eval fixtures (concurrency ${CONCURRENCY})...\n`);

  const start = Date.now();
  const results = await runWithConcurrency(fixtures);
  const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n${"=".repeat(70)}`);
  console.log(`RESULTS (${elapsedSec}s)`);
  console.log("=".repeat(70));

  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`\n✓ PASS  ${r.fixture.id}`);
    } else {
      console.log(`\n✗ FAIL  ${r.fixture.id}`);
      console.log(`  ${r.fixture.description}`);
      if (r.errorThrown) {
        console.log(`  Unexpected error: ${r.errorThrown}`);
      }
      for (const f of r.failures) {
        console.log(`  - ${f.label}`);
        console.log(`      expected: ${f.expected}`);
        console.log(`      actual:   ${f.actual}`);
      }
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`${passCount}/${results.length} fixtures passed`);
  console.log("=".repeat(70));

  if (passCount < results.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Eval suite crashed:", err);
  process.exitCode = 1;
});
