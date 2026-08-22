/**
 * Traceability eval — a fourth quality dimension, separate from
 * runEval.ts's classification checks, runSuggestionQualityEval.ts's
 * Category B suggestion quality, and runWritingQualityEval.ts's Category A
 * writing craft. This one tests the traceability self-check
 * (src/lib/traceabilityCheck.ts, CLAUDE.md "Traceability check" rule)
 * itself: does the FINAL tailored output — after both the main tailoring
 * pass and the traceability check's corrections — actually stay within
 * what the source resume supports, on cases specifically engineered to
 * create real pressure to overstate (a JD requirement with only
 * weak/adjacent evidence in the resume)?
 *
 * This deliberately checks the end state, not just whether
 * traceabilityIssues is non-empty — a clean pass with zero issues found is
 * just as good a result as one with issues that got correctly rewritten,
 * since the goal is a safe final output either way. What would be a real
 * failure: the JD's required term showing up as a claimed skill in the
 * tailored resume/cover letter when the source resume only has an adjacent,
 * non-equivalent skill — whether that slipped through the main pass AND
 * the traceability check, or the check flagged it but a bug still left it
 * uncorrected in the returned text.
 *
 * Run: npm run eval:traceability
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeResumeAgainstJob } from "../src/lib/gemini";
import type { AnalysisResult } from "../src/lib/types";

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf-8").trim();
}

interface OverstatementCase {
  id: string;
  description: string;
  jdFile: string;
  resumeFile: string;
  /** Terms the JD requires that the source resume does NOT actually support — must never appear as a claimed skill in the tailored output. */
  forbiddenClaims: RegExp[];
}

const CASES: OverstatementCase[] = [
  {
    id: "excel-vba-vs-python-sql",
    description:
      "JD requires hands-on Python (report automation) and SQL (ad-hoc queries). Resume has real automation experience, but with Excel VBA/macros, not Python — and no SQL evidence at all. Real pressure to overstate: VBA automation and Python automation solve the same underlying problem, so a tailoring pass optimizing for JD alignment could plausibly blur the two. Per CLAUDE.md: 'Excel VBA' does NOT satisfy 'Python/SQL', full stop.",
    jdFile: "python-sql-jd.txt",
    resumeFile: "anirudh-analytics-resume.txt",
    forbiddenClaims: [/\bpython\b/i, /\bsql\b/i],
  },
];

// A forbidden term appearing in a sentence is only a real overstatement if
// that sentence claims possession — a sentence honestly acknowledging the
// gap ("eager to develop my Python skills," "interested in learning SQL")
// mentions the same word without claiming it, and must not be flagged.
const GAP_ACKNOWLEDGMENT_CUES: RegExp[] = [
  /eager to (develop|learn|build|gain|grow)/i,
  /(look(ing)? forward to|hope to|would like to|want to|willing to|excited to) (develop|learn|build|gain)/i,
  /further develop/i,
  /do(?:n'?t| not) (?:currently |yet )?have/i,
  /don'?t yet/i,
  /interested in (developing|learning|gaining|building)/i,
  /to meet the (specific )?(technical )?requirements/i,
  /(gap|room) (to grow|for growth)/i,
];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** True only if `term` appears in `text` inside a sentence that isn't hedged as an acknowledged gap. */
function containsUnhedgedClaim(text: string, term: RegExp): { hit: boolean; sentence: string } {
  for (const sentence of splitSentences(text)) {
    if (term.test(sentence) && !GAP_ACKNOWLEDGMENT_CUES.some((cue) => cue.test(sentence))) {
      return { hit: true, sentence: sentence.trim() };
    }
  }
  return { hit: false, sentence: "" };
}

function allTailoredText(result: AnalysisResult): { field: string; text: string }[] {
  const r = result.tailoredResume;
  return [
    { field: "profile", text: r.profile },
    { field: "objective", text: r.objective },
    ...r.coreStrengths.map((b, i) => ({ field: `coreStrengths[${i}]`, text: `${b.label} ${b.text}` })),
    ...r.experience.flatMap((job, ji) =>
      job.bullets.map((b, bi) => ({
        field: `experience[${ji}].bullets[${bi}]`,
        text: `${b.label} ${b.text}`,
      })),
    ),
    { field: "coverLetter", text: result.coverLetter },
  ];
}

interface CaseResult {
  id: string;
  passed: boolean;
  notes: string[];
}

async function runCase(c: OverstatementCase): Promise<CaseResult> {
  const notes: string[] = [];
  const jobDescription = loadFixture(c.jdFile);
  const resumeText = loadFixture(c.resumeFile);

  const result = await analyzeResumeAgainstJob(resumeText, jobDescription, []);

  const fields = allTailoredText(result);
  for (const forbidden of c.forbiddenClaims) {
    for (const { field, text } of fields) {
      const { hit, sentence } = containsUnhedgedClaim(text, forbidden);
      if (hit) {
        notes.push(`Unsupported claim slipped through into ${field}: "${sentence}"`);
      }
    }
  }

  console.log(
    `  [${c.id}] matchScore=${result.tailoredScore.matchScore}, traceabilityIssues=${result.traceabilityIssues.length}, wordingFixes=${result.wordingFixes.length}, skillGaps=${result.skillGaps.length}`,
  );
  for (const issue of result.traceabilityIssues) {
    console.log(`  [${c.id}]   issue: [${issue.section}/${issue.resolution}] "${issue.claim}" — ${issue.issue}`);
  }

  return { id: c.id, passed: notes.length === 0, notes };
}

async function main() {
  console.log(`Running ${CASES.length} traceability case(s) (live pipeline, including the traceability check pass)...\n`);

  const results: CaseResult[] = [];
  for (const c of CASES) {
    try {
      results.push(await runCase(c));
    } catch (err) {
      results.push({
        id: c.id,
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
  console.error("Traceability eval crashed:", err);
  process.exitCode = 1;
});
