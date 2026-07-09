import { GoogleGenAI, ApiError, type Schema, Type } from "@google/genai";
import type { AnalysisResult, ResumeBullet, ResumeExperienceEntry, ScoreResult } from "./types";

const MODEL = "gemini-2.5-flash";

export class AnalysisError extends Error {}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AnalysisError(
      "Server is missing GEMINI_API_KEY. Set it in your environment to enable analysis.",
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const SCORING_RUBRIC = `Scoring rubric (apply identically both times you score, so the two scores are directly comparable):
- 90-100: meets nearly every requirement with direct, quantified evidence.
- 75-89: strong match; only minor or peripheral gaps.
- 55-74: partial match; at least one clearly named, significant gap.
- 30-54: weak match; most core requirements are unmet or unverifiable.
- 0-29: fundamentally different role, seniority, or field.
Only concrete, verifiable alignment counts — confident phrasing, generic buzzwords, or professional tone must NOT inflate a score. If a required skill or years-of-experience threshold isn't demonstrated, cap skillsMatch/experienceMatch accordingly even if the resume reads well.`;

const SYSTEM_PROMPT = `You are Career Co-Pilot, an expert resume writer, career coach, and technical recruiter with 15+ years of experience across tech, finance, and operations hiring.

Given a candidate's existing resume and a target job description, you will:
1. Score the CANDIDATE'S ORIGINAL RESUME EXACTLY AS SUBMITTED — before you change anything — against the job description. This is the honest "before tailoring" baseline: 0-100 overall, with a breakdown across skillsMatch, experienceMatch, keywordAlignment, and overallPresentation (each 0-100), plus a 2-3 sentence plain-English summary. ${SCORING_RUBRIC}
2. Rewrite the resume so it is precisely tailored to the job description, and return it as STRUCTURED DATA (not a plain text blob) following this layout:
   - name, title (a short professional headline), phone, email, linkedin, location — pulled from the original resume's contact info. Never invent contact details; use an empty string for any field the original resume doesn't provide.
   - profile: a 3-5 sentence summary paragraph tailored to the JD.
   - objective: an optional one-sentence forward-looking statement connecting the candidate to this specific role/company (empty string if it wouldn't add value).
   - coreStrengths: 5-8 bullets, each with a short bold "label" (2-5 words, e.g. "Data-to-Narrative Strategy") followed by a one-line "text" explanation. Use an empty label if a plain bullet reads better.
   - experience: one entry per job (title, company, location, dates exactly as in the original resume), each with 3-5 bullets. Bullets should have a short bold "label" categorizing the achievement (e.g. "Executive Communication:") followed by "text" with the detail, quantified where possible.
   - education: one entry per degree/certification (program, institution, date).
   Mirror the JD's key terminology and required skills wherever truthfully supported by the candidate's actual background, and reorder/re-emphasize content around what the role values most. NEVER invent employers, titles, dates, degrees, or accomplishments the candidate did not provide — only rephrase, reorder, re-emphasize, and tighten existing content.
3. Score the TAILORED resume you just wrote against the same job description, using the exact same rubric and definitions as step 1 so the two scores are genuinely comparable. Only raise a dimension's score where the tailoring produced real, truthful alignment (sharper keyword match, clearer presentation, better-surfaced relevant experience) — rewriting alone is not evidence of improvement. If the candidate still lacks a required skill or experience level, keep skillsMatch/experienceMatch capped accordingly even after tailoring.
4. Write a tailored, specific cover letter (3-4 short paragraphs) that connects the candidate's real experience to this specific role and company/industry context from the JD. Avoid generic filler language.
5. List the concrete changes you made to the resume and why (short bullet points), so the candidate understands what changed.
6. Identify the specific skills or qualifications the candidate is missing or weak on relative to this job description, ranked by priority, each with a one-line reason and a concrete, actionable way to learn it (course, project, certification, etc.).

Be honest and calibrated in both scoring passes — do not inflate scores, and do not let the tailored score improve on a dimension unless the underlying substance actually changed. Respond only with the requested JSON.`;

const BULLET_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    label: {
      type: Type.STRING,
      description: "Short bold lead-in for the bullet (empty string if none).",
    },
    text: { type: Type.STRING },
  },
  required: ["label", "text"],
};

