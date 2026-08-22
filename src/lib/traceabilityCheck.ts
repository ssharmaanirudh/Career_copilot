import { type Schema, Type } from "@google/genai";
import { MODEL, AnalysisError, generateStructuredJson } from "./geminiClient";
import { str } from "./normalize";
import type {
  ResumeBullet,
  ResumeExperienceEntry,
  TailoredResume,
  TraceabilityIssue,
  TraceabilityResolution,
  TraceabilitySection,
} from "./types";

/**
 * Traceability self-check (CLAUDE.md "Traceability check" rule): a
 * structurally independent Gemini call, run automatically after every
 * tailoring pass, that fact-checks the tailored resume/cover letter against
 * the original source resume — never woven into gemini.ts's own SYSTEM_PROMPT.
 * That prompt's own comments document, twice confirmed, that editing it
 * anywhere destabilizes unrelated earlier steps; this follows the same
 * separate-call pattern actionPlan.ts already uses instead of risking that.
 * A same-call "self-check" would also just be the model grading its own
 * output mid-generation, with no real re-reading step — a fresh adversarial
 * pass on already-finished text is the more reliable check.
 */
const SYSTEM_PROMPT = `You are a strict fact-checker. You are given a candidate's REAL, ORIGINAL resume (plus any candidate notes, which the candidate typed themselves and count as real background) and a TAILORED resume/cover letter that a different process rewrote from it for a specific job. Your only job: verify every specific claim in the tailored text is honestly traceable to the source.

THE TEST — apply it to every specific claim ABOUT THE CANDIDATE (a named tool, skill, technique, metric, scope, or outcome) in the tailored profile, objective, coreStrengths, experience bullets, and cover letter:

"Can this exact claim be traced back to something already true in the source resume or candidate notes, even if reworded? If the wording changed but the underlying fact is the same — that's fine. If the claim states something that isn't actually supported by the source text — that's not fine, even if it would make the resume a better match for the job."

OUT OF SCOPE — do NOT flag these, ever: the objective and cover letter are SUPPOSED to be rewritten to address this specific job and company, every single time, even when the source resume's own objective (if it had one) was written for a completely different role or company. A tailored objective/cover letter naming THIS job's title or company, or expressing interest in THIS role, is never itself an unsupported claim — it's the entire point of tailoring. Only flag something in the objective or cover letter if it makes a false claim about the CANDIDATE's own skills, experience, or background, exactly the same test as everywhere else — never for simply being addressed to a different role/company than whatever the source resume happened to target.

Common failure patterns to watch for specifically:
- A tool/skill the source shows only an ADJACENT or ANALOGOUS version of, now stated as if it were the exact thing (e.g. source shows "Excel VBA" and the tailored text now says or implies "Python"; source shows "used ChatGPT for reporting" and the tailored text now implies the candidate "fine-tunes LLMs" or "builds ML models").
- A metric, scope, or outcome that got bigger, more specific, or more impressive than what the source actually states (a headcount, a dollar figure, a percentage, a dataset size, a team size).
- A duty or scope described as if the candidate owned/led it, when the source only shows they supported or contributed to it.
- Vague source language ("familiar with X", "exposure to Y") restated as hands-on, production, or expert-level use of X/Y.

For each specific claim, decide:
- TRACEABLE: skip it — do not report it as an issue. Most claims will be traceable; only report real problems, not a full audit trail of every clean line.
- NOT TRACEABLE: this is an issue. Decide:
  - If you can rewrite it to state only what the source actually supports, without inventing anything new, do so and report resolution "rewritten".
  - If removing the unsupported part would leave nothing honest to say and you cannot safely rewrite it without more information from the candidate, leave the original tailored text for that section unchanged in your output and report resolution "flagged" instead — never silently delete it and never silently leave it either; the flag itself is what tells the app to warn the user.

For every section (profile, objective, coreStrengths, experience, coverLetter), return the FINAL text for that section: your corrected version wherever you found and fixed an issue in it, or the exact original tailored text unchanged wherever you found nothing wrong (or found something wrong but had to flag it instead of rewriting it). Never paraphrase or "improve" a section that had no traceability issue — only touch what you are actually correcting.

Respond only with the requested JSON, matching the schema exactly.`;

const BULLET_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    label: { type: Type.STRING },
    text: { type: Type.STRING },
  },
  required: ["label", "text"],
};

const EXPERIENCE_ENTRY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    location: { type: Type.STRING },
    dates: { type: Type.STRING },
    bullets: { type: Type.ARRAY, items: BULLET_SCHEMA },
  },
  required: ["title", "company", "location", "dates", "bullets"],
};

