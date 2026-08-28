/**
 * Length-trim eval — a fifth quality dimension, testing the page-length
 * feature (src/lib/lengthTrim.ts) specifically: given a resume dense
 * enough that fitting it to 1 page genuinely requires cutting content,
 * does the trim mechanism behave exactly as required?
 *
 *   (a) the cut list is accurate — everything it claims was removed
 *       really was removed from the trimmed resume, verbatim;
 *   (b) nothing gets dropped without appearing in that list — every
 *       bullet present in the original but missing from the trimmed
 *       resume has a matching cuts entry, with no unexplained gaps;
 *   (c) every bullet that DOES survive is byte-identical to the
 *       original (the model ranks, it never rewrites);
 *   (d) no experience entry is left with zero bullets under its header;
 *   (e) all three export formats (txt/docx/pdf) consume the exact same
 *       trimmed resume — txt is checked directly (it's a pure text
 *       render with no formatting step to diverge), and docx/pdf are
 *       confirmed to render that identical object successfully without
 *       throwing. Per the design (buildResumeDocx.ts/buildResumePdf.ts
 *       have no content-selection logic of their own — reused as-is,
 *       formatting-only), the only way these three could actually
 *       diverge is a wiring bug passing them different resume objects,
 *       which this eval's shared `trimmed` variable across all three
 *       calls rules out by construction; it is not verifying the
 *       renderers' typographic output pixel-for-pixel.
 *
 * Uses the real pipeline (a live analyzeResumeAgainstJob call to get a
 * genuine tailored resume, then a live trimResumeToLength call) — this
 * is opt-in like eval:ambition, not part of the default `npm run eval`.
 *
 * Run: npm run eval:length-trim
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeResumeAgainstJob } from "../src/lib/gemini";
import { trimResumeToLength } from "../src/lib/lengthTrim";
import { resumeToPlainText } from "../src/lib/resumeText";
import { buildResumeDocxBuffer } from "../src/lib/buildResumeDocx";
import { buildResumePdfBuffer } from "../src/lib/buildResumePdf";
import type { LengthCut, TailoredResume } from "../src/lib/types";

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", name), "utf-8").trim();
}

function bulletDisplay(label: string, text: string): string {
  return label ? `"${label}: ${text}"` : `"${text}"`;
}

interface FlatBullet {
  section: string;
  display: string;
}

function flattenBullets(resume: TailoredResume): FlatBullet[] {
  const out: FlatBullet[] = [];
  for (const b of resume.coreStrengths) {
    out.push({ section: "Core Strengths", display: bulletDisplay(b.label, b.text) });
  }
  for (const job of resume.experience) {
    const jobLabel = [job.title, job.company].filter(Boolean).join(" · ") || job.title;
    for (const b of job.bullets) {
      out.push({ section: jobLabel, display: bulletDisplay(b.label, b.text) });
    }
  }
  return out;
}

async function main() {
  console.log("Running length-trim eval (live pipeline: real tailoring call + real trim call)...\n");
  const notes: string[] = [];

  const resumeText = loadFixture("anirudh-mel-resume.txt");
  const jobDescription = loadFixture("un-sdg-fund-jd.txt");

  console.log("  generating a real tailored resume...");
  const analysis = await analyzeResumeAgainstJob(resumeText, jobDescription, []);
  const original = analysis.tailoredResume;
  const originalBullets = flattenBullets(original);
  console.log(
    `  tailored resume: ${original.coreStrengths.length} core strengths, ${original.experience.length} experience entries, ${originalBullets.length} total bullets`,
  );

  console.log("  trimming to 1-page target...");
  const { trimmedResume, cuts } = await trimResumeToLength(original, jobDescription, "1-page");
  const trimmedBullets = flattenBullets(trimmedResume);
  console.log(`  trimmed resume: ${trimmedBullets.length} total bullets, ${cuts.length} cut(s) reported`);
  for (const cut of cuts) {
    console.log(`    cut [${cut.section}] ${cut.description} — ${cut.reason}`);
  }

  // Precondition: this fixture is only useful if trimming was actually
  // forced. If the model's own tailoring came back short enough to
  // already fit under budget, this fixture has stopped being a valid
  // "1-page trimming is forced" case and needs a denser resume/JD pair.
  if (cuts.length === 0) {
    notes.push(
      "No cuts were made — this fixture no longer forces 1-page trimming (tailored output came back too short). Needs a denser resume/JD pair to remain a valid test of forced trimming.",
    );
  }

  // (a) + (b): exact correspondence between "what's missing from trimmed"
  // and "what cuts claims was removed" — checked in both directions.
  const originalDisplaySet = new Set(originalBullets.map((b) => b.display));
  const trimmedDisplaySet = new Set(trimmedBullets.map((b) => b.display));
  const missingFromTrimmed = originalBullets.filter((b) => !trimmedDisplaySet.has(b.display));
  const cutDescriptions = new Set(cuts.map((c: LengthCut) => c.description));

  for (const missing of missingFromTrimmed) {
    if (!cutDescriptions.has(missing.display)) {
      notes.push(`Bullet missing from trimmed resume with NO corresponding cuts entry: ${missing.display}`);
    }
  }
  for (const cut of cuts) {
    if (!originalDisplaySet.has(cut.description)) {
      notes.push(`Cuts entry doesn't match any bullet that existed in the original resume: ${cut.description}`);
    }
    if (trimmedDisplaySet.has(cut.description)) {
      notes.push(`Cuts entry claims removal, but the bullet is still present in the trimmed resume: ${cut.description}`);
    }
  }
  if (missingFromTrimmed.length !== cuts.length) {
    notes.push(
      `Cuts count (${cuts.length}) doesn't match the number of bullets actually missing from the trimmed resume (${missingFromTrimmed.length}).`,
    );
  }

  // (c): every surviving bullet is byte-identical to some original bullet
  // (the model ranks by index, it never re-emits/rewords text).
  for (const survivor of trimmedBullets) {
    if (!originalDisplaySet.has(survivor.display)) {
      notes.push(`Surviving bullet doesn't match any original bullet verbatim (possible reword): ${survivor.display}`);
    }
  }

  // (d): no experience entry left with zero bullets under its header.
  for (let i = 0; i < trimmedResume.experience.length; i++) {
    const job = trimmedResume.experience[i];
    const originalJob = original.experience[i];
    if (originalJob.bullets.length > 0 && job.bullets.length === 0) {
      notes.push(`Experience entry "${job.title}" was left with zero bullets — floor protection failed.`);
    }
  }

  // (e): all three export formats consume the identical trimmed resume.
  const plainText = resumeToPlainText(trimmedResume);
  for (const survivor of trimmedBullets) {
    if (!plainText.includes(survivor.display.slice(1, -1))) {
      notes.push(`.txt export is missing a surviving bullet's text: ${survivor.display}`);
    }
  }
  for (const cut of cuts) {
    if (plainText.includes(cut.description.slice(1, -1))) {
      notes.push(`.txt export still contains a bullet that should have been cut: ${cut.description}`);
    }
  }
  try {
    const docxBuffer = await buildResumeDocxBuffer(trimmedResume);
    const pdfBuffer = await buildResumePdfBuffer(trimmedResume);
    if (docxBuffer.length === 0) notes.push(".docx export of the trimmed resume produced an empty buffer.");
    if (pdfBuffer.length === 0) notes.push(".pdf export of the trimmed resume produced an empty buffer.");
    console.log(`  .docx export: ${docxBuffer.length} bytes, .pdf export: ${pdfBuffer.length} bytes`);
  } catch (err) {
    notes.push(`docx/pdf export of the trimmed resume threw: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("RESULTS");
  console.log("=".repeat(70));
  if (notes.length === 0) {
    console.log("\n✓ PASS  length-trim-forced-1-page");
  } else {
    console.log("\n✗ FAIL  length-trim-forced-1-page");
    for (const n of notes) console.log(`  - ${n}`);
    process.exitCode = 1;
  }
  console.log(`\n${"=".repeat(70)}`);
}

main().catch((err) => {
  console.error("Length-trim eval crashed:", err);
  process.exitCode = 1;
});