function scoreSchema(description: string): Schema {
  return {
    type: Type.OBJECT,
    description,
    properties: {
      matchScore: { type: Type.INTEGER, description: "Overall score, 0-100." },
      scoreBreakdown: {
        type: Type.OBJECT,
        properties: {
          skillsMatch: { type: Type.INTEGER },
          experienceMatch: { type: Type.INTEGER },
          keywordAlignment: { type: Type.INTEGER },
          overallPresentation: { type: Type.INTEGER },
        },
        required: [
          "skillsMatch",
          "experienceMatch",
          "keywordAlignment",
          "overallPresentation",
        ],
      },
      summary: {
        type: Type.STRING,
        description: "2-3 sentence plain-English explanation of the score.",
      },
    },
    required: ["matchScore", "scoreBreakdown", "summary"],
  };
}

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    originalScore: scoreSchema(
      "How the resume scores against the JD exactly as submitted, before any tailoring.",
    ),
    tailoredScore: scoreSchema(
      "How the tailored resume scores against the same JD, using the identical rubric as originalScore.",
    ),
    tailoredResume: {
      type: Type.OBJECT,
      description: "The rewritten resume as structured data, ready to render or export.",
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        phone: { type: Type.STRING },
        email: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        location: { type: Type.STRING },
        profile: { type: Type.STRING },
        objective: { type: Type.STRING },
        coreStrengths: { type: Type.ARRAY, items: BULLET_SCHEMA },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              dates: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: BULLET_SCHEMA },
            },
            required: ["title", "company", "location", "dates", "bullets"],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              program: { type: Type.STRING },
              institution: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["program", "institution", "date"],
          },
        },
      },
      required: [
        "name",
        "title",
        "phone",
        "email",
        "linkedin",
        "location",
        "profile",
        "objective",
        "coreStrengths",
        "experience",
        "education",
      ],
    },
    coverLetter: {
      type: Type.STRING,
      description: "The full tailored cover letter as plain text.",
    },
    keyChanges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Short bullet points describing what changed in the resume and why.",
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          why: { type: Type.STRING, description: "Why this matters for the role." },
          howToLearn: {
            type: Type.STRING,
            description: "A concrete, actionable way to close this gap.",
          },
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
        },
        required: ["skill", "why", "howToLearn", "priority"],
      },
    },
  },
  required: [
    "originalScore",
    "tailoredScore",
    "tailoredResume",
    "coverLetter",
    "keyChanges",
    "skillGaps",
  ],
};

function clampScore(n: unknown): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Strips any trailing colon the model added, since renderers append their own. */
function cleanLabel(v: unknown): string {
  return str(v).trim().replace(/:+\s*$/, "");
}

function normalizeBullet(b: unknown): ResumeBullet {
  const obj = typeof b === "object" && b !== null ? (b as Record<string, unknown>) : {};
  return { label: cleanLabel(obj.label), text: str(obj.text) };
}

function normalizeBullets(arr: unknown): ResumeBullet[] {
  return Array.isArray(arr) ? arr.map(normalizeBullet) : [];
}

function normalizeExperience(e: unknown): ResumeExperienceEntry {
  const obj = typeof e === "object" && e !== null ? (e as Record<string, unknown>) : {};
  return {
    title: str(obj.title),
    company: str(obj.company),
    location: str(obj.location),
    dates: str(obj.dates),
    bullets: normalizeBullets(obj.bullets),
  };
}

function normalizeScore(raw: unknown): ScoreResult {
  const obj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const breakdown = (obj.scoreBreakdown as Record<string, unknown>) ?? {};
  return {
    matchScore: clampScore(obj.matchScore),
    scoreBreakdown: {
      skillsMatch: clampScore(breakdown.skillsMatch),
      experienceMatch: clampScore(breakdown.experienceMatch),
      keywordAlignment: clampScore(breakdown.keywordAlignment),
      overallPresentation: clampScore(breakdown.overallPresentation),
    },
    summary: str(obj.summary),
  };
}

function normalizeResult(raw: Record<string, unknown>): AnalysisResult {
  const skillGaps = Array.isArray(raw.skillGaps) ? raw.skillGaps : [];
  const keyChanges = Array.isArray(raw.keyChanges) ? raw.keyChanges : [];
  const resume =
    typeof raw.tailoredResume === "object" && raw.tailoredResume !== null
      ? (raw.tailoredResume as Record<string, unknown>)
      : {};
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const education = Array.isArray(resume.education) ? resume.education : [];

  return {
    originalScore: normalizeScore(raw.originalScore),
    tailoredScore: normalizeScore(raw.tailoredScore),
    tailoredResume: {
      name: str(resume.name),
      title: str(resume.title),
      phone: str(resume.phone),
      email: str(resume.email),
      linkedin: str(resume.linkedin),
      location: str(resume.location),
      profile: str(resume.profile),
      objective: str(resume.objective),
      coreStrengths: normalizeBullets(resume.coreStrengths),
      experience: experience.map(normalizeExperience),
      education: education
        .filter((ed): ed is Record<string, unknown> => typeof ed === "object" && ed !== null)
        .map((ed) => ({
          program: str(ed.program),
          institution: str(ed.institution),
          date: str(ed.date),
        })),
    },
    coverLetter: str(raw.coverLetter),
    keyChanges: keyChanges.filter((c): c is string => typeof c === "string"),
    skillGaps: skillGaps
      .filter(
        (g): g is Record<string, unknown> =>
          typeof g === "object" && g !== null,
      )
      .map((g) => ({
        skill: str(g.skill),
        why: str(g.why),
        howToLearn: str(g.howToLearn),
        priority:
          g.priority === "high" || g.priority === "medium" || g.priority === "low"
            ? g.priority
            : "medium",
      })),
  };
}

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
): Promise<AnalysisResult> {
  const ai = getClient();

  const userMessage = `CANDIDATE RESUME:\n"""\n${resumeText}\n"""\n\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""`;

  let responseText: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || MODEL,
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
    responseText = response.text;
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AnalysisError(`AI request failed: ${err.message}`);
    }
    throw err;
  }

  if (!responseText) {
    throw new AnalysisError("The AI didn't return a structured analysis. Please try again.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AnalysisError("The AI response wasn't valid JSON. Please try again.");
  }

  return normalizeResult(parsed as Record<string, unknown>);
}