const ISSUE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    section: {
      type: Type.STRING,
      enum: ["profile", "objective", "coreStrengths", "experience", "coverLetter"],
    },
    claim: { type: Type.STRING, description: "The specific overstated phrase, quoted from the tailored text." },
    issue: { type: Type.STRING, description: "One sentence: why this isn't traceable to the source." },
    resolution: { type: Type.STRING, enum: ["rewritten", "flagged"] },
  },
  required: ["section", "claim", "issue", "resolution"],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    issues: { type: Type.ARRAY, items: ISSUE_SCHEMA },
    finalProfile: { type: Type.STRING },
    finalObjective: { type: Type.STRING },
    finalCoreStrengths: { type: Type.ARRAY, items: BULLET_SCHEMA },
    finalExperience: { type: Type.ARRAY, items: EXPERIENCE_ENTRY_SCHEMA },
    finalCoverLetter: { type: Type.STRING },
  },
  required: [
    "issues",
    "finalProfile",
    "finalObjective",
    "finalCoreStrengths",
    "finalExperience",
    "finalCoverLetter",
  ],
};

function normalizeBullet(raw: unknown): ResumeBullet {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return { label: str(obj.label), text: str(obj.text) };
}

function normalizeExperienceEntry(raw: unknown): ResumeExperienceEntry {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const bullets = Array.isArray(obj.bullets) ? obj.bullets.map(normalizeBullet) : [];
  return {
    title: str(obj.title),
    company: str(obj.company),
    location: str(obj.location),
    dates: str(obj.dates),
    bullets,
  };
}

function normalizeIssue(raw: unknown): TraceabilityIssue | null {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const section = obj.section;
  const validSections: TraceabilitySection[] = [
    "profile",
    "objective",
    "coreStrengths",
    "experience",
    "coverLetter",
  ];
  if (typeof section !== "string" || !validSections.includes(section as TraceabilitySection)) {
    return null;
  }
  const resolution: TraceabilityResolution = obj.resolution === "flagged" ? "flagged" : "rewritten";
  return {
    section: section as TraceabilitySection,
    claim: str(obj.claim),
    issue: str(obj.issue),
    resolution,
  };
}

export interface TraceabilityCheckOutcome {
  issues: TraceabilityIssue[];
  correctedResume: TailoredResume;
  correctedCoverLetter: string;
}

/**
 * Runs the traceability check and applies its corrections section-by-section:
 * a section is only replaced with the check's "final" version if at least one
 * issue was actually reported against that section — everything else keeps
 * the original tailoredResume/coverLetter untouched, so a clean pass can
 * never introduce unrequested drift into content that had nothing wrong
 * with it.
 */
export async function runTraceabilityCheck(
  sourceResumeText: string,
  candidateNotes: string[],
  tailoredResume: TailoredResume,
  coverLetter: string,
): Promise<TraceabilityCheckOutcome> {
  const notesSection =
    candidateNotes.length > 0
      ? `\n\nCANDIDATE NOTES (typed by the candidate themselves — count as real background, same as the resume):\n"""\n${candidateNotes
          .map((n, i) => `${i + 1}. ${n}`)
          .join("\n")}\n"""`
      : "";

  const tailoredForCheck = {
    profile: tailoredResume.profile,
    objective: tailoredResume.objective,
    coreStrengths: tailoredResume.coreStrengths,
    experience: tailoredResume.experience,
    coverLetter,
  };

  const userMessage = `ORIGINAL SOURCE RESUME:\n"""\n${sourceResumeText}\n"""${notesSection}\n\nTAILORED RESUME + COVER LETTER TO CHECK:\n"""\n${JSON.stringify(tailoredForCheck, null, 2)}\n"""`;

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
    throw new AnalysisError("The traceability check response wasn't valid JSON. Please try again.");
  }

  const obj = parsed as Record<string, unknown>;
  const rawIssues = Array.isArray(obj.issues) ? obj.issues : [];
  const issues = rawIssues.map(normalizeIssue).filter((i): i is TraceabilityIssue => i !== null);

  const touchedSections = new Set(issues.map((i) => i.section));

  const finalCoreStrengths = Array.isArray(obj.finalCoreStrengths)
    ? obj.finalCoreStrengths.map(normalizeBullet)
    : tailoredResume.coreStrengths;
  const finalExperience = Array.isArray(obj.finalExperience)
    ? obj.finalExperience.map(normalizeExperienceEntry)
    : tailoredResume.experience;

  const correctedResume: TailoredResume = {
    ...tailoredResume,
    profile: touchedSections.has("profile") ? str(obj.finalProfile) || tailoredResume.profile : tailoredResume.profile,
    objective: touchedSections.has("objective")
      ? str(obj.finalObjective) || tailoredResume.objective
      : tailoredResume.objective,
    coreStrengths: touchedSections.has("coreStrengths") ? finalCoreStrengths : tailoredResume.coreStrengths,
    experience: touchedSections.has("experience") ? finalExperience : tailoredResume.experience,
  };

  const correctedCoverLetter = touchedSections.has("coverLetter")
    ? str(obj.finalCoverLetter) || coverLetter
    : coverLetter;

  return { issues, correctedResume, correctedCoverLetter };
}
